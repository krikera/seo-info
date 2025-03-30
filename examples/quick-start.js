/**
 * Quick Start Example for SEO-Info with Advanced Analysis
 */

import { analyzeSEO } from '../src/index.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSEOAnalysis() {
  try {
    // URL to analyze
    const url = 'https://example.com'; // Replace with your target URL

    console.log(`Analyzing ${url}...`);

    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'SEO-Info-Tool/1.0.3',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    });

    // Configure analysis options with advanced features
    const options = {
      url,
      headers: response.headers,
      advancedAnalysis: true,
      targetKeywords: ['example', 'domain', 'website'], // Keywords to analyze
      maxImageSize: 150, // KB
      minWords: 300,
      maxJsSize: 750, // KB
      reportFormat: 'json',
      outputPath: path.join(__dirname, '../reports/quick-start-report')
    };

    // Run the analysis
    const results = await analyzeSEO(response.data, options);

    // Display a summary of the results
    console.log('\nAnalysis completed! Summary:');
    console.log(`Title: ${results.title || 'N/A'}`);
    console.log(`Description: ${results.description || 'N/A'}`);

    // Advanced analysis results
    if (results.urlAnalysis) {
      console.log(`\nURL Score: ${results.urlAnalysis.score}/100`);
    }

    if (results.contentAnalysis?.readability) {
      console.log(`Readability Score: ${results.contentAnalysis.readability.score}/100`);
    }

    if (results.headersAnalysis) {
      console.log(`Security Headers Score: ${results.headersAnalysis.securityAnalysis.score}/100`);
    }

    if (results.socialMediaAnalysis) {
      console.log(`Social Media Score: ${results.socialMediaAnalysis.score}/100`);
    }

    if (results.structuredDataAnalysis) {
      console.log(`\nStructured Data:`);
      console.log(`Schema Types: ${results.structuredDataAnalysis.schemaTypes?.length > 0
        ? results.structuredDataAnalysis.schemaTypes.join(', ')
        : 'None found'}`);
    }

    // Log the full report path
    console.log(`\nFull report saved to: ${options.outputPath}.${options.reportFormat}`);

  } catch (error) {
    console.error('Error during analysis:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the analysis
runSEOAnalysis(); 