import fs from "fs";
import path from "path";
import { ERC7827Realization } from "./erc7827";

const LOG_DIR = path.join(process.cwd(), "memory/public/json/forensic_logs");

export async function logForensicEvent(realization: ERC7827Realization) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${timestamp}_${realization.type}_${realization.attestation.timestamp}.json`;
    const filePath = path.join(LOG_DIR, fileName);

    fs.writeFileSync(filePath, JSON.stringify(realization, null, 2));
    console.log(`[FORENSIC-LOGGER] Event secured: ${fileName}`);
  } catch (error) {
    console.error("[FORENSIC-LOGGER] Failed to log event:", error);
  }
}
