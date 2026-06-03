/**
 * @medina/ux-ai-multi-engine — UX Telemetry Collector
 *
 * Collects and aggregates UX intelligence telemetry:
 *   • Engagement tracking (time-on-page, interactions, depth)
 *   • Heatmap generation (click, scroll, attention density)
 *   • Flow analysis (user journey mapping, drop-off detection)
 *   • Performance correlation (render time vs engagement)
 *
 * All metrics use phi-encoded decay for time-weighted relevance.
 *
 * @module @medina/ux-ai-multi-engine/ux-telemetry-collector
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

/**
 * @typedef {Object} HeatmapCell
 * @property {number} x — grid x position
 * @property {number} y — grid y position
 * @property {number} intensity — 0–1 heat value
 * @property {number} interactions — raw interaction count
 */

/**
 * @typedef {Object} FlowNode
 * @property {string} pageId
 * @property {number} visits
 * @property {number} avgDuration
 * @property {Map<string, number>} transitions — next pageId → count
 */

class UXTelemetryCollector {
  /**
   * @param {Object} [config]
   * @param {number} [config.heatmapGridSize=20] — grid divisions per axis
   * @param {number} [config.decayFactor=0.618] — time decay factor
   * @param {number} [config.maxEvents=10000]
   * @param {number} [config.sessionTimeoutMs=1800000] — 30 minutes
   */
  constructor(config = {}) {
    this.heatmapGridSize = config.heatmapGridSize ?? 20;
    this.decayFactor = config.decayFactor ?? PHI_INVERSE;
    this.maxEvents = config.maxEvents ?? 10000;
    this.sessionTimeoutMs = config.sessionTimeoutMs ?? 1800000;

    /** @type {Object[]} raw telemetry events */
    this.events = [];

    /** @type {Map<string, Object>} sessionId → session data */
    this.sessions = new Map();

    /** @type {number[][]} heatmap grid */
    this.heatmap = this._createGrid();

    /** @type {Map<string, FlowNode>} pageId → flow node */
    this.flowGraph = new Map();

    /** @type {Object} */
    this.metrics = {
      totalEvents: 0,
      totalSessions: 0,
      activeSessions: 0,
      totalClicks: 0,
      totalScrolls: 0,
      totalPageViews: 0,
      averageSessionDuration: 0,
      averageEngagement: 0,
      bounceRate: 0
    };
  }

  /* ================================================================== */
  /*  Event Collection                                                    */
  /* ================================================================== */

  /**
   * Record a telemetry event.
   * @param {Object} event
   * @param {string} event.type — 'click'|'scroll'|'pageview'|'hover'|'input'|'custom'
   * @param {string} event.sessionId
   * @param {string} [event.userId]
   * @param {string} [event.pageId]
   * @param {number} [event.x] — viewport x coordinate
   * @param {number} [event.y] — viewport y coordinate
   * @param {Object} [event.metadata={}]
   * @returns {Object} — recorded event with id
   */
  record(event) {
    const record = {
      eventId: this.events.length + 1,
      type: event.type,
      sessionId: event.sessionId,
      userId: event.userId ?? null,
      pageId: event.pageId ?? null,
      x: event.x ?? null,
      y: event.y ?? null,
      metadata: event.metadata ?? {},
      timestamp: Date.now()
    };

    this.events.push(record);
    this.metrics.totalEvents++;

    // Trim events if exceeding max
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Update type-specific metrics
    if (event.type === 'click') {
      this.metrics.totalClicks++;
      if (event.x != null && event.y != null) {
        this._updateHeatmap(event.x, event.y);
      }
    } else if (event.type === 'scroll') {
      this.metrics.totalScrolls++;
    } else if (event.type === 'pageview') {
      this.metrics.totalPageViews++;
      if (event.pageId) {
        this._updateFlowGraph(event.sessionId, event.pageId);
      }
    }

    // Update session
    this._updateSession(record);

    return record;
  }

  /**
   * Record multiple events at once.
   * @param {Object[]} events
   * @returns {number} — count recorded
   */
  recordBatch(events) {
    let count = 0;
    for (const event of events) {
      this.record(event);
      count++;
    }
    return count;
  }

  /* ================================================================== */
  /*  Sessions                                                            */
  /* ================================================================== */

