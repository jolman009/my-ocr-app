export interface StorageProvider {
  save(buffer: Buffer, extension?: string): Promise<string>;
}
