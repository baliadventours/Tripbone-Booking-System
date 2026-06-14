import admin from "firebase-admin";
import { getAdminDb } from "../firebaseAdmin.js";
import { EmailLogEntry } from "./types.js";

/**
 * Logs an email event to Firestore under 'email_logs' with error handling
 * so that any issues in logging do not disrupt the actual email flow.
 */
export async function logEmailAttempt(entry: {
  to: string;
  type: string;
  bookingId: string | null;
  subject: string;
  status: "success" | "skipped" | "failed";
  reason?: string;
  provider: string;
  errorDetails?: string;
}) {
  try {
    const db = getAdminDb();
    const logData: EmailLogEntry = {
      ...entry,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log(`[Email Logger] Logging attempt for ${entry.type} to ${entry.to} [Status: ${entry.status}]`);
    await db.collection("email_logs").add(logData);
  } catch (err: any) {
    console.error("[Email Logger] FAILED to save log to Firestore:", err.message);
  }
}
