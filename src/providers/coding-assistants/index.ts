import { ClaudeCodingAssistantProvider } from "./claude/index.js";
import { CursorCodingAssistantProvider } from "./cursor/index.js";
import { KilocodeCodingAssistantProvider } from "./kilocode/index.js";
import { NoneCodingAssistantProvider } from "./none/index.js";

export type MCPConfigFile = {
  mcpServers: Record<
    string,
    {
      command: string;
      args?: string[];
      type?: string;
    }
  >;
};

/**
 * Interface for coding assistant providers.
 * Each assistant implements MCP config writing and launching.
 *
 * @example
 * ```ts
 * const provider = getCodingAssistantProvider({ assistant: 'claude-code' });
 * await provider.writeMCPConfig({ projectPath, config });
 * await provider.launch({ projectPath, prompt });
 * ```
 */
export interface CodingAssistantProvider {
  readonly id: string;
  readonly displayName: string;
  readonly command: string;

  /** Writes MCP config in assistant-specific format/location */
  writeMCPConfig(params: {
    projectPath: string;
    config: MCPConfigFile;
  }): Promise<void>;

  /** Launches the assistant with the given prompt */
  launch(params: { projectPath: string; prompt: string }): Promise<void>;
}

const PROVIDERS: Record<string, CodingAssistantProvider> = {
  "claude-code": ClaudeCodingAssistantProvider,
  "cursor-cli": CursorCodingAssistantProvider,
  kilocode: KilocodeCodingAssistantProvider,
  none: NoneCodingAssistantProvider,
};

/**
 * Gets a coding assistant provider by ID.
 *
 * @param params - Parameters object
 * @param params.assistant - Coding assistant identifier
 * @returns Coding assistant provider instance
 *
 * @example
 * ```ts
 * const provider = getCodingAssistantProvider({ assistant: 'claude-code' });
 * ```
 */
export const getCodingAssistantProvider = ({
  assistant,
}: {
  assistant: string;
}): CodingAssistantProvider => {
  const provider = PROVIDERS[assistant];
  if (!provider) {
    throw new Error(`Coding assistant provider not found: ${assistant}`);
  }
  return provider;
};

/**
 * Gets all available coding assistant providers.
 *
 * @returns Array of coding assistant providers
 *
 * @example
 * ```ts
 * const assistants = getAllCodingAssistants();
 * ```
 */
export const getAllCodingAssistants = (): CodingAssistantProvider[] => {
  return Object.values(PROVIDERS);
};
