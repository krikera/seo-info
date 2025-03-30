/**
 * Basic usage example for SEO-Info
 * 
 * This example demonstrates how to use the SEO-Info library 
 * programmatically in your JavaScript applications.
 */
import { analyzeSEO } from '../src/index.js'; // Use 'seo-info' if installed via npm
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to fetch HTML content from a URL
async function fetchHtmlContent(url) {
  try {
    console.log(`Fetching content from ${url}...`);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch HTML content: ${error.message}`);
  }
}

// Main function
async function runSeoAnalysis() {
  // Define the URL to analyze
  const targetUrl = 'https://example.com';

  // Configuration options
  const options = {
    imageSizeLimit: 150 * 1024, // 150KB
    timeout: 60000, // 60 seconds
    thresholds: {
      largeImageSize: 150 * 1024, // 150KB
      totalJsSize: 500 * 1024, // 500KB
      ssrContentLengthThreshold: 1000, // Minimum content length for SSR detection
      lazyLoadDelay: 1500, // 1.5 seconds
    },
    reportFormat: 'html', // 'json', 'html', or 'pdf'
    outputPath: path.join(__dirname, '../reports/example-report'),
  };

  try {
    // Fetch HTML from the target URL
    console.log(`Starting SEO analysis for ${targetUrl}`);
    const htmlContent = await fetchHtmlContent(targetUrl);

    // Run the SEO analysis
    console.log('Running SEO analysis...');
    const results = await analyzeSEO(htmlContent, targetUrl, options);

    // Output results summary
    console.log('\n=== SEO Analysis Results ===');
    console.log(`Title: ${results.title}`);
    console.log(`Description: ${results.description}`);
    console.log(`Keywords: ${results.keywords}`);
    console.log(`Performance Score: ${Math.round(results.performanceMetrics.performanceScore * 100)}%`);
    console.log(`FCP: ${(results.performanceMetrics.FCP / 1000).toFixed(2)}s`);
    console.log(`LCP: ${(results.performanceMetrics.LCP / 1000).toFixed(2)}s`);
    console.log(`Images: ${results.images.length} (${results.largeImages.length} large images)`);
    console.log(`Accessibility Issues: ${results.accessibilityIssues.length}`);
    console.log(`Rendering: ${results.csrSsrDetection.isSSR ? 'Server-Side' : 'Client-Side'}`);

    // Report path
    console.log(`\nReport saved to: ${options.outputPath}.${options.reportFormat}`);

    return results;
  } catch (error) {
    console.error('SEO analysis failed:', error.message);
    throw error;
  }
}

// Run the example
runSeoAnalysis().catch(err => {
  console.error('Example failed:', err);
  process.exit(1);
});