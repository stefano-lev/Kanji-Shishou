import { useState } from 'react';

import { createBackup, restoreBackup, updateBackup } from '@/lib/api';

import {
  createAppBackupPayload,
  restoreAppBackupPayload,
  type AppBackupPayload,
} from '@utils/backupPayload';

import {
  loadCloudBackupCredentials,
  saveCloudBackupCredentials,
  clearCloudBackupCredentials,
} from '@utils/cloudBackupStorage';

interface CloudBackupModalProps {
  onClose: () => void;
}

const CloudBackupModal = ({ onClose }: CloudBackupModalProps) => {
  const [credentials, setCredentials] = useState(loadCloudBackupCredentials());
  const [backupIdInput, setBackupIdInput] = useState('');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const handleCreateBackup = async () => {
    try {
      setIsWorking(true);
      setMessage(null);

      const payload = createAppBackupPayload();
      const result = await createBackup(payload);

      const nextCredentials = {
        backupId: result.backupId,
        passkey: result.passkey,
        createdAt: new Date().toISOString(),
      };

      saveCloudBackupCredentials(nextCredentials);
      setCredentials(nextCredentials);

      setMessage('Cloud backup created. Save your Backup ID and Passkey.');
    } catch {
      setMessage('Failed to create cloud backup.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleUpdateBackup = async () => {
    if (!credentials) {
      setMessage('No saved cloud backup credentials found.');
      return;
    }

    try {
      setIsWorking(true);
      setMessage(null);

      const payload = createAppBackupPayload();

      await updateBackup(credentials.backupId, credentials.passkey, payload);

      const nextCredentials = {
        ...credentials,
        updatedAt: new Date().toISOString(),
      };

      saveCloudBackupCredentials(nextCredentials);
      setCredentials(nextCredentials);

      setMessage('Cloud backup updated.');
    } catch {
      setMessage('Failed to update cloud backup.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleRestoreBackup = async () => {
    const backupId = backupIdInput.trim() || credentials?.backupId;
    const passkey = passkeyInput.trim() || credentials?.passkey;

    if (!backupId || !passkey) {
      setMessage('Enter a Backup ID and Passkey.');
      return;
    }

    const confirmed = window.confirm(
      'This will overwrite your current local Kanji Shishou data. Continue?'
    );

    if (!confirmed) return;

    try {
      setIsWorking(true);
      setMessage(null);

      const result = await restoreBackup<AppBackupPayload>(backupId, passkey);

      restoreAppBackupPayload(result.payload);

      saveCloudBackupCredentials({
        backupId,
        passkey,
        createdAt: credentials?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      alert('Cloud backup restored. Reloading...');
      window.location.reload();
    } catch {
      setMessage('Failed to restore cloud backup.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleForgetCredentials = () => {
    clearCloudBackupCredentials();
    setCredentials(null);
    setMessage('Saved cloud backup credentials removed from this browser.');
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-zinc-800 bg-[#11110f] text-zinc-100">
        <div className="pointer-events-none absolute -right-5 -top-10 text-9xl font-black text-zinc-950">
          雲
        </div>

        <div className="relative border-b border-zinc-800 p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-400/70">
            Cloud Sync
          </p>

          <h2 className="text-2xl font-bold">Cloud Backup</h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Create a cloud copy of your local Kanji Shishou progress, update an
            existing save, or restore using a Backup ID and Passkey.
          </p>
        </div>

        <div className="relative space-y-5 p-6">
          {credentials && (
            <div className="border-l-2 border-red-900 bg-zinc-950 p-4 text-sm">
              <CredentialRow
                label="Saved Backup ID"
                value={credentials.backupId}
              />
              <CredentialRow
                label="Saved Passkey"
                value={credentials.passkey}
              />

              {credentials.updatedAt && (
                <div className="mt-3 text-xs text-zinc-600">
                  Last updated:{' '}
                  {new Date(credentials.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {!credentials && (
            <div className="border-l-2 border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
              No cloud backup credentials are saved in this browser yet.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              disabled={isWorking}
              onClick={handleCreateBackup}
              className="rounded-md border border-red-800 bg-red-900 px-4 py-3 font-semibold text-red-50 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create New Backup
            </button>

            <button
              disabled={isWorking || !credentials}
              onClick={handleUpdateBackup}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 font-semibold text-zinc-300 transition hover:border-red-900/70 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Update Saved Backup
            </button>
          </div>

          <div className="border-t border-zinc-800 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Restore Existing Backup
            </p>

            <div className="space-y-3">
              <input
                value={backupIdInput}
                onChange={(e) => setBackupIdInput(e.target.value)}
                placeholder="Backup ID"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-red-900"
              />

              <input
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Passkey"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-red-900"
              />

              <button
                disabled={isWorking}
                onClick={handleRestoreBackup}
                className="w-full rounded-md border border-emerald-900 bg-emerald-950 px-4 py-3 font-semibold text-emerald-200 transition hover:border-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Restore Backup
              </button>
            </div>
          </div>

          {message && (
            <div className="border-l-2 border-red-900 bg-zinc-950 p-4 text-sm text-zinc-300">
              {message}
            </div>
          )}
        </div>

        <div className="relative flex flex-col gap-3 border-t border-zinc-800 bg-zinc-950 p-4 sm:flex-row">
          <button
            onClick={handleForgetCredentials}
            className="flex-1 rounded-md border border-zinc-800 bg-[#0b0b0a] px-4 py-3 font-semibold text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200"
          >
            Forget Saved Credentials
          </button>

          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-red-800 bg-red-900 px-4 py-3 font-semibold text-red-50 transition hover:bg-red-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface CredentialRowProps {
  label: string;
  value: string;
}

const CredentialRow = ({ label, value }: CredentialRowProps) => (
  <div className="mb-3 last:mb-0">
    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-600">
      {label}
    </div>

    <div className="break-all font-mono text-sm text-zinc-200">{value}</div>
  </div>
);

export default CloudBackupModal;
