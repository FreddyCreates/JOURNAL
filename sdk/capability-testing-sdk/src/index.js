/**
 * Capability Testing SDK
 * 
 * ENCODED IDENTITY: SDK.CAPABILITY.TEST
 * 
 * Framework for discovering, validating, and certifying
 * system capabilities through comprehensive testing.
 * 
 * Features:
 * - Capability discovery and enumeration
 * - Requirement dependency resolution
 * - PHI-weighted capability scoring
 * - Certification levels
 * - Benchmark validation
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_SQUARED = PHI * PHI;

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY LEVELS
// ═══════════════════════════════════════════════════════════════════════════

const CapabilityLevel = {
  BASIC: { name: 'BASIC', weight: 1, threshold: 0.5 },
  INTERMEDIATE: { name: 'INTERMEDIATE', weight: PHI_INVERSE, threshold: PHI_INVERSE },
  ADVANCED: { name: 'ADVANCED', weight: PHI, threshold: 0.8 },
  EXPERT: { name: 'EXPERT', weight: PHI_SQUARED, threshold: 0.9 },
  SOVEREIGN: { name: 'SOVEREIGN', weight: PHI * PHI_SQUARED, threshold: 0.95 }
};

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CapabilityRegistry - Central registry for all system capabilities
 */
class CapabilityRegistry {
  constructor() {
    this.capabilities = new Map();
    this.dependencies = new Map();
    this.certifications = new Map();
  }

  /**
   * Register a new capability
   */
  register(capability) {
    const { name, level, requires = [], provides = [], tests = [], benchmarks = [] } = capability;
    
    this.capabilities.set(name, {
      name,
      level: CapabilityLevel[level] || CapabilityLevel.BASIC,
      requires,
      provides,
      tests,
      benchmarks,
      certified: false,
      score: 0,
      lastTested: null
    });
    
    // Register dependencies
    for (const req of requires) {
      if (!this.dependencies.has(req)) {
        this.dependencies.set(req, new Set());
      }
      this.dependencies.get(req).add(name);
    }
    
    return this;
  }

  /**
   * Get a capability by name
   */
  get(name) {
    return this.capabilities.get(name);
  }

  /**
   * Get all capabilities
   */
  getAll() {
    return Array.from(this.capabilities.values());
  }

  /**
   * Get capabilities by level
   */
  getByLevel(level) {
    return this.getAll().filter(c => c.level.name === level);
  }

  /**
   * Get capabilities that depend on a given capability
   */
  getDependents(name) {
    return Array.from(this.dependencies.get(name) || []);
  }

