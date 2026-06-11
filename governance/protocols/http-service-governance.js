/**
 * HTTP Service Governance Protocol
 * 
 * Governs HTTP services: registration, health checks, rate limiting,
 * authentication, routing, circuit breaking, and service mesh governance.
 * 
 * Protocol ID: GOV-HTTP-001
 * Layer: Governance Macro
 * Authority: NEXUS + SENTINEL
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

export class HTTPServiceGovernanceProtocol {
  constructor() {
    this.id = 'GOV-HTTP-001';
    this.name = 'HTTP Service Governance Protocol';
    this.version = '1.0.0';
    this.status = 'ACTIVE';
    this.services = new Map();
    this.routes = [];
    this.healthChecks = [];
    this.circuitBreakers = new Map();
  }

  /**
   * Register an HTTP service
   */
  registerService(serviceId, config) {
    if (this.services.has(serviceId)) {
      return { success: false, reason: 'Service already registered' };
    }
    const service = {
      id: serviceId,
      name: config.name || serviceId,
      baseUrl: config.baseUrl,
      version: config.version || '1.0.0',
      status: 'registered',
      healthEndpoint: config.healthEndpoint || '/health',
      authRequired: config.authRequired !== false,
      rateLimit: config.rateLimit || { requests: 1000, windowMs: 60000 },
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      registeredAt: new Date().toISOString(),
      lastHealthCheck: null,
      healthStatus: 'unknown',
      requestCount: 0,
      errorCount: 0,
    };
    this.services.set(serviceId, service);
    this._initCircuitBreaker(serviceId);
    return { success: true, service };
  }

  /**
   * Activate a service (make it available for routing)
   */
  activateService(serviceId) {
    const service = this.services.get(serviceId);
    if (!service) return { success: false, reason: 'Service not found' };
    service.status = 'active';
    service.activatedAt = new Date().toISOString();
    return { success: true };
  }

  /**
   * Register a route
   */
  registerRoute(route) {
    const r = {
      id: `ROUTE-${Date.now()}-${this.routes.length}`,
      method: route.method || 'GET',
      path: route.path,
      serviceId: route.serviceId,
      authRequired: route.authRequired !== false,
      rateLimit: route.rateLimit || null,
      middleware: route.middleware || [],
      registeredAt: new Date().toISOString(),
    };
    this.routes.push(r);
    return { success: true, route: r };
  }

  /**
   * Perform health check on a service
   */
  healthCheck(serviceId) {
    const service = this.services.get(serviceId);
    if (!service) return { success: false, reason: 'Service not found' };

    // Simulate health check (in real impl would make HTTP call)
    const healthy = service.status === 'active' && 
                    this._getCircuitState(serviceId) !== 'open';

    service.lastHealthCheck = new Date().toISOString();
    service.healthStatus = healthy ? 'healthy' : 'unhealthy';

    const check = {
      serviceId,
      timestamp: new Date().toISOString(),
      status: service.healthStatus,
      responseTime: Math.random() * 100, // simulated
    };
    this.healthChecks.push(check);

    return { success: true, ...check };
  }

  /**
   * Record a request (for rate limiting and metrics)
   */
  recordRequest(serviceId, success = true) {
    const service = this.services.get(serviceId);
    if (!service) return { success: false, reason: 'Service not found' };

    service.requestCount++;
    if (!success) {
      service.errorCount++;
      this._recordFailure(serviceId);
    } else {
      this._recordSuccess(serviceId);
    }

    return {
      success: true,
      requestCount: service.requestCount,
      errorRate: service.requestCount > 0 ? service.errorCount / service.requestCount : 0,
    };
  }

  /**
   * Check rate limit for a service
   */
  checkRateLimit(serviceId, clientId) {
    const service = this.services.get(serviceId);
    if (!service) return { allowed: false, reason: 'Service not found' };
    // Simplified rate limit check (in production would use sliding window)
    return { allowed: true, remaining: service.rateLimit.requests - 1 };
  }

  /**
   * Get circuit breaker state
   */
  getCircuitState(serviceId) {
    return this._getCircuitState(serviceId);
  }

  /**
   * Get service mesh overview
   */
  getServiceMesh() {
    const services = [...this.services.values()];
    const activeServices = services.filter(s => s.status === 'active');
    const healthyServices = services.filter(s => s.healthStatus === 'healthy');

    return {
      totalServices: services.length,
      activeServices: activeServices.length,
      healthyServices: healthyServices.length,
      totalRoutes: this.routes.length,
      meshHealth: services.length > 0 ? healthyServices.length / services.length : 1.0,
      status: (healthyServices.length / Math.max(services.length, 1)) >= PHI_INV ? 'healthy' : 'degraded',
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        status: s.status,
        health: s.healthStatus,
        requests: s.requestCount,
        errorRate: s.requestCount > 0 ? s.errorCount / s.requestCount : 0,
        circuit: this._getCircuitState(s.id),
      })),
    };
  }

  /**
   * Decommission a service
   */
  decommissionService(serviceId, reason = 'deprecated') {
    const service = this.services.get(serviceId);
    if (!service) return { success: false, reason: 'Service not found' };
    service.status = 'decommissioned';
    service.decommissionedAt = new Date().toISOString();
    service.decommissionReason = reason;
    // Remove routes pointing to this service
    this.routes = this.routes.filter(r => r.serviceId !== serviceId);
    return { success: true };
  }

  _initCircuitBreaker(serviceId) {
    this.circuitBreakers.set(serviceId, {
      state: 'closed', // closed = healthy, open = broken, half-open = testing
      failures: 0,
      threshold: 5,
      lastFailure: null,
      cooldownMs: 30000,
    });
  }

  _getCircuitState(serviceId) {
    const cb = this.circuitBreakers.get(serviceId);
    if (!cb) return 'unknown';
    if (cb.state === 'open' && cb.lastFailure) {
      const elapsed = Date.now() - new Date(cb.lastFailure).getTime();
      if (elapsed > cb.cooldownMs) return 'half-open';
    }
    return cb.state;
  }

  _recordFailure(serviceId) {
    const cb = this.circuitBreakers.get(serviceId);
    if (!cb) return;
    cb.failures++;
    cb.lastFailure = new Date().toISOString();
    if (cb.failures >= cb.threshold) {
      cb.state = 'open';
    }
  }

  _recordSuccess(serviceId) {
    const cb = this.circuitBreakers.get(serviceId);
    if (!cb) return;
    if (cb.state === 'half-open') {
      cb.state = 'closed';
      cb.failures = 0;
    }
  }
}

export default HTTPServiceGovernanceProtocol;
