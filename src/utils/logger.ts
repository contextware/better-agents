import type { Logger as PinoLogger } from "pino";
import pino from "pino";
import chalk from "chalk";
import ora from "ora";

/**
 * Context data for debug logging operations.
 * Uses unknown instead of any for type safety while allowing dynamic properties.
 */
export type LogContext = Record<string, unknown>;

/**
 * Known log levels for structured logging.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Unified logging interface for Superagents.
 *
 * This logger provides both user-facing console output (with colors and formatting)
 * and structured debug logging (JSON format for analysis and debugging).
 *
 * @example
 * ```ts
 * import { logger } from './utils/logger.js';
 *
 * // User-facing messages (preserve UX)
 * logger.userSuccess("Project created successfully!");
 * logger.userInfo("Configuration complete");
 *
 * // Debug logging (structured JSON)
 * logger.debug('step-completed', { step: 'config', duration: 150 });
 *
 * // Performance timing
 * const endTimer = logger.startTimer('file-generation');
 * // ... do work ...
 * endTimer(); // Logs duration automatically
 * ```
 */
/**
 * Simplified interface for ora spinner to avoid complex typing.
 */
interface Spinner {
  text: string;
  succeed(text?: string): void;
  fail(text?: string): void;
  warn(text?: string): void;
  info(text?: string): void;
  start(): void;
  stop(): void;
}

export interface Logger {
  /**
   * Logs user-facing informational message with cyan color.
   * @param message - The message to display to the user
   */
  userInfo(message: string): void;

  /**
   * Logs user-facing success message with green color and checkmark.
   * @param message - The success message to display
   */
  userSuccess(message: string): void;

  /**
   * Logs user-facing error message with red color and X mark.
   * @param message - The error message to display
   */
  userError(message: string): void;

  /**
   * Logs user-facing warning message with yellow color and warning symbol.
   * @param message - The warning message to display
   */
  userWarning(message: string): void;

  /**
   * Logs debug information in structured JSON format.
   * Only outputs when debug mode is enabled.
   * @param step - The operation or step being logged
   * @param context - Additional structured data for debugging
   */
  debug(step: string, context?: LogContext): void;

  /**
   * Logs informational debug data in structured JSON format.
   * Only outputs when debug mode is enabled.
   * @param step - The operation or step being logged
   * @param context - Additional structured data for analysis
   */
  info(step: string, context?: LogContext): void;

  /**
   * Logs error with stack trace in structured JSON format.
   * @param error - The error that occurred
   * @param context - Additional context about the error
   */
  error(error: Error, context?: LogContext): void;

  /**
   * Starts a performance timer and returns a function to end it.
   * @param label - Identifier for the timed operation
   * @returns Function that ends the timer and logs duration
   */
  startTimer(label: string): () => number;

  /**
   * Creates a child logger with additional context.
   * @param context - Context to add to all log entries from this child
   * @returns New logger instance with inherited context
   */
  child(context: LogContext): Logger;

  /**
   * Starts an ora spinner for long-running operations.
   * @param text - Initial spinner text
   * @returns The spinner instance
   */
  startSpinner(text: string): Spinner;

  /**
   * Gets the current spinner instance if one exists.
   * @returns The current spinner or undefined
   */
  getSpinner(): Spinner | undefined;
}

/**
 * Unified logger implementation using Pino for structured logging
 * and chalk/ora for user-facing console output.
 */
export class UnifiedLogger implements Logger {
  private pinoLogger: PinoLogger | undefined;
  private projectLogger?: PinoLogger;
  private timers = new Map<string, number>();
  private spinner?: Spinner;
  private isDebugMode: boolean;

  /**
   * Creates a new unified logger instance.
   * @param projectPath - Optional path to project for debug log file creation
   */
  constructor(projectPath?: string) {
    this.isDebugMode = this.detectDebugMode();

    // Console transport only when --debug flag is explicitly passed
    const transports = this.isDebugMode
      ? [
          {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname",
            },
          },
        ]
      : [];

