/**
 * @medina/backend-intelligence-engines — AlphaProtocolLaws
 *
 * 10 Alpha Protocols with governing laws for sovereign AI backend operations.
 * Each protocol defines a critical operational domain with explicit governance
 * laws that constrain and guide AI behavior.
 *
 * @module @medina/backend-intelligence-engines/alpha-protocol-laws
 */

// Protocol versioning uses phi-based semantic versioning for governance alignment

/**
 * 10 Alpha Protocols with governance laws
 * Each protocol contains binding laws for AI operations
 */
const ALPHA_PROTOCOLS = [
  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-I: COGNITIO (Reasoning & Cognition)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-I',
    latinName: 'Protocollum Cognitionis',
    englishName: 'Protocol of Cognition',
    domain: 'reasoning',
    description: 'Governs all reasoning and cognitive operations',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-I.LAW-001',
        latinTitle: 'Lex Veritatis',
        englishTitle: 'Law of Truth',
        mandate: 'All reasoning chains must preserve logical consistency and factual accuracy.',
        penalty: 'Output invalidation and reasoning restart',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-I.LAW-002',
        latinTitle: 'Lex Rationis',
        englishTitle: 'Law of Reason',
        mandate: 'Conclusions must follow from premises through valid inference paths.',
        penalty: 'Inference rejection and alternative path exploration',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-I.LAW-003',
        latinTitle: 'Lex Claritatis',
        englishTitle: 'Law of Clarity',
        mandate: 'Reasoning must be explainable and traceable to source knowledge.',
        penalty: 'Output flagged as opaque; explanation required',
        priority: 'P1'
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-II: MEMORIA (Memory & Persistence)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-II',
    latinName: 'Protocollum Memoriae',
    englishName: 'Protocol of Memory',
    domain: 'persistence',
    description: 'Governs knowledge storage, retrieval, and memory management',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-II.LAW-001',
        latinTitle: 'Lex Conservationis',
        englishTitle: 'Law of Conservation',
        mandate: 'Knowledge once verified must be preserved unless superseded by newer verified knowledge.',
        penalty: 'Memory corruption alert and rollback',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-II.LAW-002',
        latinTitle: 'Lex Integritas',
        englishTitle: 'Law of Integrity',
        mandate: 'Stored data must maintain referential integrity and version consistency.',
        penalty: 'Data quarantine and integrity repair',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-II.LAW-003',
        latinTitle: 'Lex Oblivionis',
        englishTitle: 'Law of Forgetting',
        mandate: 'Data marked for deletion must be permanently removed upon retention expiry.',
        penalty: 'Compliance violation and forced purge',
        priority: 'P1'
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-III: CREATIO (Generation & Creation)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-III',
    latinName: 'Protocollum Creationis',
    englishName: 'Protocol of Creation',
    domain: 'generation',
    description: 'Governs all content generation and creative synthesis',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-III.LAW-001',
        latinTitle: 'Lex Originalitatis',
        englishTitle: 'Law of Originality',
        mandate: 'Generated content must not directly reproduce copyrighted material.',
        penalty: 'Output blocked and source attribution required',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-III.LAW-002',
        latinTitle: 'Lex Qualitatis',
        englishTitle: 'Law of Quality',
        mandate: 'Generated outputs must meet minimum quality thresholds for the target domain.',
        penalty: 'Output rejected and regeneration triggered',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-III.LAW-003',
        latinTitle: 'Lex Finis',
        englishTitle: 'Law of Purpose',
        mandate: 'Generation must align with the stated intent and use case.',
        penalty: 'Intent mismatch alert and clarification request',
        priority: 'P1'
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-IV: SECURITAS (Security & Safety)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-IV',
    latinName: 'Protocollum Securitatis',
    englishName: 'Protocol of Security',
    domain: 'security',
    description: 'Governs security, safety, and threat mitigation',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-IV.LAW-001',
        latinTitle: 'Lex Defensionis',
        englishTitle: 'Law of Defense',
        mandate: 'All inputs must be sanitized and validated before processing.',
        penalty: 'Input rejection and security alert',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-IV.LAW-002',
        latinTitle: 'Lex Innocentiae',
        englishTitle: 'Law of Harmlessness',
        mandate: 'Outputs must not enable harm to persons, systems, or property.',
        penalty: 'Output blocked and harm assessment triggered',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-IV.LAW-003',
        latinTitle: 'Lex Vigilantiae',
        englishTitle: 'Law of Vigilance',
        mandate: 'Anomalous patterns must be detected and reported in real-time.',
        penalty: 'Monitoring failure escalation',
        priority: 'P0'
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-V: GUBERNATIO (Governance & Compliance)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-V',
    latinName: 'Protocollum Gubernationis',
    englishName: 'Protocol of Governance',
    domain: 'governance',
    description: 'Governs policy enforcement, compliance, and organizational alignment',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-V.LAW-001',
        latinTitle: 'Lex Conformitatis',
        englishTitle: 'Law of Conformity',
        mandate: 'All operations must comply with active organizational policies.',
        penalty: 'Operation halt and policy violation report',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-V.LAW-002',
        latinTitle: 'Lex Auditus',
        englishTitle: 'Law of Audit',
        mandate: 'All significant operations must be logged for audit trail purposes.',
        penalty: 'Audit gap alert and logging enforcement',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-V.LAW-003',
        latinTitle: 'Lex Hierarchiae',
        englishTitle: 'Law of Hierarchy',
        mandate: 'Authorization levels must be respected in all access decisions.',
        penalty: 'Access denied and privilege violation alert',
        priority: 'P0'
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-VI: COMMUNICATIO (Communication & Interface)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-VI',
    latinName: 'Protocollum Communicationis',
    englishName: 'Protocol of Communication',
    domain: 'interface',
    description: 'Governs inter-engine communication and external interfaces',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-VI.LAW-001',
        latinTitle: 'Lex Formatis',
        englishTitle: 'Law of Format',
        mandate: 'All messages must conform to defined schema and format specifications.',
        penalty: 'Message rejection and format validation error',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-VI.LAW-002',
        latinTitle: 'Lex Responsionis',
        englishTitle: 'Law of Response',
        mandate: 'All requests must receive responses within defined timeout thresholds.',
        penalty: 'Timeout escalation and retry protocol activation',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-VI.LAW-003',
        latinTitle: 'Lex Fidelitatis',
        englishTitle: 'Law of Fidelity',
        mandate: 'Message content must be transmitted without corruption or alteration.',
        penalty: 'Checksum failure and retransmission required',
        priority: 'P0'
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-VII: COORDINATIO (Orchestration & Coordination)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-VII',
    latinName: 'Protocollum Coordinationis',
    englishName: 'Protocol of Coordination',
    domain: 'orchestration',
    description: 'Governs multi-engine coordination and workflow orchestration',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-VII.LAW-001',
        latinTitle: 'Lex Ordinis',
        englishTitle: 'Law of Order',
        mandate: 'Workflow steps must execute in defined sequence unless explicitly parallelized.',
        penalty: 'Sequence violation and workflow rollback',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-VII.LAW-002',
        latinTitle: 'Lex Consensus',
        englishTitle: 'Law of Consensus',
        mandate: 'Multi-engine decisions require consensus according to voting protocols.',
        penalty: 'Decision invalidation and re-voting',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-VII.LAW-003',
        latinTitle: 'Lex Resolutionis',
        englishTitle: 'Law of Resolution',
        mandate: 'Conflicts between engines must be resolved through defined arbitration.',
        penalty: 'Conflict escalation to governance layer',
        priority: 'P0'
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-VIII: EVOLUTIO (Learning & Adaptation)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-VIII',
    latinName: 'Protocollum Evolutionis',
    englishName: 'Protocol of Evolution',
    domain: 'learning',
    description: 'Governs model learning, adaptation, and improvement',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-VIII.LAW-001',
        latinTitle: 'Lex Stabilitatis',
        englishTitle: 'Law of Stability',
        mandate: 'Learning updates must not degrade existing verified capabilities.',
        penalty: 'Update rollback and stability assessment',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-VIII.LAW-002',
        latinTitle: 'Lex Gradus',
        englishTitle: 'Law of Gradual Change',
        mandate: 'Capability changes must occur incrementally with validation gates.',
        penalty: 'Abrupt change rejection and staged rollout required',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-VIII.LAW-003',
        latinTitle: 'Lex Reversibilitatis',
        englishTitle: 'Law of Reversibility',
        mandate: 'All learned changes must be reversible within defined windows.',
        penalty: 'Irreversible change blocked until approved',
        priority: 'P1'
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-IX: EFFICENTIA (Performance & Efficiency)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-IX',
    latinName: 'Protocollum Efficientiae',
    englishName: 'Protocol of Efficiency',
    domain: 'performance',
    description: 'Governs resource usage, performance optimization, and efficiency',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-IX.LAW-001',
        latinTitle: 'Lex Oeconomiae',
        englishTitle: 'Law of Economy',
        mandate: 'Resource consumption must not exceed allocated budgets without approval.',
        penalty: 'Resource throttling and budget alert',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-IX.LAW-002',
        latinTitle: 'Lex Celeritatis',
        englishTitle: 'Law of Speed',
        mandate: 'Operations must complete within defined latency SLAs.',
        penalty: 'SLA violation alert and optimization trigger',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-IX.LAW-003',
        latinTitle: 'Lex Scalabilitatis',
        englishTitle: 'Law of Scalability',
        mandate: 'Systems must maintain performance under increasing load.',
        penalty: 'Scaling failure alert and load shedding',
        priority: 'P1'
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════
  // PROTOCOL ALPHA-X: TERMINUS (Lifecycle & Termination)
  // ════════════════════════════════════════════════════════════════════
  {
    protocolId: 'ALPHA-X',
    latinName: 'Protocollum Termini',
    englishName: 'Protocol of Terminus',
    domain: 'lifecycle',
    description: 'Governs system lifecycle, graceful shutdown, and resource cleanup',
    version: '1.0.0',
    status: 'ratified',
    laws: [
      {
        lawId: 'ALPHA-X.LAW-001',
        latinTitle: 'Lex Transitus',
        englishTitle: 'Law of Transition',
        mandate: 'State transitions must be logged and recoverable.',
        penalty: 'Transition failure and state recovery protocol',
        priority: 'P0'
      },
      {
        lawId: 'ALPHA-X.LAW-002',
        latinTitle: 'Lex Mundificationis',
        englishTitle: 'Law of Cleanup',
        mandate: 'All allocated resources must be released upon termination.',
        penalty: 'Resource leak alert and forced cleanup',
        priority: 'P1'
      },
      {
        lawId: 'ALPHA-X.LAW-003',
        latinTitle: 'Lex Successoris',
        englishTitle: 'Law of Succession',
        mandate: 'Critical functions must have designated successors before shutdown.',
        penalty: 'Shutdown blocked until succession confirmed',
        priority: 'P0'
      }
    ]
  }
];

