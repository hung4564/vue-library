export interface PackageIndexes {
  functions: VueUseFunction[];
}
export interface VueUseFunction {
  name: string;
  package: string;
  category: string;
  description?: string;
  docs?: string;
}
