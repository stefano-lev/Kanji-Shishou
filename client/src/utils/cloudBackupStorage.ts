export interface CloudBackupCredentials {
  backupId: string;
  passkey: string;
  createdAt: string;
  updatedAt?: string;
}

const CLOUD_BACKUP_KEY = 'kanji_shishou_cloud_backup_credentials';

export function saveCloudBackupCredentials(
  credentials: CloudBackupCredentials
) {
  localStorage.setItem(CLOUD_BACKUP_KEY, JSON.stringify(credentials));
}

export function loadCloudBackupCredentials(): CloudBackupCredentials | null {
  const raw = localStorage.getItem(CLOUD_BACKUP_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CloudBackupCredentials;
  } catch {
    return null;
  }
}

export function clearCloudBackupCredentials() {
  localStorage.removeItem(CLOUD_BACKUP_KEY);
}