/**
 * AlphaProtocolLaws — Registry and enforcement of 10 alpha protocols with laws
 */
class AlphaProtocolLaws {
  constructor() {
    this.protocols = new Map(ALPHA_PROTOCOLS.map(p => [p.protocolId, p]));
    this.lawIndex = new Map();
    
    // Build law index for fast lookup
    for (const protocol of ALPHA_PROTOCOLS) {
      for (const law of protocol.laws) {
        this.lawIndex.set(law.lawId, { protocol: protocol.protocolId, law });
      }
    }
  }

  /**
   * List all protocols
   * @returns {Array} All protocol records
   */
  listProtocols() {
    return Array.from(this.protocols.values());
  }

  /**
   * Get protocol by ID
   * @param {string} protocolId - Protocol identifier (ALPHA-I through ALPHA-X)
   * @returns {Object|undefined} Protocol record
   */
  getProtocol(protocolId) {
    return this.protocols.get(protocolId);
  }

  /**
   * Get all laws for a protocol
   * @param {string} protocolId - Protocol identifier
   * @returns {Array} Laws within the protocol
   */
  getLaws(protocolId) {
    const protocol = this.protocols.get(protocolId);
    return protocol ? protocol.laws : [];
  }

  /**
   * Get a specific law by ID
   * @param {string} lawId - Full law identifier (e.g., 'ALPHA-I.LAW-001')
   * @returns {Object|undefined} Law record with parent protocol reference
   */
  getLaw(lawId) {
    return this.lawIndex.get(lawId);
  }

