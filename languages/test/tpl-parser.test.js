/**
 * TPL Parser Tests
 * Terminal Protocol Language Parser Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { TPLParser } from '../tpl/src/parser.js';

describe('TPL Parser - Basic Protocol', () => {
  test('parses empty protocol', () => {
    const source = `
      PROTOCOL EMPTY_PROTOCOL {
        VERSION "1.0.0"
      }
    `;
    
    const parser = new TPLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.type, 'Program');
    assert.strictEqual(ast.language, 'TPL');
    assert.strictEqual(ast.protocols.length, 1);
    assert.strictEqual(ast.protocols[0].name, 'EMPTY_PROTOCOL');
  });

  test('parses protocol with channel', () => {
    const source = `
      PROTOCOL TEST_PROTOCOL {
        VERSION "1.0.0"
        
        CHANNEL COMMAND_WIRE {
          transport: WEBSOCKET
          security: ENCRYPTED
        }
      }
    `;
    
    const parser = new TPLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.protocols[0].channels.length, 1);
    assert.strictEqual(ast.protocols[0].channels[0].name, 'COMMAND_WIRE');
    // Channel properties are stored in a properties object
    assert.ok(ast.protocols[0].channels[0].properties);
  });

  test('parses protocol with message', () => {
    const source = `
      PROTOCOL TEST_PROTOCOL {
        VERSION "1.0.0"
        
        MESSAGE COMMAND {
          action: STRING REQUIRED
          payload: JSON OPTIONAL
        }
      }
    `;
    
    const parser = new TPLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.protocols[0].messages.length, 1);
    assert.strictEqual(ast.protocols[0].messages[0].name, 'COMMAND');
    assert.ok(ast.protocols[0].messages[0].fields.length >= 1);
  });

  test('parses multiple protocols', () => {
    const source = `
      PROTOCOL FIRST_PROTOCOL {
        VERSION "1.0.0"
      }
      
      PROTOCOL SECOND_PROTOCOL {
        VERSION "2.0.0"
      }
    `;
    
    const parser = new TPLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.protocols.length, 2);
    assert.strictEqual(ast.protocols[0].name, 'FIRST_PROTOCOL');
    assert.strictEqual(ast.protocols[1].name, 'SECOND_PROTOCOL');
  });
});

describe('TPL Parser - Channel Properties', () => {
  test('parses channel definition', () => {
    const source = `
      PROTOCOL Test {
        VERSION "1.0.0"
        CHANNEL WebChannel {
          transport: WEBSOCKET
        }
      }
    `;
    
    const parser = new TPLParser();
    const ast = parser.parse(source);
    
    assert.ok(ast.protocols[0].channels[0]);
    assert.strictEqual(ast.protocols[0].channels[0].name, 'WebChannel');
  });

  test('parses multiple channels', () => {
    const source = `
      PROTOCOL Test {
        VERSION "1.0.0"
        CHANNEL FirstChannel {
        }
        CHANNEL SecondChannel {
        }
      }
    `;
    
    const parser = new TPLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.protocols[0].channels.length, 2);
    assert.strictEqual(ast.protocols[0].channels[0].name, 'FirstChannel');
    assert.strictEqual(ast.protocols[0].channels[1].name, 'SecondChannel');
  });
});

describe('TPL Parser - Message Field Types', () => {
  test('parses STRING field type', () => {
    const source = `
      PROTOCOL TEST {
        VERSION "1.0.0"
        MESSAGE TEST_MSG {
          name: STRING REQUIRED
        }
      }
    `;
    
    const parser = new TPLParser();
    const ast = parser.parse(source);
    
    const field = ast.protocols[0].messages[0].fields[0];
    assert.strictEqual(field.name, 'name');
    assert.strictEqual(field.fieldType.name, 'STRING');
    assert.strictEqual(field.required, true);
  });

  test('parses OPTIONAL field', () => {
    const source = `
      PROTOCOL TEST {
        VERSION "1.0.0"
        MESSAGE TEST_MSG {
          data: JSON OPTIONAL
        }
      }
    `;
    
    const parser = new TPLParser();
    const ast = parser.parse(source);
    
    const field = ast.protocols[0].messages[0].fields[0];
    assert.strictEqual(field.required, false);
  });
});

describe('TPL Parser - Complete Protocol', () => {
  test('parses complete protocol with all elements', () => {
    const source = `
      PROTOCOL TERMINAL_MESH {
        VERSION "1.0.0"
        ENCODED_ID "MESH.PROTO.001"
        
        CHANNEL COMMAND_WIRE {
          transport: WEBSOCKET
          security: ENCRYPTED
        }
        
        CHANNEL STATUS_WIRE {
          transport: HTTP
          security: SIGNED
        }
        
        MESSAGE COMMAND {
          action: STRING REQUIRED
          target: STRING REQUIRED
        }
        
        MESSAGE STATUS {
          code: NUMBER REQUIRED
        }
      }
    `;
    
    const parser = new TPLParser();
    const ast = parser.parse(source);
    
    assert.strictEqual(ast.protocols[0].name, 'TERMINAL_MESH');
    assert.strictEqual(ast.protocols[0].channels.length, 2);
    assert.strictEqual(ast.protocols[0].messages.length, 2);
  });
});
