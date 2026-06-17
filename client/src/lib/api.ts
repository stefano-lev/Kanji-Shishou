const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001/api';

export interface CreateBackupResponse {
  backupId: string;
  passkey: string;
}

export interface RestoreBackupResponse<TPayload = unknown> {
  payload: TPayload;
}

export interface UpdateBackupResponse {
  success: boolean;
}

export async function createBackup<TPayload>(
  payload: TPayload
): Promise<CreateBackupResponse> {
  const res = await fetch(`${API_BASE}/backup/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload }),
  });

  if (!res.ok) {
    throw new Error('Failed to create backup');
  }

  return res.json();
}

export async function restoreBackup<TPayload = unknown>(
  backupId: string,
  passkey: string
): Promise<RestoreBackupResponse<TPayload>> {
  const res = await fetch(`${API_BASE}/backup/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ backupId, passkey }),
  });

  if (!res.ok) {
    throw new Error('Failed to restore backup');
  }

  return res.json();
}

export async function updateBackup<TPayload>(
  backupId: string,
  passkey: string,
  payload: TPayload
): Promise<UpdateBackupResponse> {
  const res = await fetch(`${API_BASE}/backup/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ backupId, passkey, payload }),
  });

  if (!res.ok) {
    throw new Error('Failed to update backup');
  }

  return res.json();
}
