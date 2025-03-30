import fs from 'fs';
import ejs from 'ejs';
import { ensureOutputDir } from '../utils/paths.js';
import path from 'path';

// Import HTML template from separate file
import { htmlTemplate } from './templates/html-template.js';

/**
 * Generate an HTML report
 * @param {Object} results - Analysis results
 * @param {string} outputPath - Path to save the report
 * @returns {Promise<string>} Promise resolving to the report file path
 */
export async function generateHTMLReport(results, outputPath) {
  try {
    ensureOutputDir(outputPath);

    const filePath = `${outputPath}.html`;
    const htmlContent = ejs.render(htmlTemplate, {
      results,
      baseUrl: results.baseUrl || 'Unknown',
      generatedDate: new Date()
    });

    fs.writeFileSync(filePath, htmlContent);

    return filePath;
  } catch (error) {
    throw new Error(`Failed to generate HTML report: ${error.message}`);
  }
} 