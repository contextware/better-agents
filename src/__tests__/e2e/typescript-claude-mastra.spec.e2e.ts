import { describe, it, beforeEach, afterEach } from "vitest";
import { CLITestRunner } from "../utils/cli-test-runner.js";

/**
 * Full happy-path E2E test for TypeScript + Claude + Mastra flow.
 *
 * This test validates the complete workflow:
 * 1. superagents init creates project scaffolding
 * 2. Generated project has proper test infrastructure (vitest + @langwatch/scenario)
 * 3. Claude Code can build a working agent that passes scenario tests
 */
describe("Full User Flow: TypeScript + Claude + Mastra", () => {
  let runner: CLITestRunner;

  beforeEach(() => {
    runner = new CLITestRunner();
  });

  afterEach(async () => {
    await runner.cleanup();
  });

  it.todo("generates project, builds agent via claude, passes scenario tests");

  // When implemented, will look like:
  //
  // await runner
  //   .command('init', 'weather-agent')
  //   .expectPrompt('What programming language')
  //   .input('typescript')
  //   .expectPrompt('What agent framework')
  //   .input('mastra')
  //   .expectPrompt('What coding assistant')
  //   .input('claude-code')
  //   .expectPrompt('What LLM provider')
  //   .input('openai')
  //   .expectPrompt('Enter your OpenAI API key')
  //   .input('sk-test123')
  //   .expectPrompt('Enter your LangWatch API key')
  //   .input('lw_test123')
  //   .expectPrompt('What do you want to build')
  //   .input('Build an agent that checks the weather in any city')
  //   .expectOutput('Project setup complete')
  //   .run();
  //
  // // Verify scaffolding created correct structure
  // await runner
  //   .expectFile('weather-agent/package.json')
  //   .expectFile('weather-agent/src/index.ts')
  //   .expectFile('weather-agent/tests/scenarios/weather_scenario.test.ts')
  //   .expectFile('weather-agent/.mcp.json')
  //   .expectFile('weather-agent/AGENTS.md')
  //   .expectFileContains('weather-agent/package.json', '"test:scenarios": "vitest run tests/scenarios"')
  //   .expectFileContains('weather-agent/package.json', '"@langwatch/scenario"')
  //   .verify();
  //
  // // Install dependencies
  // await runner.exec('pnpm install', {
  //   cwd: 'weather-agent',
  //   expectSuccess: true
  // });
  //
  // // Claude builds the agent implementation
  // // (In real test, this would use Claude API or mock the scenario test to pass)
  // await runner.exec(
  //   'claude "Implement a weather agent that can check weather in any city. Make all scenario tests pass."',
  //   {
  //     cwd: 'weather-agent',
  //     env: {
  //       MCP_CONFIG: '.mcp.json',
  //       OPENAI_API_KEY: 'sk-test123'
  //     },
  //     expectSuccess: true
  //   }
  // );
  //
  // // Run scenario tests - they should pass!
  // await runner.exec('pnpm test:scenarios', {
  //   cwd: 'weather-agent',
  //   expectSuccess: true,
  //   expectOutput: /PASS.*weather_scenario/
  // });
  //
  // // Verify the agent actually works
  // await runner.exec('pnpm start "What is the weather in Paris?"', {
  //   cwd: 'weather-agent',
  //   expectSuccess: true,
  //   expectOutput: /Paris.*weather/i
  // });
});