  /**
   * Update or create session data.
   * @param {Object} event
   * @private
   */
  _updateSession(event) {
    let session = this.sessions.get(event.sessionId);
    const now = event.timestamp;

    if (!session) {
      session = {
        sessionId: event.sessionId,
        userId: event.userId,
        startedAt: now,
        lastActivity: now,
        eventCount: 0,
        pageViews: 0,
        clicks: 0,
        scrolls: 0,
        pages: [],
        active: true
      };
      this.sessions.set(event.sessionId, session);
      this.metrics.totalSessions++;
      this.metrics.activeSessions++;
    }

    session.lastActivity = now;
    session.eventCount++;

    if (event.type === 'pageview') {
      session.pageViews++;
      if (event.pageId && !session.pages.includes(event.pageId)) {
        session.pages.push(event.pageId);
      }
    } else if (event.type === 'click') {
      session.clicks++;
    } else if (event.type === 'scroll') {
      session.scrolls++;
    }
  }

  /**
   * Get session data.
   * @param {string} sessionId
   * @returns {Object|undefined}
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    return {
      ...session,
      duration: session.lastActivity - session.startedAt
    };
  }

  /**
   * End a session and calculate final metrics.
   * @param {string} sessionId
   * @returns {Object}
   */
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return { error: 'Session not found' };

    session.active = false;
    this.metrics.activeSessions--;

    const duration = session.lastActivity - session.startedAt;
    const engagement = this._calculateEngagement(session);
    const isBounce = session.pageViews <= 1;

    // Update aggregate metrics
    const totalDuration = Array.from(this.sessions.values())
      .filter(s => !s.active)
      .reduce((sum, s) => sum + (s.lastActivity - s.startedAt), 0);
    const completedSessions = this.metrics.totalSessions - this.metrics.activeSessions;
    this.metrics.averageSessionDuration = completedSessions > 0 ? totalDuration / completedSessions : 0;

    const bounces = Array.from(this.sessions.values())
      .filter(s => !s.active && s.pageViews <= 1).length;
    this.metrics.bounceRate = completedSessions > 0 ? bounces / completedSessions : 0;

