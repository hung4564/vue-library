import { ConsoleAdapter } from './adapters/ConsoleAdapter';
import { Logger } from './Logger';
import type { LogAdapter } from './types';

export class LoggerFactory {
  private adapters: LogAdapter[] = [new ConsoleAdapter()];

  private enableAll = true;
  private disabledNamespaces: Set<string> = new Set();
  private enabledNamespaces: Set<string> = new Set();

  /** Process-wide monotonic log sequence (1-based). */
  private logSeq = 0;

  static getInstance(): LoggerFactory {
    const host = globalThis as typeof globalThis & {
      __hungpvq_LoggerFactory__?: LoggerFactory;
    };
    if (!host.__hungpvq_LoggerFactory__) {
      host.__hungpvq_LoggerFactory__ = new LoggerFactory();
    }
    return host.__hungpvq_LoggerFactory__;
  }

  /** Reset singleton (tests). */
  static resetInstanceForTests(): void {
    const host = globalThis as typeof globalThis & {
      __hungpvq_LoggerFactory__?: LoggerFactory;
    };
    delete host.__hungpvq_LoggerFactory__;
  }

  enableEverything() {
    this.enableAll = true;
    this.disabledNamespaces.clear();
    this.enabledNamespaces.clear();
  }

  disableEverything() {
    this.enableAll = false;
    this.disabledNamespaces.clear();
    this.enabledNamespaces.clear();
  }

  disable(namespace: string) {
    if (this.enableAll) {
      this.disabledNamespaces.add(namespace);
    }
  }

  enable(namespace: string) {
    if (!this.enableAll) {
      this.enabledNamespaces.add(namespace);
    }
  }

  isEnabled(namespaces: string[]): boolean {
    if (this.enableAll) {
      return !namespaces.some((ns) => this.disabledNamespaces.has(ns));
    }
    return namespaces.some((ns) => this.enabledNamespaces.has(ns));
  }

  addAdapter(adapter: LogAdapter) {
    this.adapters.push(adapter);
  }

  clearAdapters() {
    this.adapters.length = 0;
  }

  getAdapters(): LogAdapter[] {
    return this.adapters;
  }

  /** Next monotonic log index for {@link LogHeader.index}. */
  nextLogIndex(): number {
    this.logSeq += 1;
    return this.logSeq;
  }

  createLogger(): Logger {
    return new Logger(this.adapters, (namespaces) => this.isEnabled(namespaces));
  }
}
