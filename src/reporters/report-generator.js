import { generateJSONReport } from './json-reporter.js';
import { generateHTMLReport } from './html-reporter.js';
import { generatePDFReport } from './pdf-reporter.js';
import path from 'path';

/**
 * Generate a report based on the specified format
 * @param {Object} results - Analysis results
 * @param {Object} options - Report options
 * @returns {Promise<string>} Promise resolving to the report file path
 */
export async function generateReport(results, options = {}) {
  try {
    // Handle new CLI format
    const format = options.format || options.reportFormat || 'json';
    const outputDir = options.outputDir || '';
    const filename = options.filename || 'seo-report';
    const outputPath = options.outputPath || path.join(outputDir, filename);

    switch (format.toLowerCase()) {
      case 'json':
        return await generateJSONReport(results, outputPath);
      case 'html':
        return await generateHTMLReport(results, outputPath);
      case 'pdf':
        return await generatePDFReport(results, outputPath);
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
  } catch (error) {
    throw new Error(`Failed to generate report: ${error.message}`);
  }
} 