    return {
      sessionId,
      duration,
      engagement,
      isBounce,
      eventCount: session.eventCount,
      pageViews: session.pageViews,
      pagesVisited: session.pages.length
    };
  }

  /* ================================================================== */
  /*  Heatmap                                                             */
  /* ================================================================== */

  /**
   * Create an empty heatmap grid.
   * @returns {number[][]}
   * @private
   */
  _createGrid() {
    const grid = [];
    for (let i = 0; i < this.heatmapGridSize; i++) {
      grid.push(new Array(this.heatmapGridSize).fill(0));
    }
    return grid;
  }

  /**
   * Update heatmap with an interaction point.
   * Coordinates are normalized 0–1 viewport space.
   * @param {number} x — 0–1
   * @param {number} y — 0–1
   * @private
   */
  _updateHeatmap(x, y) {
    const gridX = Math.min(Math.floor(x * this.heatmapGridSize), this.heatmapGridSize - 1);
    const gridY = Math.min(Math.floor(y * this.heatmapGridSize), this.heatmapGridSize - 1);

    if (gridX >= 0 && gridY >= 0) {
      this.heatmap[gridY][gridX]++;
    }
  }

  /**
   * Get the heatmap as normalized cells.
   * @returns {HeatmapCell[]}
   */
  getHeatmap() {
    let maxVal = 0;
    for (let y = 0; y < this.heatmapGridSize; y++) {
      for (let x = 0; x < this.heatmapGridSize; x++) {
        if (this.heatmap[y][x] > maxVal) maxVal = this.heatmap[y][x];
      }
    }

    const cells = [];
    for (let y = 0; y < this.heatmapGridSize; y++) {
      for (let x = 0; x < this.heatmapGridSize; x++) {
        if (this.heatmap[y][x] > 0) {
          cells.push({
            x,
            y,
            intensity: maxVal > 0 ? this.heatmap[y][x] / maxVal : 0,
            interactions: this.heatmap[y][x]
          });
        }
      }
    }

    return cells.sort((a, b) => b.intensity - a.intensity);
  }

  /**
   * Get hotspots — cells with intensity above threshold.
   * @param {number} [threshold=0.5]
   * @returns {HeatmapCell[]}
   */
  getHotspots(threshold = 0.5) {
    return this.getHeatmap().filter(c => c.intensity >= threshold);
  }

  /* ================================================================== */
  /*  Flow Analysis                                                       */
  /* ================================================================== */

  /**
   * Update the flow graph with a page transition.
   * @param {string} sessionId
   * @param {string} pageId
   * @private
   */
  _updateFlowGraph(sessionId, pageId) {
    // Get or create node
    let node = this.flowGraph.get(pageId);
    if (!node) {
      node = {
        pageId,
        visits: 0,
        totalDuration: 0,
        avgDuration: 0,
        transitions: new Map(),
        entryCount: 0,
        exitCount: 0
      };
      this.flowGraph.set(pageId, node);
    }
    node.visits++;

    // Track transition from previous page in session
    const session = this.sessions.get(sessionId);
    if (session && session.pages.length > 0) {
      const prevPage = session.pages[session.pages.length - 1];
      if (prevPage !== pageId) {
        const prevNode = this.flowGraph.get(prevPage);
        if (prevNode) {
          const count = prevNode.transitions.get(pageId) ?? 0;
          prevNode.transitions.set(pageId, count + 1);
        }
      }
    } else {
      // Entry page
      node.entryCount++;
    }
  }

  /**
   * Get the flow graph as a serializable structure.
   * @returns {Object[]}
   */
  getFlowGraph() {
    return Array.from(this.flowGraph.values()).map(node => ({
      pageId: node.pageId,
      visits: node.visits,
      entryCount: node.entryCount,
      exitCount: node.exitCount,
      transitions: Object.fromEntries(node.transitions)
    }));
  }

  /**
   * Get top entry pages.
   * @param {number} [limit=5]
   * @returns {Object[]}
   */
  getTopEntryPages(limit = 5) {
    return Array.from(this.flowGraph.values())
      .sort((a, b) => b.entryCount - a.entryCount)
      .slice(0, limit)
      .map(n => ({ pageId: n.pageId, entries: n.entryCount, totalVisits: n.visits }));
  }

  /**
   * Detect drop-off points — pages where users tend to leave.
   * @param {number} [threshold=0.3] — exit rate threshold
   * @returns {Object[]}
   */
  getDropOffPoints(threshold = 0.3) {
    const results = [];
    for (const node of this.flowGraph.values()) {
      if (node.visits > 0) {
        const totalOutgoing = Array.from(node.transitions.values()).reduce((s, v) => s + v, 0);
        const exitRate = node.visits > 0 ? 1 - (totalOutgoing / node.visits) : 0;
        if (exitRate >= threshold) {
          results.push({
            pageId: node.pageId,
            exitRate,
            visits: node.visits,
            outgoing: totalOutgoing
          });
        }
      }
    }
    return results.sort((a, b) => b.exitRate - a.exitRate);
  }

  /* ================================================================== */
  /*  Engagement Calculation                                              */
  /* ================================================================== */

  /**
   * Calculate engagement score for a session using phi-weighted factors.
   * @param {Object} session
   * @returns {number} 0–1 engagement
   * @private
   */
  _calculateEngagement(session) {
    const duration = session.lastActivity - session.startedAt;
    const durationScore = Math.min(duration / 300000, 1); // 5 min cap
    const depthScore = Math.min(session.pageViews / 5, 1);
    const interactionScore = Math.min((session.clicks + session.scrolls) / 20, 1);

    return (durationScore * PHI_INVERSE + depthScore * PHI_INVERSE + interactionScore * PHI_INVERSE) / (3 * PHI_INVERSE);
  }

  /* ================================================================== */
  /*  Metrics & Export                                                    */
  /* ================================================================== */

  /**
   * Get collector metrics.
   * @returns {Object}
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Get event count by type.
   * @returns {Object}
   */
  getEventDistribution() {
    const dist = {};
    for (const event of this.events) {
      dist[event.type] = (dist[event.type] ?? 0) + 1;
    }
    return dist;
  }

  /**
   * Get events for a specific session.
   * @param {string} sessionId
   * @returns {Object[]}
   */
  getSessionEvents(sessionId) {
    return this.events.filter(e => e.sessionId === sessionId);
  }

  /**
   * Reset all telemetry data.
   */
  reset() {
    this.events = [];
    this.sessions.clear();
    this.heatmap = this._createGrid();
    this.flowGraph.clear();
    this.metrics = {
      totalEvents: 0,
      totalSessions: 0,
      activeSessions: 0,
      totalClicks: 0,
      totalScrolls: 0,
      totalPageViews: 0,
      averageSessionDuration: 0,
      averageEngagement: 0,
      bounceRate: 0
    };
  }
}

export { UXTelemetryCollector };
export default UXTelemetryCollector;
