import { debounce } from 'lodash';

// Public URL for client-side usage
const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
// Internal URL for server-side usage (only available server-side)
const INTERNAL_API_BASE_URL =
  process.env.INTERNAL_API_URL || PUBLIC_API_BASE_URL; // Fallback to public URL if internal isn't set

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  details?: any;
}

class Logger {
  private logQueue: LogEntry[] = [];
  private readonly maxQueueSize = 100;
  private readonly flushInterval = 5000; // 5 seconds

  constructor() {
    // Setup queue flushing on interval
    setInterval(() => this.flushLogs(), this.flushInterval);
    // Also flush logs on window unload/beforeunload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushLogs(true));
    }

    // Override console methods to capture logs
    this.overrideConsole();
  }

  private addToQueue(level: LogLevel, message: string, details?: any): void {
    // If queue is full, remove oldest entry
    if (this.logQueue.length >= this.maxQueueSize) {
      this.logQueue.shift();
    }

    this.logQueue.push({
      level,
      message: String(message),
      timestamp: new Date().toISOString(),
      details: details ? this.safeStringify(details) : undefined,
    });

    // If queue gets big enough, flush immediately
    if (this.logQueue.length >= this.maxQueueSize / 2) {
      this.debouncedFlush();
    }
  }

  // Helper function to safely stringify objects
  private safeStringify(obj: any): string {
    if (obj === null || obj === undefined) return String(obj);

    if (typeof obj !== 'object') return String(obj);

    // Handle DOM nodes and React elements - ONLY IN CLIENT-SIDE ENVIRONMENT
    const isClient = typeof window !== 'undefined';
    if (
      isClient &&
      (obj instanceof Node ||
        (obj.$$typeof && obj.$$typeof.toString().includes('Symbol(react')))
    ) {
      return '[Object DOM/React Element]';
    }

    try {
      // Use a WeakSet to track circular references
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        // Skip function values
        if (typeof value === 'function') return '[Function]';

        // Handle DOM nodes - ONLY IN CLIENT-SIDE ENVIRONMENT
        if (isClient && value instanceof Node) return '[DOM Element]';

        // Handle React elements
        if (
          value &&
          typeof value === 'object' &&
          value.$$typeof &&
          value.$$typeof.toString().includes('Symbol(react')
        ) {
          return '[React Element]';
        }

        // Handle circular references
        if (value !== null && typeof value === 'object') {
          if (seen.has(value)) return '[Circular Reference]';
          seen.add(value);
        }

        return value;
      });
    } catch (err: any) {
      return `[Object: Stringify failed: ${err.message || 'Unknown error'}]`;
    }
  }

  info(message: string, details?: any): void {
    this.addToQueue('info', message, details);
  }

  warn(message: string, details?: any): void {
    this.addToQueue('warn', message, details);
  }

  error(message: string, details?: any): void {
    this.addToQueue('error', message, details);
  }

  private async sendLogsToServer(logs: LogEntry[]): Promise<void> {
    // Skip sending logs to server since this is a decentralized application
    // Logs are only kept in browser console for development
    return;
  }

  private flushLogs(sync = false): void {
    if (this.logQueue.length === 0) return;

    const logs = [...this.logQueue];
    this.logQueue = [];

    if (sync && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      // Use sendBeacon for synchronous sending during page unload
      const blob = new Blob([JSON.stringify(logs)], {
        type: 'application/json',
      });
      // Use public URL for sendBeacon as it runs in the browser context
      navigator.sendBeacon(`${PUBLIC_API_BASE_URL}/logs/frontend-logs`, blob);
    } else {
      // Use the appropriate URL (internal/public) for async fetch
      this.sendLogsToServer(logs);
    }
  }

  private debouncedFlush = debounce(() => this.flushLogs(), 1000);

  private overrideConsole(): void {
    if (typeof window === 'undefined') return;

    // Save original console methods
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    // Override console.log
    console.log = (...args: any[]) => {
      originalConsole.log(...args);
      this.info(args.map(arg => this.safeStringify(arg)).join(' '));
    };

    // Override console.info
    console.info = (...args: any[]) => {
      originalConsole.info(...args);
      this.info(args.map(arg => this.safeStringify(arg)).join(' '));
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      originalConsole.warn(...args);
      this.warn(args.map(arg => this.safeStringify(arg)).join(' '));
    };

    // Override console.error
    console.error = (...args: any[]) => {
      originalConsole.error(...args);
      this.error(args.map(arg => this.safeStringify(arg)).join(' '));
    };
  }
}

// Create singleton instance
export const logger = new Logger();

export default logger;
