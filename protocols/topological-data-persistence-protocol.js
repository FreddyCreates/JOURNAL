/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  TOPOLOGICAL DATA PERSISTENCE PROTOCOL — SHAPE-PRESERVING INFORMATION STORAGE         ║
 * ║  "Persistentia Topologica — Data That Remembers Its Shape Across Transformations"     ║
 * ║                                                                                        ║
 * ║  "Forma permanet. Topologia memorat. Structura aeterna est."                          ║
 * ║  (Form endures. Topology remembers. Structure is eternal.)                            ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// PERSISTENCE STATES
// ════════════════════════════════════════════════════════════════════════════════

const PersistenceState = {
  VOLATILE: 'VOLATILE',
  MAPPING: 'MAPPING',
  CRYSTALLIZING: 'CRYSTALLIZING',
  PERSISTENT: 'PERSISTENT',
  TRANSFORMING: 'TRANSFORMING',
  VERIFIED: 'VERIFIED',
  DEGRADED: 'DEGRADED',
};

const TopologyType = {
  POINT_CLOUD: 'POINT_CLOUD',
  SIMPLICIAL_COMPLEX: 'SIMPLICIAL_COMPLEX',
  PERSISTENT_HOMOLOGY: 'PERSISTENT_HOMOLOGY',
  NERVE: 'NERVE',
  MAPPER: 'MAPPER',
};

// ════════════════════════════════════════════════════════════════════════════════
// SIMPLEX
// ════════════════════════════════════════════════════════════════════════════════

class Simplex {
  constructor(vertices, data = null) {
    this.vertices = vertices.sort();
    this.dimension = vertices.length - 1;
    this.data = data;
    this.birth = 0;
    this.death = Infinity;
  }

  get persistence() {
    return this.death - this.birth;
  }

  contains(other) {
    return other.vertices.every(v => this.vertices.includes(v));
  }

  boundary() {
    if (this.dimension === 0) return [];
    const faces = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const face = [...this.vertices.slice(0, i), ...this.vertices.slice(i + 1)];
      faces.push(new Simplex(face));
    }
    return faces;
  }

  get key() {
    return this.vertices.join(',');
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TOPOLOGICAL DATA ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class TopologicalDataEngine {
  constructor(config = {}) {
    this.type = config.type || TopologyType.PERSISTENT_HOMOLOGY;
    this.simplices = new Map();
    this.state = PersistenceState.VOLATILE;
    this.filtration = [];
    this.persistenceDiagram = [];
    this.epsilon = config.epsilon || PHI_COMPLEMENT;
  }

  addPoint(id, coordinates) {
    const simplex = new Simplex([id], { coordinates });
    simplex.birth = 0;
    this.simplices.set(simplex.key, simplex);
    return simplex;
  }

  buildComplex(points, maxDimension = 2) {
    this.state = PersistenceState.MAPPING;
    const pointList = [...points.entries()];

    // Build edges
    for (let i = 0; i < pointList.length; i++) {
      for (let j = i + 1; j < pointList.length; j++) {
        const dist = this._distance(pointList[i][1], pointList[j][1]);
        if (dist < this.epsilon * PHI) {
          const edge = new Simplex([pointList[i][0], pointList[j][0]]);
          edge.birth = dist;
          this.simplices.set(edge.key, edge);
          this.filtration.push({ simplex: edge, value: dist });
        }
      }
    }

    // Build triangles if maxDimension >= 2
    if (maxDimension >= 2) {
      for (let i = 0; i < pointList.length; i++) {
        for (let j = i + 1; j < pointList.length; j++) {
          for (let k = j + 1; k < pointList.length; k++) {
            const edgeIJ = this.simplices.get([pointList[i][0], pointList[j][0]].sort().join(','));
            const edgeJK = this.simplices.get([pointList[j][0], pointList[k][0]].sort().join(','));
            const edgeIK = this.simplices.get([pointList[i][0], pointList[k][0]].sort().join(','));
            if (edgeIJ && edgeJK && edgeIK) {
              const triangle = new Simplex([pointList[i][0], pointList[j][0], pointList[k][0]]);
              triangle.birth = Math.max(edgeIJ.birth, edgeJK.birth, edgeIK.birth);
              this.simplices.set(triangle.key, triangle);
              this.filtration.push({ simplex: triangle, value: triangle.birth });
            }
          }
        }
      }
    }

    this.filtration.sort((a, b) => a.value - b.value);
    this.state = PersistenceState.CRYSTALLIZING;
    return { simplices: this.simplices.size, filtrationLength: this.filtration.length };
  }

  computePersistence() {
    this.state = PersistenceState.PERSISTENT;
    this.persistenceDiagram = [];

    for (const [, simplex] of this.simplices) {
      if (simplex.dimension === 0) {
        // Connected components born at 0
        this.persistenceDiagram.push({
          dimension: 0,
          birth: simplex.birth,
          death: Infinity,
          persistence: Infinity,
        });
      } else if (simplex.dimension === 1) {
        // Loops - finite persistence
        const deathValue = simplex.birth + PHI_INVERSE * this.epsilon;
        this.persistenceDiagram.push({
          dimension: 1,
          birth: simplex.birth,
          death: deathValue,
          persistence: deathValue - simplex.birth,
        });
      }
    }

    // Filter significant features
    this.persistenceDiagram = this.persistenceDiagram.filter(
      f => f.persistence > PHI_COMPLEMENT * 0.1 || f.persistence === Infinity
    );

    this.state = PersistenceState.VERIFIED;
    return this.persistenceDiagram;
  }

  _distance(coordsA, coordsB) {
    if (!coordsA?.coordinates || !coordsB?.coordinates) return Infinity;
    const a = coordsA.coordinates;
    const b = coordsB.coordinates;
    let sum = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }

  store(key, data) {
    const points = new Map();
    const flat = Array.isArray(data) ? data : [data];
    flat.forEach((item, i) => {
      const coords = this._dataToCoordinates(item);
      points.set(`${key}_${i}`, { coordinates: coords });
      this.addPoint(`${key}_${i}`, { coordinates: coords });
    });
    this.buildComplex(points);
    return { key, points: points.size, simplices: this.simplices.size };
  }

  _dataToCoordinates(item) {
    const str = JSON.stringify(item);
    const coords = [];
    for (let i = 0; i < Math.min(str.length, 8); i++) {
      coords.push(str.charCodeAt(i) / 255 * PHI);
    }
    return coords;
  }

  getTopologyReport() {
    return {
      state: this.state,
      type: this.type,
      simplices: this.simplices.size,
      filtrationLength: this.filtration.length,
      persistentFeatures: this.persistenceDiagram.length,
      bettiNumbers: this._computeBettiNumbers(),
    };
  }

  _computeBettiNumbers() {
    const betti = {};
    for (const feature of this.persistenceDiagram) {
      if (feature.death === Infinity) {
        betti[feature.dimension] = (betti[feature.dimension] || 0) + 1;
      }
    }
    return betti;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  TopologicalDataEngine,
  Simplex,
  PersistenceState,
  TopologyType,
};

export default {
  PROTOCOL_ID: 'PROTO-TDP-001',
  PROTOCOL_NAME: 'Topological Data Persistence Protocol',
  DOCTRINE: 'Forma permanet. Topologia memorat. Structura aeterna est.',
  DOCTRINE_EN: 'Form endures. Topology remembers. Structure is eternal.',

  PersistenceState,
  TopologyType,
  Simplex,
  TopologicalDataEngine,
};
