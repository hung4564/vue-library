import { ConsoleAdapter } from './adapters/ConsoleAdapter';
import { Logger } from './Logger';
import { LogAdapter } from './types';

export class LoggerFactory {
  private static instance: LoggerFactory;
  private adapters: LogAdapter[] = [new ConsoleAdapter()];

  private enableAll = true;
  private disabledNamespaces: Set<string> = new Set();
  private enabledNamespaces: Set<string> = new Set();

  static getInstance(): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory();
    }
    return LoggerFactory.instance;
  }

  /**
   * === Control Enable/Disable ===
   */

  // ⚙️ Enable toàn bộ (và clear disabled list)
  enableEverything() {
    this.enableAll = true;
    this.disabledNamespaces.clear();
    this.enabledNamespaces.clear();
  }

  // ❌ Disable toàn bộ (và clear enabled list)
  disableEverything() {
    this.enableAll = false;
    this.disabledNamespaces.clear();
    this.enabledNamespaces.clear();
  }

  // 🚫 Khi enableEverything nhưng muốn tắt 1 số namespace
  disable(namespace: string) {
    if (this.enableAll) {
      this.disabledNamespaces.add(namespace);
    }
  }

  // ✅ Khi disableEverything nhưng vẫn cho phép namespace
  enable(namespace: string) {
    if (!this.enableAll) {
      this.enabledNamespaces.add(namespace);
    }
  }

  // 🔍 Kiểm tra namespace có được phép log không
  isEnabled(namespaces: string[]): boolean {
    if (this.enableAll) {
      return !namespaces.some((ns) => this.disabledNamespaces.has(ns));
    } else {
      return namespaces.some((ns) => this.enabledNamespaces.has(ns));
    }
  }

  /**
   * === Adapter Management ===
   */

  setAdapters(adapters: LogAdapter[]) {
    this.adapters = adapters;
  }

  addAdapter(adapter: LogAdapter) {
    this.adapters.push(adapter);
  }

  clearAdapters() {
    this.adapters = [];
  }

  getAdapters(): LogAdapter[] {
    return this.adapters;
  }

  createLogger(): Logger {
    return new Logger(this.adapters, (namespaces) =>
      this.isEnabled(namespaces),
    );
  }
}
