import { LoggerFactory } from './LoggerFactory';

export const loggerFactory = LoggerFactory.getInstance();

export * from './adapters/ConsoleAdapter';
export * from './LoggerFactory';
export * from './types';
