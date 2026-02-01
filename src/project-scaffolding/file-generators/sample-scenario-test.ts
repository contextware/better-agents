import * as fs from "fs/promises";
import * as path from "path";
import type { ProgrammingLanguage } from "../../types.js";

/**
 * Generates sample scenario test file in tests/scenarios/.
 *
 * @param params - Parameters object
 * @param params.projectPath - Absolute path to project root
 * @param params.language - Programming language (python or typescript)
 * @returns Promise that resolves when file is written
 *
 * @example
 * ```ts
 * await generateSampleScenario({ projectPath: '/path', language: 'typescript' });
 * ```
 */
export const generateSampleScenario = async ({
  projectPath,
  language,
}: {
  projectPath: string;
  language: ProgrammingLanguage;
}): Promise<void> => {
  const fileName =
    language === "python"
      ? "test_example_scenario.py"
      : "example_scenario.test.ts";
  const sampleScenarioContent =
    language === "python"
      ? `"""
Sample scenario test for your agent.
Follow the Agent Testing Pyramid: use Scenario for end-to-end agentic tests, but always access Scenario and its docs strictly via the LangWatch MCP.

To run this test, you must first install the scenario library:
uv add langwatch-scenario
"""

import scenario
import pytest
# from app.agent import my_agent # Import your agent here

@pytest.mark.asyncio
async def test_sample_scenario():
    import os
    from dotenv import load_dotenv
    load_dotenv()
    await scenario.run(
        id="sample-scenario",
        name="Sample Scenario",
        # agents=[my_agent, scenario.UserSimulatorAgent()],
        script=[
            scenario.user("What can you do?"),
            scenario.agent(),
            scenario.succeed("Goal reached"),
        ],
    )
`
      : `/**
 * Sample scenario test for your agent.
 * Follow the Agent Testing Pyramid: use Scenario for end-to-end agentic tests, but always access Scenario and its docs strictly via the LangWatch MCP.
 * 
 * To run this test, you must first install the scenario library:
 * npm install @langwatch/scenario
 */

import { it } from "vitest";
import * as scenario from "@langwatch/scenario";
// import { myAgent } from "../../src/mastra/agents/index.js"; // Import your agent here

it("should handle sample request", async () => {
    // Proactively load .env for LangWatch API keys and custom endpoint
    try {
        const dotenv = await import("dotenv");
        dotenv.config();
    } catch {
        // dotenv not installed yet, that's fine
    }

    await scenario.run({
        id: "sample-scenario",
        name: "Sample Scenario",
        // agents: [myAgent],
        script: [
            scenario.user("What can you do?"),
            scenario.agent(),
            scenario.succeed("Goal reached"),
        ],
    });
});
`;

  await fs.writeFile(
    path.join(
      projectPath,
      "tests",
      "scenarios",
      fileName
    ),
    sampleScenarioContent
  );
};
