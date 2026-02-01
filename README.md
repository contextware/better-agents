# Better Agents

<p>
    <a href="https://discord.gg/kT4PhDS2gH" target="_blank"><img src="https://img.shields.io/discord/1227886780536324106?logo=discord&labelColor=%20%235462eb&logoColor=%20%23f5f5f5&color=%20%235462eb" alt="chat on Discord"></a>
</p>

## About This Fork

This package is an extension of [@langwatch/better-agents](https://github.com/langwatch/better-agents), adding:

- Integration with [Contextware Skills](https://github.com/contextware/skills)
- Interactive skill selection and dynamic loading with manual cache refresh
- Support for telecom and network operations workflows
- Industry-specific MCP server integrations

The core Better Agents structure and principles are maintained from the original LangWatch project.

## Installation

```bash
npx @contextware/better-agents init my-agent-project
```

Or install globally:

```bash
npm install -g @contextware/better-agents
better-agents init my-agent-project
```

---

Better Agents is a CLI tool and a set of standards for agent building.

It supercharges your coding assistant (Kilocode, Claude Code, Cursor, etc), making it an expert in any agent framework you choose (Agno, Mastra, LangGraph etc) and all their best practices.

It's the best way to start any new agent project.

![](/images/cover-image.png)

The Better Agent Structure and generated AGENTS.md ensures industry best practices, making your agent ready for production:
- [Scenario](https://github.com/langwatch/scenario) agent tests written for every feature to ensure agent behaviour
- Versioning of the prompts for collaboration
- Evaluation notebooks for measuring specific prompts performance
- Already instrumented for full observability
- Standardization of structure for better project maintainability

## The Better Agent Structure

```
my-agent-project/
├── app/ (or src/)           # The actual agent code, according to the chosen framework
├── tests/
│   ├── evaluations/         # Jupyter notebooks for evaluations
│   │   └── example_eval.ipynb
│   └── scenarios/           # End-to-end scenario tests
│       └── example_scenario.test.{py,ts}
├── prompts/                 # Versioned prompt files for team collaboration
│   └── sample_prompt.yaml
├── prompts.json             # Prompt registry
├── .mcp.json                # MCP server configuration
├── AGENTS.md                # Development guidelines
├── .env                     # Environment variables
└── .gitignore
```

### `AGENTS.md` - The Expert Guide

The structure and guidelines on `AGENTS.md` ensure every new feature required for the coding assistant is properly tested, evaluated, and that the prompts are versioned.

The `.mcp.json` comes with all the right MCPs set up so you coding assistant becomes an expert in your framework of choice and in writing Scenario tests for your agent.

[`scenarios/`](https://github.com/langwatch/scenario) tests guarantee the agent behaves as expected, which simulates a conversation with the agent making sure it does what expected.

[`evaluations/`](https://docs.langwatch.ai/llm-evaluation/offline/code/evaluation-api) notebooks holds dataset and notebooks for evaluating pieces of your agent pipeline such as a RAG or classification tasks it must do

Finally, [`prompts/`](https://docs.langwatch.ai/prompt-management/cli) hold all your versioned prompts in yaml format, synced and controlled by `prompts.json`, to allow for playground and team collaboration.

## Agent Skills

Better Agents integrates with the **[Contextware Skills](https://github.com/contextware/skills)** library to provide your agent with specialized, domain-specific expert knowledge.

### Why Skills Matter
Skills are more than just documentation; they are **architectural blueprints**. When a skill (like HubSpot, Slack, or Incident Management) is installed:
- Your coding assistant receives a `SKILL.md` file that defines **mandatory** patterns and best practices.
- The agent goal is automatically updated to leverage that skill.
- It ensures the agent knows exactly how to use the relevant MCP tools and APIs correctly.

### Dynamic Skills Loading & Refresh
Skills are **dynamically loaded from GitHub** each time you run Better Agents, ensuring you always have access to the latest available skills for selection.

The skill list is **cached for 24 hours** to optimize performance. You can refresh it in two ways:

1.  **Interactively**: The CLI will now ask you if you'd like to refresh the skills list before you start selecting them.
2.  **Via CLI flag**: Use the `--refresh-skills` flag (or the `-r` short alias):

```bash
# Using the full flag
npx @contextware/better-agents init --refresh-skills

# Using the short alias (avoids common npm config warnings)
npx @contextware/better-agents init -r
```

> [!TIP]
> This flag invalidates the local cache and fetches the absolute latest metadata from the [Contextware Skills](https://github.com/contextware/skills) repository before the interactive prompts begin.

### Managing Skills
You can browse available skills in the [contextware/skills](https://github.com/contextware/skills) repository.

Existing projects can add new skills at any time using the `npx skills` command:
```bash
npx skills add https://github.com/contextware/skills --skill hubspot
```

### AGENTS.md Best Practices

The generated `AGENTS.md` follows [Vercel's research](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) on making agents more effective:

- **Retrieval-led reasoning**: Agents are instructed to prefer documentation over training data, improving accuracy for newer APIs
- **Compressed skills index**: Skills are listed in a token-efficient format that maximizes context availability
- **Strategic ordering**: Skills section appears near the top of AGENTS.md for consistent visibility
- **Explicit instructions**: Clear guidance on when and how to read skill documentation

## Getting Started

### Installation

```bash
npm install -g @contextware/better-agents
```

Or use with npx:

```bash
npx @contextware/better-agents init my-agent-project
```

### Initialize a new project

```bash
# Standard interactive initialization
better-agents init my-agent-project

# Force refresh the available skills list from GitHub
better-agents init . --refresh-skills

# Or using the short alias
better-agents init . -r
```

The CLI will guide you through selecting your programming language, agent framework, coding assistant, LLM provider, and API keys.

#### Common CLI Flags

| Flag | Description |
| :--- | :--- |
| `-r, --refresh-skills` | Force refresh available skills (bypass 24h cache) |
| `--skills <list>` | Install specific skills (comma-separated or 'all') |
| `--goal "<goal>"` | Set project goal non-interactively |
| `--langwatch-endpoint <url>` | Custom LangWatch endpoint URL |
| `--debug` | Enable detailed debug logging |
| `--help` | Show all available options and environment variables |

## Documentation

- **[Getting Started](docs/GETTING-STARTED.md)** - Quick start guide (2 minutes)
- **[Walkthrough](docs/WALKTHROUGH.md)** - Detailed step-by-step guide
- **[Project Structure](docs/STRUCTURE.md)** - Understanding the Better Agent structure
- **[Features](docs/FEATURES.md)** - Key features and capabilities
- **[Usage](docs/USAGE.md)** - CLI usage and examples
- **[Philosophy](docs/PHILOSOPHY.md)** - Agent Testing Pyramid approach
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute to Better Agents
- **[Changelog](CHANGELOG.md)** - Version history

## Development

To run Better Agents locally for development:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/contextware/better-agents.git
   cd better-agents
   ```

2. **Install dependencies**:
   ```bash
   pnpm install  # or npm install
   ```

3. **Run in development mode**:
   Use `npm run dev` followed by the command you want to test:
   ```bash
   npm run dev init my-test-project
   ```

4. **Build and run**:
   ```bash
   npm run build
   node dist/index.js init my-test-project
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

## Requirements

- Node.js 22+
- npm or pnpm
- A coding assistant (one of the following):
  - [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code-agent) (`claude` CLI): `npm install -g @anthropic-ai/claude-code`
  - [Cursor](https://www.cursor.com/): (Built-in Agent)
  - [Antigravity](https://antigravity.google/): (`agy`)
  - [Kilocode CLI](https://www.kilocode.ai/): `npm install -g @kilocode/cli`
  - [Crush](https://charm.land/): `npm install -g @charmland/crush`
  - [Gemini CLI](https://github.com/google-gemini/gemini-cli): `npm install -g @google/gemini-cli`
  - [Qwen Code](https://github.com/QwenLM/qwen-code): `npm install -g @qwenlm/qwen-code`
- API Keys:
  - LangWatch API key (get one at https://app.langwatch.ai/authorize)
  - Your chosen LLM Provider API key
- Telemetry (optional):
  - Anonymous usage telemetry is enabled by default.
  - To opt out, set the environment variable:
    ```bash
    BETTER_AGENTS_TELEMETRY=0
    ```

## Resources

- [LangWatch](https://langwatch.ai)
- [Scenario Documentation](https://scenario.langwatch.ai/)
- [Agent Testing Pyramid](https://scenario.langwatch.ai/best-practices/the-agent-testing-pyramid)
- [Agno](https://agno.com)
- [Mastra](https://mastra.ai)
- [Langwatch Discord](https://discord.com/invite/kT4PhDS2gH)

## License

MIT

---

Built with ❤️ by the Contextware team (inspired by LangWatch team)