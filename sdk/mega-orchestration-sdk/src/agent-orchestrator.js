import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class AgentOrchestrator {
  constructor(config = {}) {
    this.maxAgents = config.maxAgents ?? 128;
    this.coordinationMode = config.coordinationMode ?? 'phi-harmonic';
    this.heartbeatInterval = config.heartbeatInterval ?? 873;
    this._agents = new Map();
    this._taskLog = [];
  }

  registerAgent(agentConfig) {
    if (this._agents.size >= this.maxAgents) throw new Error('Max agents reached');
    const agentId = crypto.randomUUID();
    const phiSlot = (this._agents.size + 1) * PHI % 1;
    const agent = { agentId, capabilities: agentConfig.capabilities ?? [], status: 'idle', registeredAt: Date.now(), phiSlot, tasks: [] };
    this._agents.set(agentId, agent);
    return { agentId, capabilities: agent.capabilities, status: 'idle', registeredAt: agent.registeredAt, phiSlot };
  }

  assignTask(agentId, task) {
    const agent = this._agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    const assignment = { taskId: crypto.randomUUID(), agentId, task, assignedAt: Date.now(), status: 'assigned' };
    agent.tasks.push(assignment);
    agent.status = 'busy';
    this._taskLog.push(assignment);
    return { ...assignment };
  }

  broadcast(message) {
    const deliveries = [];
    for (const [id, agent] of this._agents) {
      deliveries.push({ agentId: id, delivered: true, timestamp: Date.now() });
    }
    return { message, deliveredTo: deliveries.length, deliveries };
  }

  getAgent(agentId) {
    const agent = this._agents.get(agentId);
    return agent ? { ...agent, tasks: [...agent.tasks] } : undefined;
  }

  getAgentsByCapability(capability) {
    return [...this._agents.values()].filter(a => a.capabilities.includes(capability)).map(a => ({ ...a }));
  }

  getOrchestrationState() {
    const agents = [...this._agents.values()];
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'busy').length,
      idleAgents: agents.filter(a => a.status === 'idle').length,
      tasksPending: this._taskLog.filter(t => t.status === 'assigned').length,
      throughput: this._taskLog.length
    };
  }

  deregisterAgent(agentId) {
    return this._agents.delete(agentId);
  }
}
