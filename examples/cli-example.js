#!/usr/bin/env node

/**
 * CLI Usage Example for SEO-Info
 * 
 * This script demonstrates how to use the SEO-Info CLI tool
 * with various options and configurations.
 * 
 * Run this example with:
 *   node examples/cli-example.js
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to run a CLI command
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n$ ${command} ${args.join(' ')}`);
    console.log('----------------------------------------');

    const childProcess = spawn(command, args, {
      shell: true,
      stdio: 'inherit'
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    childProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Main function to run CLI examples
async function runCliExamples() {
  // Path to the CLI script
  const cliPath = path.join(__dirname, '../bin/cli.js');

  // Make sure the CLI is executable
  fs.chmodSync(cliPath, '755');

  // Create a custom config file for the example
  const configPath = path.join(__dirname, 'example-config.json');
  const configContent = {
    "imageSizeLimit": 200000,
    "timeout": 45000,
    "thresholds": {
      "largeImageSize": 200000,
      "totalJsSize": 600000,
      "ssrContentLengthThreshold": 1500,
      "lazyLoadDelay": 2000
    },
    "reportFormat": "html",
    "outputPath": "./reports/custom-report"
  };

  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));

  try {
    console.log('=== SEO-Info CLI Examples ===\n');

    // Example 1: Basic usage
    console.log('Example 1: Basic usage with default options');
    await runCommand('node', [cliPath, 'https://example.com']);

    // Example 2: Generate HTML report
    console.log('\nExample 2: Generate HTML report');
    await runCommand('node', [
      cliPath,
      'https://example.com',
      '--format', 'html',
      '--output', './reports/example-html'
    ]);

    // Example 3: Use custom configuration file
    console.log('\nExample 3: Use custom configuration file');
    await runCommand('node', [
      cliPath,
      'https://example.com',
      '--config', configPath
    ]);

    // Example 4: Generate PDF report
    console.log('\nExample 4: Generate PDF report');
    await runCommand('node', [
      cliPath,
      'https://example.com',
      '--format', 'pdf',
      '--output', './reports/example-pdf'
    ]);

    // Example 5: Verbose output
    console.log('\nExample 5: Using verbose output');
    await runCommand('node', [
      cliPath,
      'https://example.com',
      '--verbose'
    ]);

    console.log('\n=== All examples completed successfully ===');
  } catch (error) {
    console.error('Error running examples:', error.message);
  } finally {
    // Clean up
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
}

// Run the examples
runCliExamples(); 