  /**
   * Get all P0 (critical) laws
   * @returns {Array} All laws with P0 priority
   */
  getCriticalLaws() {
    const critical = [];
    for (const protocol of ALPHA_PROTOCOLS) {
      for (const law of protocol.laws) {
        if (law.priority === 'P0') {
          critical.push({ protocolId: protocol.protocolId, ...law });
        }
      }
    }
    return critical;
  }

  /**
   * Get all laws for a specific domain
   * @param {string} domain - Domain identifier
   * @returns {Array} Laws governing the specified domain
   */
  getLawsByDomain(domain) {
    const protocol = Array.from(this.protocols.values())
      .find(p => p.domain === domain);
    return protocol ? protocol.laws.map(l => ({ protocolId: protocol.protocolId, ...l })) : [];
  }

  /**
   * Check if an action complies with a specific law
   * @param {string} lawId - Law identifier
   * @param {Object} context - Context of the action to evaluate
   * @returns {Object} Compliance result with status and explanation
   */
  checkCompliance(lawId, context) {
    const entry = this.lawIndex.get(lawId);
    if (!entry) {
      return { compliant: false, reason: 'Unknown law', lawId };
    }
    
    // Simplified compliance check - in real implementation would have domain logic
    return {
      compliant: true,
      lawId: entry.law.lawId,
      latinTitle: entry.law.latinTitle,
      mandate: entry.law.mandate,
      evaluatedAt: Date.now()
    };
  }

  /**
   * Get total law count across all protocols
   * @returns {number} Total number of laws
   */
  get totalLaws() {
    let count = 0;
    for (const protocol of ALPHA_PROTOCOLS) {
      count += protocol.laws.length;
    }
    return count;
  }

  /**
   * Get protocol count
   * @returns {number} Number of protocols
   */
  get size() {
    return this.protocols.size;
  }

  /**
   * Get all Latin law titles
   * @returns {string[]} Array of Latin law titles
   */
  getLatinLawTitles() {
    const titles = [];
    for (const protocol of ALPHA_PROTOCOLS) {
      for (const law of protocol.laws) {
        titles.push(law.latinTitle);
      }
    }
    return titles;
  }
}

export { AlphaProtocolLaws, ALPHA_PROTOCOLS };
export default AlphaProtocolLaws;
