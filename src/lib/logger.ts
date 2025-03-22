import { debounce } from 'lodash';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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
      details: details ? JSON.stringify(details) : undefined
    });
    
    // If queue gets big enough, flush immediately
    if (this.logQueue.length >= this.maxQueueSize / 2) {
      this.debouncedFlush();
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
    try {
      const response = await fetch(`${API_BASE_URL}/logs/frontend-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logs),
      });
      
      if (!response.ok) {
        console.error('Failed to send logs to server:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending logs to server:', error);
    }
  }

  private flushLogs(sync = false): void {
    if (this.logQueue.length === 0) return;
    
    const logs = [...this.logQueue];
    this.logQueue = [];
    
    if (sync && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      // Use sendBeacon for synchronous sending during page unload
      const blob = new Blob([JSON.stringify(logs)], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE_URL}/logs/frontend-logs`, blob);
    } else {
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
      error: console.error
    };
    
    // Override console.log
    console.log = (...args: any[]) => {
      originalConsole.log(...args);
      this.info(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };
    
    // Override console.info
    console.info = (...args: any[]) => {
      originalConsole.info(...args);
      this.info(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };
    
    // Override console.warn
    console.warn = (...args: any[]) => {
      originalConsole.warn(...args);
      this.warn(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };
    
    // Override console.error
    console.error = (...args: any[]) => {
      originalConsole.error(...args);
      this.error(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };
  }
}

// Create singleton instance
export const logger = new Logger();

export default logger;
