/**
 * COGNITIVE LANGUAGE CLI
 * Command-line interface for all 40 cognitive languages
 * @module @medina/cognitive-cli
 */

import { readFileSync } from 'fs';
import { CognitiveRuntime } from './runtime.js';
import { LMLCompiler } from './lml/src/compiler.js';

const runtime = new CognitiveRuntime();

/**
 * CLI Commands
 */
const commands = {
  /**
   * Execute a cognitive language file
   * Usage: cognitive exec <language> <file>
   */
  async exec(language, filePath) {
    try {
      const source = readFileSync(filePath, 'utf-8');
      const result = await runtime.execute(language, source);

      console.log('✅ Execution successful');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('❌ Execution failed:', error.message);
      process.exit(1);
    }
  },

  /**
   * Compile a cognitive language file
   * Usage: cognitive compile <language> <file> --target <motoko|javascript>
   */
  async compile(language, filePath, target = 'motoko') {
    try {
      const source = readFileSync(filePath, 'utf-8');
      const parser = runtime.parsers.get(language);
      const compiler = runtime.compilers.get(language);

      if (!parser) {
        throw new Error(`No parser for language: ${language}`);
      }
      if (!compiler) {
        throw new Error(`No compiler for language: ${language}`);
      }

      const ast = parser.parse(source);
      const compiled = compiler.compile(ast, target);

      console.log('✅ Compilation successful');
      console.log(compiled);
    } catch (error) {
      console.error('❌ Compilation failed:', error.message);
      process.exit(1);
    }
  },

  /**
   * Generate language from LML specification
   * Usage: cognitive generate <lml-file>
   */
  async generate(lmlFilePath) {
    try {
      const source = readFileSync(lmlFilePath, 'utf-8');
      const lmlCompiler = new LMLCompiler();
      const result = lmlCompiler.compile(source);

      console.log('✅ Language generation successful');
      console.log(`Generated: ${result.metadata.name}`);
      console.log(`Parser: ${result.parser.substring(0, 100)}...`);
      console.log(`Compiler: ${result.compiler.substring(0, 100)}...`);
    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      process.exit(1);
    }
  },

  /**
   * Verify compliance with a law
   * Usage: cognitive verify <law-file> <action>
   */
  async verify(lawFile, action) {
    try {
      const source = readFileSync(lawFile, 'utf-8');
      await runtime.execute('cpl-l', source);

      // Extract law name from file
      const lawMatch = source.match(/LAW\s+(\w+)/);
      const lawName = lawMatch ? lawMatch[1] : null;

      if (!lawName) {
        throw new Error('Could not extract law name from file');
      }

      const result = await runtime.verifyCompliance(lawName, action);

      if (result.compliant) {
        console.log('✅ Action is compliant');
      } else {
        console.log('❌ Action violates law');
      }

      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      process.exit(1);
    }
  },

  /**
   * Show runtime statistics
   * Usage: cognitive stats
   */
  async stats() {
    const stats = runtime.getStatistics();
    console.log('📊 Cognitive Runtime Statistics');
    console.log('================================');
    console.log(`Laws Loaded: ${stats.lawsLoaded}`);
    console.log(`Organisms Loaded: ${stats.organismsLoaded}`);
    console.log(`Protocols Loaded: ${stats.protocolsLoaded}`);
    console.log(`Parsers Available: ${stats.parsersAvailable}`);
    console.log(`Compilers Available: ${stats.compilersAvailable}`);
    console.log(`Languages: ${stats.languages.join(', ')}`);
  },

  /**
   * Interactive REPL
   * Usage: cognitive repl <language>
   */
  async repl(language) {
    console.log(`🧠 Cognitive ${language.toUpperCase()} REPL`);
    console.log('Type "exit" to quit\n');

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${language}> `
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();

      if (input === 'exit') {
        rl.close();
        return;
      }

      if (input === '') {
        rl.prompt();
        return;
      }

      try {
        const result = await runtime.execute(language, input);
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('Error:', error.message);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  },

  /**
   * Show help
   */
  help() {
    console.log(`
🧠 Cognitive Language Universe CLI

USAGE:
  cognitive <command> [args]

COMMANDS:
  exec <lang> <file>           Execute a cognitive language file
  compile <lang> <file>        Compile to Motoko or JavaScript
  generate <lml-file>          Generate language from LML spec
  verify <law-file> <action>   Verify compliance with a law
  stats                        Show runtime statistics
  repl <lang>                  Interactive REPL for a language
  help                         Show this help message

LANGUAGES:
  cpl-l    Cognitive Law Language
  cpl-c    Cognitive Contract Language
  ocl      Organism Contract Language
  cpl-p    Cognitive Processing Language
  tpl      Terminal Protocol Language
  acl      Atlas Configuration Language
  cdl      Cognitive Doctrine Language
  ... and 33 more

EXAMPLES:
  cognitive exec cpl-l laws/terminal_sovereignty.cpl-l
  cognitive compile cpl-l laws/my_law.cpl-l --target motoko
  cognitive verify laws/terminal_sovereignty.cpl-l "modify_terminal"
  cognitive repl cpl-l
  cognitive stats

For more information: https://github.com/FreddyCreates/front-end-is-all-intelligence-
`);
  }
};

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    commands.help();
    process.exit(0);
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  if (commands[command]) {
    await commands[command](...commandArgs);
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run "cognitive help" for usage information');
    process.exit(1);
  }
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { commands, main };
