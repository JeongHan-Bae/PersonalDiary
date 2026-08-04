import type { PersonalDataV1 } from '@/models/personalData';

export interface PersonalDataRepository {
  loadPersonalData(): Promise<PersonalDataV1>;
  replacePersonalData(data: PersonalDataV1): Promise<void>;

  listDiaryEntries(): Promise<PersonalDataV1.DiaryEntry[]>;
  getDiaryEntry(id: string): Promise<PersonalDataV1.DiaryEntry | undefined>;
  saveDiaryEntry(entry: PersonalDataV1.DiaryEntry): Promise<void>;

  listTags(): Promise<PersonalDataV1.Tag[]>;
  getTag(id: string): Promise<PersonalDataV1.Tag | undefined>;
  saveTag(tag: PersonalDataV1.Tag): Promise<void>;
  deleteTag(id: string): Promise<void>;

  listAvatarAssets(): Promise<PersonalDataV1.AvatarAsset[]>;
  getAvatarAsset(id: string): Promise<PersonalDataV1.AvatarAsset | undefined>;
  saveAvatarAsset(asset: PersonalDataV1.AvatarAsset): Promise<void>;
  deleteAvatarAsset(id: string): Promise<void>;

  listUsers(): Promise<PersonalDataV1.UserProfile[]>;
  getUser(id: string): Promise<PersonalDataV1.UserProfile | undefined>;
  saveUser(user: PersonalDataV1.UserProfile): Promise<void>;
  deleteUser(id: string): Promise<void>;
  getActiveUserId(): Promise<string | undefined>;
  saveActiveUserId(userId: string): Promise<void>;
}
