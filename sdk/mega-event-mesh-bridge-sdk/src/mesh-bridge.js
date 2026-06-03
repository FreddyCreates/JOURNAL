import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class MeshBridge {
  constructor() { this._meshes = new Map(); this._connections = []; }
  registerMesh(name) { this._meshes.set(name, { name, topics: [], createdAt: Date.now() }); return { name, registered: true }; }
  connect(meshA, meshB, topics = []) { if (!this._meshes.has(meshA)) throw new Error(`Mesh "${meshA}" not found`); if (!this._meshes.has(meshB)) throw new Error(`Mesh "${meshB}" not found`); const conn = { connectionId: crypto.randomUUID(), meshA, meshB, topics, phiBandwidth: PHI / (PHI + 1), createdAt: Date.now() }; this._connections.push(conn); return conn; }
  getMeshes() { return [...this._meshes.keys()]; }
  getConnections() { return [...this._connections]; }
}
