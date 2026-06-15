import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

let adminApp: any = null;
let adminDb: any = null;

export function getAdminApp() {
  if (adminApp) return adminApp;
  console.log(`[Firebase Admin] Root Path: ${process.cwd()}`);
  
  // Set default from env first
  let targetProjectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  
  try {
    const rootPath = process.cwd();
    const possiblePaths = [
      path.resolve(rootPath, "firebase-applet-config.json"),
      path.resolve(rootPath, "..", "firebase-applet-config.json"),
      path.resolve(rootPath, "public", "firebase-applet-config.json")
    ];
    let configPath = possiblePaths[0];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        console.log(`[Firebase Admin] Found config at: ${p}`);
        configPath = p;
        break;
      }
    }

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      // Env variables take precedence, otherwise fallback to config file
      targetProjectId = targetProjectId || config.projectId;
    }
  } catch (e) {
    // Silent catch
  }

  const projectId = targetProjectId || "remixed-project-id";
  console.log(`[Firebase Admin] Project Profile: ${projectId}`);
  if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_PROJECT !== projectId) {
    console.log(`[Firebase Admin] Detected environment project mismatch: ADC=${process.env.GOOGLE_CLOUD_PROJECT}, Targeting=${projectId}`);
  }
  
  const options: admin.AppOptions = {
    projectId: projectId
  };

  // Support Service Account if provided as JSON string in environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const saBody = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      const saJson = (saBody.startsWith('"') && saBody.endsWith('"')) 
        ? JSON.parse(JSON.parse(saBody)) 
        : JSON.parse(saBody);

      if (saJson && typeof saJson === 'object' && !Array.isArray(saJson)) {
        options.credential = admin.credential.cert(saJson);
        console.log(`[Firebase Admin] SUCCESS: Using service account email: ${saJson.client_email}`);
        if (saJson.project_id) {
          options.projectId = saJson.project_id;
          console.log(`[Firebase Admin] Setting projectId to match Service Account project_id: ${options.projectId}`);
        }
      } else {
        throw new Error("FIREBASE_SERVICE_ACCOUNT must be a JSON object.");
      }
    } catch (e: any) {
      console.error("[Firebase Admin] CRITICAL: Error parsing FIREBASE_SERVICE_ACCOUNT:", e.message);
      throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT format: ${e.message}. Ensure it is a valid JSON string.`);
    }
  } else {
    console.warn("[Firebase Admin] No FIREBASE_SERVICE_ACCOUNT env var found.");
    if (process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.K_SERVICE) {
      console.error("[Firebase Admin] CRITICAL: Database access will likely FAIL with PERMISSION_DENIED on Vercel/Cloud Run without FIREBASE_SERVICE_ACCOUNT.");
      console.error("[Firebase Admin] ACTION REQUIRED: Add FIREBASE_SERVICE_ACCOUNT to your environment variables.");
    }
    console.warn("[Firebase Admin] Falling back to default credentials (ADC).");
  }

  if (admin.apps.length > 0) {
    const existingApp = admin.app();
    if (existingApp.options.projectId === options.projectId) {
      return existingApp;
    }
    // Delete and re-init if projectId changed (e.g. after env var update)
    console.log(`[Firebase Admin] Project ID changed from ${existingApp.options.projectId} to ${options.projectId}. Re-initializing.`);
    existingApp.delete();
  }

  console.log(`[Firebase Admin] Initializing app for project: ${options.projectId}`);
  adminApp = admin.initializeApp(options);
  return adminApp;
}

export function getAdminDb() {
  if (adminDb) return adminDb;
  const app = getAdminApp();
  
  let databaseId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
  let configSource = 'env';

  try {
    const rootPath = process.cwd();
    const possiblePaths = [
      path.join(rootPath, "firebase-applet-config.json"),
      path.join(rootPath, "..", "firebase-applet-config.json"),
      path.join(rootPath, "public", "firebase-applet-config.json"),
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../firebase-applet-config.json"),
      "/var/task/firebase-applet-config.json"
    ];
    
    let configPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        configPath = p;
        break;
      }
    }

    if (configPath) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (config.firestoreDatabaseId && !databaseId) {
        databaseId = config.firestoreDatabaseId;
        configSource = `file:${configPath}`;
      }
    }
  } catch (e: any) {
    console.warn(`[Firebase Admin] Warning: Could not detect databaseId from config file: ${e.message}`);
  }

  databaseId = databaseId || '(default)';
  console.log(`[Firebase Admin] Using database: ${databaseId} (Source: ${configSource})`);
  try {
    adminDb = getFirestore(app, databaseId);
  } catch (err: any) {
    console.error(`[Firebase Admin] CRITICAL: Failed to initialize Firestore instance: ${err.message}`);
    // If explicit database fails, try falling back to default as a last resort
    if (databaseId !== '(default)') {
      console.log("[Firebase Admin] Attempting fallback to '(default)' database...");
      adminDb = getFirestore(app, '(default)');
    } else {
      throw err;
    }
  }
  
  return adminDb;
}

export async function verifyAdmin(idToken?: string) {
  if (!idToken) {
    return { isAdmin: false, error: "No authentication token provided." };
  }
  try {
    getAdminApp();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const rawAdminEmail = (process.env.ADMIN_EMAIL || 'baliadventours@gmail.com').trim().toLowerCase();
    const userEmail = (decodedToken.email || '').trim().toLowerCase();
    const isRoleAdmin = decodedToken.role === 'admin' || decodedToken.admin === true;
    
    const isAdmin = userEmail === rawAdminEmail || isRoleAdmin;
    
    console.log(`[verifyAdmin] Auth Evaluation:
      User Email: "${userEmail}"
      Target Admin: "${rawAdminEmail}"
      Role: ${decodedToken.role}
      Match: ${isAdmin}
    `);
    
    if (!isAdmin) {
      console.warn(`[verifyAdmin] Access DENIED for ${userEmail}. Expected: ${rawAdminEmail}`);
      return { isAdmin: false, error: `Access denied. ${decodedToken.email} is not in the admin list.` };
    }
    
    return { isAdmin: true, decodedToken };
  } catch (e: any) {
    console.error("[verifyAdmin] Token verification failed:", e.message);
    return { isAdmin: false, error: `Token verification failed: ${e.message}` };
  }
}

export async function verifyUser(idToken?: string, userId?: string) {
  if (!idToken) return false;
  try {
    getAdminApp(); // Ensure app is initialized
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminEmail = process.env.ADMIN_EMAIL || 'baliadventours@gmail.com';
    if (decodedToken.email === adminEmail || decodedToken.role === 'admin') return true;
    return decodedToken.uid === userId;
  } catch (e) {
    return false;
  }
}
