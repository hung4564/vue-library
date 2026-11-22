import type { InstanceMetadata } from '@hungpvq/shared-log';

export type LiveTreeNode = InstanceMetadata & { children: LiveTreeNode[] };
