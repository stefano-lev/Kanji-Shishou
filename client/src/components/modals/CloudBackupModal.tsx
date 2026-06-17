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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 text-white">
        <h2 className="mb-4 text-2xl font-bold">Cloud Backup</h2>

        <p className="mb-4 text-sm text-zinc-400">
          Create a cloud backup of your local Kanji Shishou progress, or restore
          an existing backup using its Backup ID and Passkey.
        </p>

        {credentials && (
          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
            <div className="text-zinc-400">Saved Backup ID</div>
            <div className="break-all font-mono text-blue-300">
              {credentials.backupId}
            </div>

            <div className="mt-3 text-zinc-400">Saved Passkey</div>
            <div className="break-all font-mono text-green-300">
              {credentials.passkey}
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3">
          <button
            disabled={isWorking}
            onClick={handleCreateBackup}
            className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-500 disabled:opacity-50"
          >
            Create New Cloud Backup
          </button>

          <button
            disabled={isWorking || !credentials}
            onClick={handleUpdateBackup}
            className="rounded-lg bg-purple-600 px-4 py-2 hover:bg-purple-500 disabled:opacity-50"
          >
            Update Saved Cloud Backup
          </button>
        </div>

        <div className="mb-4 space-y-3">
          <input
            value={backupIdInput}
            onChange={(e) => setBackupIdInput(e.target.value)}
            placeholder="Backup ID"
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2"
          />

          <input
            value={passkeyInput}
            onChange={(e) => setPasskeyInput(e.target.value)}
            placeholder="Passkey"
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2"
          />

          <button
            disabled={isWorking}
            onClick={handleRestoreBackup}
            className="w-full rounded-lg bg-green-600 px-4 py-2 hover:bg-green-500 disabled:opacity-50"
          >
            Restore Cloud Backup
          </button>
        </div>

        {message && <p className="mb-4 text-sm text-zinc-300">{message}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleForgetCredentials}
            className="flex-1 rounded-lg bg-zinc-700 px-4 py-2 hover:bg-zinc-600"
          >
            Forget Saved Credentials
          </button>

          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloudBackupModal;
