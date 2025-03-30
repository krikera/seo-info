import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

/**
 * Utility function to get the current file's directory
 * @param {string} importMetaUrl - The import.meta.url of the calling module
 * @returns {Object} Object containing __filename and __dirname
 */
export function getDirname(importMetaUrl) {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = path.dirname(__filename);
  return { __filename, __dirname };
}

/**
 * Ensures that the output directory exists
 * @param {string} outputPath - The path where reports will be saved
 */
export function ensureOutputDir(outputPath) {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
} 