import axios from "axios";
import fs from "fs";
import path from "path";

async function test() {
  console.log("Starting Firestore REST API test...");
  try {
    const rootPath = process.cwd();
    const configPath = path.resolve(rootPath, "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found at ${configPath}`);
    }
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const projectId = config.projectId;
    const databaseId = config.firestoreDatabaseId || "(default)";
    const apiKey = config.apiKey;

    console.log("Project:", projectId);
    console.log("Database ID:", databaseId);

    // Call REST endpoint
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/settings/general?key=${apiKey}`;
    console.log("Requesting URL:", url);

    const response = await axios.get(url);
    console.log("SUCCESS: Response received from REST API!");
    const fields = response.data.fields || {};
    
    // Parse firestore REST values format
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(fields)) {
      const v = val as any;
      if ('stringValue' in v) parsed[key] = v.stringValue;
      else if ('booleanValue' in v) parsed[key] = v.booleanValue;
      else if ('integerValue' in v) parsed[key] = parseInt(v.integerValue);
      else if ('doubleValue' in v) parsed[key] = parseFloat(v.doubleValue);
      else parsed[key] = v;
    }

    console.log("Parsed Settings:", JSON.stringify(parsed, null, 2));
  } catch (err: any) {
    console.error("ERROR: Firestore REST API failed:", err.response?.data || err.message);
  }
}

test();
