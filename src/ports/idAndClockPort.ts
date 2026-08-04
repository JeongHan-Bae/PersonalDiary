export interface IdAndClockPort {
  createId(): string;
  createBase64Uuid(): string;
  nowIso(): string;
  getLocalTimeZone(): string;
}
