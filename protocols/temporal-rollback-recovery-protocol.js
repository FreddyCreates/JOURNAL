/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  TEMPORAL ROLLBACK RECOVERY PROTOCOL — TIME-BASED STATE RESTORATION                   ║
 * ║  "Reversio Temporalis — Recovery Through Time-Anchored State Snapshots"               ║
 * ║                                                                                        ║
 * ║  "Tempus omnia sanat. Memoria restaurat. Organismus resurgit."                        ║
 * ║  (Time heals all. Memory restores. The organism rises again.)                         ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// TEMPORAL STATES
// ════════════════════════════════════════════════════════════════════════════════

const TemporalState = {
  RECORDING: 'RECORDING',
  STABLE: 'STABLE',
  FAULT_DETECTED: 'FAULT_DETECTED',
  ROLLING_BACK: 'ROLLING_BACK',
  RECOVERING: 'RECOVERING',
  RESTORED: 'RESTORED',
  DIVERGED: 'DIVERGED',
};

const SnapshotType = {
  FULL: 'FULL',
  INCREMENTAL: 'INCREMENTAL',
  CHECKPOINT: 'CHECKPOINT',
  EMERGENCY: 'EMERGENCY',
};

const FaultSeverity = {
  MINOR: { level: 1, rollbackDepth: 1, label: 'MINOR' },
  MODERATE: { level: 2, rollbackDepth: 3, label: 'MODERATE' },
  SEVERE: { level: 3, rollbackDepth: 5, label: 'SEVERE' },
  CRITICAL: { level: 4, rollbackDepth: 10, label: 'CRITICAL' },
  CATASTROPHIC: { level: 5, rollbackDepth: -1, label: 'CATASTROPHIC' }, // Full rollback
};

// ════════════════════════════════════════════════════════════════════════════════
// TEMPORAL SNAPSHOT
// ════════════════════════════════════════════════════════════════════════════════

class TemporalSnapshot {
  constructor(state, type = SnapshotType.INCREMENTAL) {
    this.snapshotId = `SNAP::${Date.now()}::${Math.random().toString(36).slice(2, 8)}`;
    this.type = type;
    this.state = JSON.parse(JSON.stringify(state)); // Deep clone
    this.timestamp = Date.now();
    this.hash = this.computeHash(state);
    this.parentHash = null;
    this.metadata = {
      size: JSON.stringify(state).length,
      coherence: state.coherence || 0,
      generation: state.generation || 0,
    };
  }

