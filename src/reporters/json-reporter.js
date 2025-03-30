import fs from 'fs';
import { ensureOutputDir } from '../utils/paths.js';

/**
 * Generate a JSON report
 * @param {Object} results - Analysis results
 * @param {string} outputPath - Path to save the report
 * @returns {Promise<string>} Promise resolving to the report file path
 */
export async function generateJSONReport(results, outputPath) {
  try {
    ensureOutputDir(outputPath);

    const filePath = `${outputPath}.json`;
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

    return filePath;
  } catch (error) {
    throw new Error(`Failed to generate JSON report: ${error.message}`);
  }
} 