    this.pinoLogger = pino({
      level: this.isDebugMode ? "debug" : "silent",
      ...(transports.length > 0 && { transport: { targets: transports } }),
    });

    // Always setup project-specific JSON logging with timestamped files
    if (projectPath) {
      this.setupProjectLogging(projectPath);
    }
  }

  /**
   * Detects if debug mode is enabled via environment variable or CLI flag.
   */
  private detectDebugMode(): boolean {
    return Boolean(
      process.env.SUPERAGENTS_DEBUG ||
        process.argv.includes("--debug") ||
        process.argv.includes("-d")
    );
  }

  /**
   * Sets up project-specific JSON logging to a timestamped debug log file.
   */
  private async setupProjectLogging(projectPath: string): Promise<void> {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");

      const logDir = path.join(projectPath, ".superagents");

      // Create timestamped log file name: debug-YYYY-MM-DD-HH-MM-SS.log
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const logPath = path.join(logDir, `debug-${timestamp}.log`);

      await fs.mkdir(logDir, { recursive: true });

      this.projectLogger = pino(
        {
          level: "debug",
          formatters: {
            level: (label: string) => ({
              level: label,
              timestamp: new Date().toISOString(),
            }),
          },
        },
        pino.destination(logPath)
      );
    } catch (error) {
      // Silently fail project logging setup - don't break user experience
      // Note: We can't use logger here since we're in the logger setup
    }
  }

  userInfo(message: string): void {
    if (this.spinner) {
      this.spinner.info(chalk.cyan(message));
    } else {
      console.log(chalk.cyan(message));
    }
    this.debug("user-info", { message, type: "info" });
  }

  userSuccess(message: string): void {
    if (this.spinner) {
      this.spinner.succeed(chalk.green(message));
    } else {
      console.log(chalk.green(`✅ ${message}`));
    }
    this.debug("user-success", { message, type: "success" });
  }

  userError(message: string): void {
    if (this.spinner) {
      this.spinner.fail(chalk.red(message));
    } else {
      console.error(chalk.red(`❌ ${message}`));
    }
    this.debug("user-error", { message, type: "error" });
  }

  userWarning(message: string): void {
    if (this.spinner) {
      this.spinner.warn(chalk.yellow(message));
    } else {
      console.warn(chalk.yellow(`⚠️  ${message}`));
    }
    this.debug("user-warning", { message, type: "warning" });
  }

  debug(step: string, context: LogContext = {}): void {
    const logData = { step, ...context };
    this.pinoLogger?.debug(logData);
    this.projectLogger?.debug(logData);
  }

  info(step: string, context: LogContext = {}): void {
    const logData = { step, ...context };
    this.pinoLogger?.info(logData);
    this.projectLogger?.info(logData);
  }

  error(error: Error, context: LogContext = {}): void {
    const logData = {
      step: "error",
      error: error.message,
      stack: error.stack,
      ...context,
    };
    this.pinoLogger?.error(logData);
    this.projectLogger?.error(logData);
  }

  startTimer(label: string): () => number {
    const start = Date.now();
    this.timers.set(label, start);
    this.debug("timer-start", { label });

    return () => {
      const duration = Date.now() - start;
      this.timers.delete(label);
      this.debug("timer-end", { label, duration });
      return duration;
    };
  }

  child(_context: LogContext): Logger {
    // Create a new logger instance with the same configuration
    // In a more complex implementation, this would merge contexts
    const childLogger = new UnifiedLogger();
    // Copy spinner state
    childLogger.spinner = this.spinner;
    return childLogger;
  }

  startSpinner(text: string): Spinner {
    if (!this.spinner) {
      this.spinner = ora(text).start();
    }
    return this.spinner!;
  }

  getSpinner(): Spinner | undefined {
    return this.spinner;
  }
}

// Export singleton instance for global use
export const logger = new UnifiedLogger();