  computeHash(state) {
    // Simple deterministic hash for state fingerprinting
    const str = JSON.stringify(state);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return `H${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }

  verify() {
    const currentHash = this.computeHash(this.state);
    return currentHash === this.hash;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TEMPORAL TIMELINE
// ════════════════════════════════════════════════════════════════════════════════

class TemporalTimeline {
  constructor(maxSnapshots = 100) {
    this.snapshots = [];
    this.maxSnapshots = maxSnapshots;
    this.branchPoints = [];
    this.currentIndex = -1;
    this.createdAt = Date.now();
  }

  record(state, type = SnapshotType.INCREMENTAL) {
    const snapshot = new TemporalSnapshot(state, type);

    if (this.snapshots.length > 0) {
      snapshot.parentHash = this.snapshots[this.snapshots.length - 1].hash;
    }

    this.snapshots.push(snapshot);
    this.currentIndex = this.snapshots.length - 1;

    // Evict old snapshots using φ-based retention
    if (this.snapshots.length > this.maxSnapshots) {
      this.evictOldSnapshots();
    }

    return snapshot;
  }

  evictOldSnapshots() {
    // Keep checkpoints and emergency snapshots longer
    // Evict incrementals using φ-decay
    const now = Date.now();
    this.snapshots = this.snapshots.filter((snap, idx) => {
      if (snap.type === SnapshotType.CHECKPOINT || snap.type === SnapshotType.EMERGENCY) {
        return true;
      }
      if (idx >= this.snapshots.length - 10) return true; // Keep last 10

      const age = now - snap.timestamp;
      const maxAge = 3600000 * PHI; // φ hours in ms
      return age < maxAge;
    });
    this.currentIndex = this.snapshots.length - 1;
  }

  getSnapshot(index) {
    if (index < 0 || index >= this.snapshots.length) return null;
    return this.snapshots[index];
  }

  getSnapshotByHash(hash) {
    return this.snapshots.find(s => s.hash === hash) || null;
  }

  findClosestBefore(timestamp) {
    for (let i = this.snapshots.length - 1; i >= 0; i--) {
      if (this.snapshots[i].timestamp <= timestamp) {
        return { index: i, snapshot: this.snapshots[i] };
      }
    }
    return null;
  }

  getLength() {
    return this.snapshots.length;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TEMPORAL ROLLBACK ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class TemporalRollbackEngine {
  constructor(entityId) {
    this.entityId = entityId;
    this.timeline = new TemporalTimeline();
    this.state = TemporalState.RECORDING;
    this.rollbackHistory = [];
    this.faultLog = [];
    this.recoveryMetrics = {
      totalRollbacks: 0,
      successfulRecoveries: 0,
      averageRecoveryTime: 0,
      lastRecoveryAt: null,
    };
    this.checkpointInterval = 10; // Every 10 snapshots
    this.snapshotsSinceCheckpoint = 0;
  }

  snapshot(currentState) {
    this.snapshotsSinceCheckpoint++;

    const type = this.snapshotsSinceCheckpoint >= this.checkpointInterval
      ? SnapshotType.CHECKPOINT
      : SnapshotType.INCREMENTAL;

    if (type === SnapshotType.CHECKPOINT) {
      this.snapshotsSinceCheckpoint = 0;
    }

    const snap = this.timeline.record(currentState, type);
    this.state = TemporalState.RECORDING;
    return snap;
  }

  emergencySnapshot(currentState) {
    const snap = this.timeline.record(currentState, SnapshotType.EMERGENCY);
    return snap;
  }

  detectFault(faultInfo) {
    this.state = TemporalState.FAULT_DETECTED;
    this.faultLog.push({
      ...faultInfo,
      detectedAt: Date.now(),
      timelineIndex: this.timeline.currentIndex,
    });

    return {
      severity: faultInfo.severity,
      suggestedRollbackDepth: faultInfo.severity.rollbackDepth,
      availableSnapshots: this.timeline.getLength(),
    };
  }

  rollback(depth = 1) {
    const startTime = Date.now();
    this.state = TemporalState.ROLLING_BACK;

    const targetIndex = Math.max(0, this.timeline.currentIndex - depth);
    const targetSnapshot = this.timeline.getSnapshot(targetIndex);

    if (!targetSnapshot) {
      this.state = TemporalState.DIVERGED;
      return { success: false, reason: 'NO_SNAPSHOT_AVAILABLE' };
    }

    if (!targetSnapshot.verify()) {
      // Snapshot corrupted, try one further back
      if (targetIndex > 0) {
        return this.rollback(depth + 1);
      }
      this.state = TemporalState.DIVERGED;
      return { success: false, reason: 'SNAPSHOT_CORRUPTED' };
    }

    this.state = TemporalState.RECOVERING;

    const recoveryTime = Date.now() - startTime;
    this.recoveryMetrics.totalRollbacks++;
    this.recoveryMetrics.successfulRecoveries++;
    this.recoveryMetrics.lastRecoveryAt = Date.now();
    this.recoveryMetrics.averageRecoveryTime =
      (this.recoveryMetrics.averageRecoveryTime * (this.recoveryMetrics.totalRollbacks - 1) + recoveryTime)
      / this.recoveryMetrics.totalRollbacks;

    this.rollbackHistory.push({
      from: this.timeline.currentIndex,
      to: targetIndex,
      depth,
      recoveryTime,
      timestamp: Date.now(),
    });

    this.timeline.currentIndex = targetIndex;
    this.state = TemporalState.RESTORED;

    return {
      success: true,
      restoredState: targetSnapshot.state,
      snapshotId: targetSnapshot.snapshotId,
      recoveryTime,
      rolledBackSteps: depth,
    };
  }

  rollbackToTimestamp(timestamp) {
    const target = this.timeline.findClosestBefore(timestamp);
    if (!target) {
      return { success: false, reason: 'NO_SNAPSHOT_BEFORE_TIMESTAMP' };
    }
    const depth = this.timeline.currentIndex - target.index;
    return this.rollback(depth);
  }

  getStatus() {
    return {
      entityId: this.entityId,
      state: this.state,
      timelineLength: this.timeline.getLength(),
      currentIndex: this.timeline.currentIndex,
      faultCount: this.faultLog.length,
      recoveryMetrics: this.recoveryMetrics,
      lastRollback: this.rollbackHistory[this.rollbackHistory.length - 1] || null,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  TemporalState,
  SnapshotType,
  FaultSeverity,
  TemporalSnapshot,
  TemporalTimeline,
  TemporalRollbackEngine,
};

export default {
  PROTOCOL_ID: 'PROTO-TRR-001',
  PROTOCOL_NAME: 'Temporal Rollback Recovery Protocol',
  DOCTRINE: 'Tempus omnia sanat. Memoria restaurat. Organismus resurgit.',
  DOCTRINE_EN: 'Time heals all. Memory restores. The organism rises again.',

  TemporalState,
  SnapshotType,
  FaultSeverity,
  TemporalSnapshot,
  TemporalTimeline,
  TemporalRollbackEngine,
};
