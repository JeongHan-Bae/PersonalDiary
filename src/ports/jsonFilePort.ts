export interface JsonFilePort {
  readJsonFile(file: File): Promise<unknown>;
  downloadJsonFile(fileName: string, payload: unknown): void;
}