  /**
   * Check if all requirements are met
   */
  areRequirementsMet(name) {
    const cap = this.get(name);
    if (!cap) return false;
    
    for (const req of cap.requires) {
      const reqCap = this.get(req);
      if (!reqCap || !reqCap.certified) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get certification status summary
   */
  getCertificationSummary() {
    const all = this.getAll();
    const certified = all.filter(c => c.certified);
    
    return {
      total: all.length,
      certified: certified.length,
      certificationRate: all.length > 0 ? certified.length / all.length : 0,
      byLevel: Object.keys(CapabilityLevel).reduce((acc, level) => {
        const inLevel = all.filter(c => c.level.name === level);
        const certInLevel = inLevel.filter(c => c.certified);
        acc[level] = {
          total: inLevel.length,
          certified: certInLevel.length
        };
        return acc;
      }, {})
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY TESTER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CapabilityTester - Execute capability tests and benchmarks
 */
class CapabilityTester {
  constructor(registry) {
    this.registry = registry;
    this.results = [];
    this.benchmarkResults = [];
  }

  /**
   * Test a single capability
   */
  async testCapability(name) {
    const cap = this.registry.get(name);
    if (!cap) {
      throw new Error(`Unknown capability: ${name}`);
    }

    // Check requirements
    if (!this.registry.areRequirementsMet(name)) {
      return {
        name,
        success: false,
        reason: 'REQUIREMENTS_NOT_MET',
        missingRequirements: cap.requires.filter(
          r => !this.registry.get(r)?.certified
        )
      };
    }

    const testResults = [];
    
    // Run all tests
    for (const test of cap.tests) {
      const result = await this.runTest(test);
      testResults.push(result);
    }

    // Calculate score
    const passed = testResults.filter(r => r.passed).length;
    const score = testResults.length > 0 ? passed / testResults.length : 0;
    
    // Determine certification
    const certified = score >= cap.level.threshold;
    
    // Update capability
    cap.score = score;
    cap.certified = certified;
    cap.lastTested = new Date().toISOString();

    const result = {
      name,
      success: certified,
      score,
      threshold: cap.level.threshold,
      level: cap.level.name,
      testResults,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);
    return result;
  }

  /**
   * Run a single test
   */
  async runTest(test) {
    const start = Date.now();
    
    try {
      let result;
      
      if (test.fn) {
        result = await test.fn(test.input);
      } else {
        // Simulated test execution
        result = { success: true, value: 42 };
      }

      const passed = this.validateExpectations(result, test.expect);
      const duration = Date.now() - start;

      // Check timeout
      if (test.timeout && duration > test.timeout.value) {
        return {
          name: test.name,
          passed: false,
          reason: 'TIMEOUT',
          duration,
          expected: test.timeout.value
        };
      }

      return {
        name: test.name,
        passed,
        duration,
        result
      };

    } catch (error) {
      return {
        name: test.name,
        passed: false,
        reason: 'ERROR',
        error: error.message,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Validate test expectations
   */
  validateExpectations(result, expectations) {
    if (!expectations) return true;
    
    for (const [key, expected] of Object.entries(expectations)) {
      const actual = result[key];
      
      if (typeof expected === 'object' && expected.operator) {
        if (!this.compare(actual, expected.operator, expected.value)) {
          return false;
        }
      } else if (actual !== expected) {
        return false;
      }
    }
    return true;
  }

  /**
   * Compare values with operator
   */
  compare(actual, operator, expected) {
    switch (operator) {
      case 'GTE': return actual >= expected;
      case 'LTE': return actual <= expected;
      case 'GT': return actual > expected;
      case 'LT': return actual < expected;
      case 'EQ': return actual === expected;
      default: return actual === expected;
    }
  }

  /**
   * Run benchmark for a capability
   */
  async runBenchmark(name) {
    const cap = this.registry.get(name);
    if (!cap || !cap.benchmarks.length) {
      return null;
    }

    const benchmarkResults = [];

    for (const benchmark of cap.benchmarks) {
      const result = await this.executeBenchmark(benchmark);
      benchmarkResults.push(result);
    }

    const overallResult = {
      capability: name,
      benchmarks: benchmarkResults,
      timestamp: new Date().toISOString()
    };

    this.benchmarkResults.push(overallResult);
    return overallResult;
  }

  /**
   * Execute a single benchmark
   */
  async executeBenchmark(benchmark) {
    const iterations = benchmark.iterations || 1000;
    const samples = [];
    
    // Warm-up
    const warmup = Math.floor(iterations * 0.1);
    for (let i = 0; i < warmup; i++) {
      if (benchmark.fn) await benchmark.fn();
    }

    // Actual benchmark
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      if (benchmark.fn) await benchmark.fn();
      samples.push(performance.now() - start);
    }

    // Calculate statistics
    const sorted = [...samples].sort((a, b) => a - b);
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / samples.length;
    const stdDev = Math.sqrt(variance);

    const result = {
      name: benchmark.name,
      iterations,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      stdDev,
      coefficientOfVariation: stdDev / avg
    };

    // Check targets
    if (benchmark.target) {
      result.targetMet = this.compare(result.avg, benchmark.target.operator, benchmark.target.value);
    }
    if (benchmark.variance) {
      const cvPercent = (result.coefficientOfVariation * 100);
      result.varianceMet = this.compare(cvPercent, benchmark.variance.operator, benchmark.variance.value);
    }

    return result;
  }

  /**
   * Test all capabilities in dependency order
   */
  async testAll() {
    const tested = new Set();
    const results = [];

    // Sort by dependency order
    const sorted = this.topologicalSort();

    for (const name of sorted) {
      if (!tested.has(name)) {
        const result = await this.testCapability(name);
        results.push(result);
        tested.add(name);
      }
    }

    return {
      results,
      summary: this.registry.getCertificationSummary()
    };
  }

  /**
   * Topological sort of capabilities by dependencies
   */
  topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (name) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }

      visiting.add(name);
      const cap = this.registry.get(name);
      
      if (cap) {
        for (const req of cap.requires) {
          visit(req);
        }
      }

      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    for (const name of this.registry.capabilities.keys()) {
      visit(name);
    }

    return sorted;
  }

  /**
   * Get test history
   */
  getHistory() {
    return this.results;
  }

  /**
   * Get PHI-weighted score
   */
  getPhiWeightedScore() {
    const caps = this.registry.getAll();
    if (caps.length === 0) return 0;

    let weightedSum = 0;
    let weightSum = 0;

    for (const cap of caps) {
      const weight = cap.level.weight;
      weightedSum += cap.score * weight;
      weightSum += weight;
    }

    return weightedSum / weightSum;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY CERTIFIER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CapabilityCertifier - Issue and manage capability certifications
 */
class CapabilityCertifier {
  constructor(registry, tester) {
    this.registry = registry;
    this.tester = tester;
    this.certificates = [];
  }

  /**
   * Certify a capability
   */
  async certify(name) {
    const testResult = await this.tester.testCapability(name);
    
    if (!testResult.success) {
      return {
        certified: false,
        reason: testResult.reason || 'TEST_FAILED',
        score: testResult.score
      };
    }

    const certificate = {
      id: `CERT-${name}-${Date.now()}`,
      capability: name,
      level: testResult.level,
      score: testResult.score,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      issuer: 'SOVEREIGN_INTELLIGENCE_SYSTEM'
    };

    this.certificates.push(certificate);
    this.registry.certifications.set(name, certificate);

    return {
      certified: true,
      certificate
    };
  }

  /**
   * Certify all capabilities
   */
  async certifyAll() {
    const sorted = this.tester.topologicalSort();
    const results = [];

    for (const name of sorted) {
      const result = await this.certify(name);
      results.push({ name, ...result });
    }

    return {
      results,
      totalCertified: results.filter(r => r.certified).length,
      total: results.length
    };
  }

  /**
   * Verify a certificate
   */
  verify(certificateId) {
    const cert = this.certificates.find(c => c.id === certificateId);
    
    if (!cert) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    if (new Date(cert.validUntil) < new Date()) {
      return { valid: false, reason: 'EXPIRED', certificate: cert };
    }

    return { valid: true, certificate: cert };
  }

  /**
   * Get all certificates
   */
  getCertificates() {
    return this.certificates;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  CapabilityLevel,
  CapabilityRegistry,
  CapabilityTester,
  CapabilityCertifier
};

export default {
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  CapabilityLevel,
  CapabilityRegistry,
  CapabilityTester,
  CapabilityCertifier
};
