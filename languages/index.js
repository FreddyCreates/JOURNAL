/**
 * COGNITIVE LANGUAGE UNIVERSE — CENTRAL INDEX
 * All 40 languages with parsers, compilers, and runtimes
 * @module cognitive-languages
 */

// Import all parsers locally for use in CognitiveLanguageRegistry
import { CPLLParser } from './cpl-l/src/parser.js';
import { CPLCParser } from './cpl-c/src/parser.js';
import { OCLParser } from './ocl/src/parser.js';
import { CPLPParser } from './cpl-p/src/parser.js';
import { CILParser } from './cil/src/parser.js';
import { CDLParser } from './cdl/src/parser.js';
import { PILParser } from './pil/src/parser.js';
import { SILParser } from './sil/src/parser.js';
import { TILParser } from './til/src/parser.js';
import { RILParser } from './ril/src/parser.js';
import { RELParser } from './rel/src/parser.js';
import { COLParser } from './col/src/parser.js';
import { ROLParser } from './rol/src/parser.js';
import { WFLParser } from './wfl/src/parser.js';
import { CXLParser } from './cxl/src/parser.js';
import { EXLParser } from './exl/src/parser.js';
import { MYLParser } from './myl/src/parser.js';
import { STLParser } from './stl/src/parser.js';
import { SYMParser } from './sym/src/parser.js';
import { RSLParser } from './rsl/src/parser.js';
import { ACLParser } from './acl/src/parser.js';
import { TPLParser } from './tpl/src/parser.js';
import { HCLParser } from './hcl/src/parser.js';
import { SPLParser } from './spl/src/parser.js';
import { EDLParser } from './edl/src/parser.js';
import { PWLParser } from './pwl/src/parser.js';
import { TSLParser } from './tsl/src/parser.js';
import { ISLParser } from './isl/src/parser.js';
import { FALParser } from './fal/src/parser.js';
import { BCLParser } from './bcl/src/parser.js';
import { ECLParser } from './ecl/src/parser.js';
import { IILParser } from './iil/src/parser.js';
import { DDLParser } from './ddl/src/parser.js';
import { MMLParser } from './mml/src/parser.js';
import { SCLParser } from './scl/src/parser.js';
import { ERRParser } from './err/src/parser.js';
import { CHLParser } from './chl/src/parser.js';
import { FRLParser } from './frl/src/parser.js';
import { LMLParser } from './lml/src/parser.js';
import { UELParser } from './uel/src/parser.js';

// Re-export all parsers
export {
  CPLLParser, CPLCParser, OCLParser, CPLPParser,
  CILParser, CDLParser, PILParser, SILParser, TILParser, RILParser,
  RELParser, COLParser, ROLParser,
  WFLParser, CXLParser, EXLParser,
  MYLParser, STLParser, SYMParser,
  RSLParser, ACLParser, TPLParser, HCLParser,
  SPLParser, EDLParser, PWLParser, TSLParser, ISLParser, FALParser,
  BCLParser, ECLParser, IILParser,
  DDLParser, MMLParser, SCLParser,
  ERRParser, CHLParser, FRLParser,
  LMLParser, UELParser
};

/**
 * Cognitive Language Registry
 * Central registry for all 40 languages
 */
