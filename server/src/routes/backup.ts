import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import { db } from '../db.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({
        error: 'Missing payload',
      });
    }

    const backupId = crypto.randomUUID();

    const passkey = crypto.randomBytes(16).toString('hex');

    const passkeyHash = await bcrypt.hash(passkey, 10);

    const now = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO backups (
        id,
        passkey_hash,
        payload_json,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(backupId, passkeyHash, JSON.stringify(payload), now, now);

    res.json({
      backupId,
      passkey,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to create backup',
    });
  }
});

router.post('/restore', async (req, res) => {
  try {
    const { backupId, passkey } = req.body;

    if (!backupId || !passkey) {
      return res.status(400).json({
        error: 'Missing credentials',
      });
    }

    const row = db
      .prepare(
        `
        SELECT *
        FROM backups
        WHERE id = ?
      `
      )
      .get(backupId) as
      | {
          id: string;
          passkey_hash: string;
          payload_json: string;
        }
      | undefined;

    if (!row) {
      return res.status(404).json({
        error: 'Backup not found',
      });
    }

    const valid = await bcrypt.compare(passkey, row.passkey_hash);

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid passkey',
      });
    }

    const payload = JSON.parse(row.payload_json);

    res.json({
      payload,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to restore backup',
    });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { backupId, passkey, payload } = req.body;

    if (!backupId || !passkey || !payload) {
      return res.status(400).json({
        error: 'Missing fields',
      });
    }

    const row = db
      .prepare(
        `
        SELECT *
        FROM backups
        WHERE id = ?
      `
      )
      .get(backupId) as
      | {
          id: string;
          passkey_hash: string;
        }
      | undefined;

    if (!row) {
      return res.status(404).json({
        error: 'Backup not found',
      });
    }

    const valid = await bcrypt.compare(passkey, row.passkey_hash);

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid passkey',
      });
    }

    const updatedAt = new Date().toISOString();

    db.prepare(
      `
      UPDATE backups
      SET payload_json = ?,
          updated_at = ?
      WHERE id = ?
    `
    ).run(JSON.stringify(payload), new Date().toISOString(), backupId);

    res.json({
      success: true,
      updatedAt,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to update backup',
    });
  }
});

export default router;
