/**
 * TPL Parser Tests
 * Terminal Protocol Language Parser Tests
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { TPLParser } from '../tpl/src/parser.js';

test('TPL Parser - Basic Protocol', () => {
  const source = `
    PROTOCOL TEST_PROTOCOL {
      VERSION "1.0.0"
    }
  `;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'TPL');
  assert.strictEqual(ast.protocols.length, 1);
  assert.strictEqual(ast.protocols[0].name, 'TEST_PROTOCOL');
  assert.strictEqual(ast.protocols[0].metadata.version, '1.0.0');
});

test('TPL Parser - Protocol with Channel', () => {
  const source = `
    PROTOCOL MESH {
      VERSION "1.0.0"

      CHANNEL COMMAND_WIRE {
        TRANSPORT: WEBSOCKET
        SECURITY: ENCRYPTED
      }
    }
  `;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  const protocol = ast.protocols[0];
  assert.strictEqual(protocol.channels.length, 1);
  assert.strictEqual(protocol.channels[0].name, 'COMMAND_WIRE');
  assert.deepStrictEqual(protocol.channels[0].properties.TRANSPORT, { type: 'Keyword', value: 'WEBSOCKET' });
  assert.deepStrictEqual(protocol.channels[0].properties.SECURITY, { type: 'Keyword', value: 'ENCRYPTED' });
});

test('TPL Parser - Protocol with Message', () => {
  const source = `
    PROTOCOL API {
      VERSION "1.0.0"

      MESSAGE COMMAND {
        action: STRING REQUIRED
        payload: JSON OPTIONAL
        timestamp: NUMBER REQUIRED
      }
    }
  `;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  const protocol = ast.protocols[0];
  assert.strictEqual(protocol.messages.length, 1);
  
  const message = protocol.messages[0];
  assert.strictEqual(message.name, 'COMMAND');
  assert.strictEqual(message.fields.length, 3);
  
  assert.strictEqual(message.fields[0].name, 'action');
  assert.deepStrictEqual(message.fields[0].fieldType, { type: 'Primitive', name: 'STRING' });
  assert.strictEqual(message.fields[0].required, true);
  
  assert.strictEqual(message.fields[1].name, 'payload');
  assert.deepStrictEqual(message.fields[1].fieldType, { type: 'Primitive', name: 'JSON' });
  assert.strictEqual(message.fields[1].required, false);
});

test('TPL Parser - Protocol with Handler', () => {
  const source = `
    PROTOCOL EVENTS {
      VERSION "1.0.0"

      HANDLER ON_COMMAND ON RECEIVE {
        LOG received_command
        EMIT response
      }
    }
  `;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  const protocol = ast.protocols[0];
  assert.strictEqual(protocol.handlers.length, 1);
  
  const handler = protocol.handlers[0];
  assert.strictEqual(handler.name, 'ON_COMMAND');
  assert.strictEqual(handler.event, 'RECEIVE');
  assert.strictEqual(handler.actions.length, 2);
  assert.strictEqual(handler.actions[0].actionType, 'LOG');
  assert.strictEqual(handler.actions[1].actionType, 'EMIT');
});

test('TPL Parser - Multiple Channels', () => {
  const source = `
    PROTOCOL MULTI {
      VERSION "1.0.0"

      CHANNEL PRIMARY {
        TRANSPORT: HTTP
        SECURITY: SIGNED
      }

      CHANNEL SECONDARY {
        TRANSPORT: WEBSOCKET
        SECURITY: PUBLIC
      }

      CHANNEL BACKUP {
        TRANSPORT: ICP_CALL
        SECURITY: ZERO_KNOWLEDGE
      }
    }
  `;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  const protocol = ast.protocols[0];
  assert.strictEqual(protocol.channels.length, 3);
  assert.strictEqual(protocol.channels[0].name, 'PRIMARY');
  assert.strictEqual(protocol.channels[1].name, 'SECONDARY');
  assert.strictEqual(protocol.channels[2].name, 'BACKUP');
});

test('TPL Parser - Full Protocol', () => {
  const source = `
    PROTOCOL TERMINAL_MESH {
      VERSION "2.0.0"
      ENCODED_ID "TERM.MESH.PROTOCOL"

      CHANNEL COMMAND_WIRE {
        TRANSPORT: WEBSOCKET
        SECURITY: ENCRYPTED
        QOS: EXACTLY_ONCE
      }

      MESSAGE COMMAND {
        action: STRING REQUIRED
        payload: JSON OPTIONAL
      }

      MESSAGE RESPONSE {
        status: STRING REQUIRED
        data: JSON OPTIONAL
      }

      HANDLER PROCESS_COMMAND ON RECEIVE {
        VALIDATE payload
        LOG processing
        EMIT response
      }
    }
  `;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  const protocol = ast.protocols[0];
  assert.strictEqual(protocol.name, 'TERMINAL_MESH');
  assert.strictEqual(protocol.metadata.version, '2.0.0');
  assert.strictEqual(protocol.metadata.encodedId, 'TERM.MESH.PROTOCOL');
  assert.strictEqual(protocol.channels.length, 1);
  assert.strictEqual(protocol.messages.length, 2);
  assert.strictEqual(protocol.handlers.length, 1);
});

test('TPL Parser - Array Type in Message', () => {
  const source = `
    PROTOCOL ARRAY_TEST {
      VERSION "1.0.0"

      MESSAGE LIST_ITEMS {
        items: ARRAY<STRING> REQUIRED
      }
    }
  `;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  const message = ast.protocols[0].messages[0];
  assert.strictEqual(message.fields[0].name, 'items');
  assert.strictEqual(message.fields[0].fieldType.type, 'Array');
  assert.deepStrictEqual(message.fields[0].fieldType.elementType, { type: 'Primitive', name: 'STRING' });
});

test('TPL Parser - Multiple Protocols', () => {
  const source = `
    PROTOCOL PROTO_A {
      VERSION "1.0.0"
    }

    PROTOCOL PROTO_B {
      VERSION "2.0.0"
    }
  `;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.protocols.length, 2);
  assert.strictEqual(ast.protocols[0].name, 'PROTO_A');
  assert.strictEqual(ast.protocols[1].name, 'PROTO_B');
});

test('TPL Parser - Comments', () => {
  const source = `
    // This is a comment
    PROTOCOL WITH_COMMENTS {
      VERSION "1.0.0"
      // Another comment
    }
  `;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.protocols.length, 1);
  assert.strictEqual(ast.protocols[0].name, 'WITH_COMMENTS');
});

test('TPL Parser - Empty Program', () => {
  const source = ``;

  const parser = new TPLParser();
  const ast = parser.parse(source);

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.protocols.length, 0);
});