export class CognitiveLanguageRegistry {
  static languages = {
    // Core Law Stack
    'cpl-l': { name: 'Cognitive Law Language', parser: CPLLParser, status: 'active', priority: 'P0' },
    'cpl-c': { name: 'Cognitive Contract Language', parser: CPLCParser, status: 'planned', priority: 'P0' },
    'ocl': { name: 'Organism Contract Language', parser: OCLParser, status: 'planned', priority: 'P0' },
    'cpl-p': { name: 'Cognitive Processing Language', parser: CPLPParser, status: 'planned', priority: 'P0' },

    // Inner Mind Stack
    'cil': { name: 'Cognitive Internal Language', parser: CILParser, status: 'planned', priority: 'P0' },
    'cdl': { name: 'Cognitive Doctrine Language', parser: CDLParser, status: 'planned', priority: 'P0' },
    'pil': { name: 'Psyche Internal Language', parser: PILParser, status: 'planned', priority: 'P1' },
    'sil': { name: 'Self-Identity Language', parser: SILParser, status: 'planned', priority: 'P1' },
    'til': { name: 'Temporal Integration Language', parser: TILParser, status: 'planned', priority: 'P1' },
    'ril': { name: 'Repair & Integration Language', parser: RILParser, status: 'planned', priority: 'P1' },

    // Relational Stack
    'rel': { name: 'Relational Ecology Language', parser: RELParser, status: 'planned', priority: 'P1' },
    'col': { name: 'Collective Orchestration Language', parser: COLParser, status: 'planned', priority: 'P1' },
    'rol': { name: 'Role Language', parser: ROLParser, status: 'planned', priority: 'P2' },

    // Work/Creation Stack
    'wfl': { name: 'Work Flow Language', parser: WFLParser, status: 'planned', priority: 'P1' },
    'cxl': { name: 'Creation Language', parser: CXLParser, status: 'planned', priority: 'P1' },
    'exl': { name: 'Experiment Language', parser: EXLParser, status: 'planned', priority: 'P2' },

    // Narrative/Myth Stack
    'myl': { name: 'Mythic Language', parser: MYLParser, status: 'planned', priority: 'P1' },
    'stl': { name: 'Story Thread Language', parser: STLParser, status: 'planned', priority: 'P2' },
    'sym': { name: 'Symbolic Language', parser: SYMParser, status: 'planned', priority: 'P2' },

    // Worlds/Terminals Stack
    'rsl': { name: 'Realm Script Language', parser: RSLParser, status: 'planned', priority: 'P0' },
    'acl': { name: 'Atlas Configuration Language', parser: ACLParser, status: 'planned', priority: 'P0' },
    'tpl': { name: 'Terminal Protocol Language', parser: TPLParser, status: 'in-progress', priority: 'P0' },
    'hcl': { name: 'Host-Cognition Language', parser: HCLParser, status: 'planned', priority: 'P1' },

    // Education Stack
    'spl': { name: 'Study Pattern Language', parser: SPLParser, status: 'planned', priority: 'P1' },
    'edl': { name: 'Educational Doctrine Language', parser: EDLParser, status: 'planned', priority: 'P1' },
    'pwl': { name: 'Pathway Language', parser: PWLParser, status: 'planned', priority: 'P2' },
    'tsl': { name: 'Tool Scaffold Language', parser: TSLParser, status: 'planned', priority: 'P2' },
    'isl': { name: 'Institution Structure Language', parser: ISLParser, status: 'planned', priority: 'P2' },
    'fal': { name: 'Family Alignment Language', parser: FALParser, status: 'planned', priority: 'P2' },

    // Enterprise Stack
    'bcl': { name: 'Business Contract Language', parser: BCLParser, status: 'planned', priority: 'P1' },
    'ecl': { name: 'Enterprise Compliance Language', parser: ECLParser, status: 'planned', priority: 'P1' },
    'iil': { name: 'Integration Interface Language', parser: IILParser, status: 'planned', priority: 'P1' },

    // Infrastructure Stack
    'ddl': { name: 'Data Definition Language', parser: DDLParser, status: 'planned', priority: 'P1' },
    'mml': { name: 'Metrics & Monitoring Language', parser: MMLParser, status: 'planned', priority: 'P1' },
    'scl': { name: 'Scheduling & Coordination Language', parser: SCLParser, status: 'planned', priority: 'P1' },

    // Error/Chaos Stack
    'err': { name: 'Error Narrative Language', parser: ERRParser, status: 'planned', priority: 'P2' },
    'chl': { name: 'Chaos Handling Language', parser: CHLParser, status: 'planned', priority: 'P2' },
    'frl': { name: 'Fringe Language', parser: FRLParser, status: 'planned', priority: 'P1' },

    // Meta Stack
    'lml': { name: 'Language Meta Language', parser: LMLParser, status: 'in-progress', priority: 'P0' },
    'uel': { name: 'Universe Evolution Language', parser: UELParser, status: 'planned', priority: 'P0' }
  };

  /**
   * Get all languages
   */
  static getAllLanguages() {
    return Object.entries(this.languages).map(([id, lang]) => ({
      id,
      ...lang
    }));
  }

  /**
   * Get language by ID
   */
  static getLanguage(id) {
    return this.languages[id] || null;
  }

  /**
   * Get languages by stack
   */
  static getByStack(stack) {
    const stacks = {
      'core-law': ['cpl-l', 'cpl-c', 'ocl', 'cpl-p'],
      'inner-mind': ['cil', 'cdl', 'pil', 'sil', 'til', 'ril'],
      'relational': ['rel', 'col', 'rol'],
      'work-creation': ['wfl', 'cxl', 'exl'],
      'narrative-myth': ['myl', 'stl', 'sym'],
      'worlds-terminals': ['rsl', 'acl', 'tpl', 'hcl'],
      'education': ['spl', 'edl', 'pwl', 'tsl', 'isl', 'fal'],
      'enterprise': ['bcl', 'ecl', 'iil'],
      'infrastructure': ['ddl', 'mml', 'scl'],
      'error-chaos': ['err', 'chl', 'frl'],
      'meta': ['lml', 'uel']
    };

    const ids = stacks[stack] || [];
    return ids.map(id => ({ id, ...this.languages[id] }));
  }

  /**
   * Get languages by priority
   */
  static getByPriority(priority) {
    return Object.entries(this.languages)
      .filter(([_, lang]) => lang.priority === priority)
      .map(([id, lang]) => ({ id, ...lang }));
  }

  /**
   * Get languages by status
   */
  static getByStatus(status) {
    return Object.entries(this.languages)
      .filter(([_, lang]) => lang.status === status)
      .map(([id, lang]) => ({ id, ...lang }));
  }

  /**
   * Parse source code using appropriate language parser
   */
  static parse(languageId, sourceCode) {
    const lang = this.getLanguage(languageId);
    if (!lang) {
      throw new Error(`Unknown language: ${languageId}`);
    }
    if (!lang.parser) {
      throw new Error(`No parser available for ${languageId}`);
    }

    const parser = new lang.parser();
    return parser.parse(sourceCode);
  }
}

export default CognitiveLanguageRegistry;
