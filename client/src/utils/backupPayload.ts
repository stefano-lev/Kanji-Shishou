import { exportAllData, importAllData } from '@utils/localStorageHandler';
import type { BackupData } from '@/types';

export interface AppBackupPayload {
  app: 'kanji-shishou';
  version: 1;
  createdAt: string;
  data: BackupData;
}

export function createAppBackupPayload(): AppBackupPayload {
  return {
    app: 'kanji-shishou',
    version: 1,
    createdAt: new Date().toISOString(),
    data: exportAllData(),
  };
}

export function restoreAppBackupPayload(payload: unknown): void {
  if (!isAppBackupPayload(payload)) {
    throw new Error('Invalid Kanji Shishou backup payload.');
  }

  importAllData(payload.data);
}

export function isAppBackupPayload(value: unknown): value is AppBackupPayload {
  if (!value || typeof value !== 'object') return false;

  const payload = value as Partial<AppBackupPayload>;

  return (
    payload.app === 'kanji-shishou' &&
    typeof payload.version === 'number' &&
    typeof payload.createdAt === 'string' &&
    Boolean(payload.data)
  );
}
