#!/usr/bin/env node

import { analyzeSEO } from '../src/index.js';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Enable ESM __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Command-line argument parsing
const argv = yargs(hideBin(process.argv))
  .usage('Usage: seo-info <url> [options]')
  .demandCommand(1, 'You must provide a URL to analyze.')
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Path to configuration file',
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output path for the report (without extension)',
    default: './seo-report',
  })
  .option('format', {
    alias: 'f',
    type: 'string',
    choices: ['json', 'html', 'pdf'],
    description: 'Format of the generated report',
    default: 'json',
  })
  .help()
  .alias('help', 'h')
  .argv;

(async () => {
  const url = argv._[0];
  const configPath = argv.config || '.seoinforc';
  const outputPath = argv.output;
  const reportFormat = argv.format;

  // Load user configuration if available
  let userOptions = {};
  try {
    const configFullPath = path.resolve(process.cwd(), configPath);
    if (fs.existsSync(configFullPath)) {
      userOptions = JSON.parse(fs.readFileSync(configFullPath, 'utf-8'));
      console.log(`Loaded configuration from ${configFullPath}`);
    }
  } catch (error) {
    console.error(`Error loading configuration file: ${error.message}`);
  }

  // Default options
  const options = {
    outputPath,
    reportFormat,
    ...userOptions,
  };

  try {
    const htmlContent = await fetchHTMLContent(url);
    await analyzeSEO(htmlContent, url, options);
    console.log('SEO analysis completed successfully.');
    console.log(`Report saved at ${path.resolve(options.outputPath)}.${options.reportFormat}`);
  } catch (error) {
    console.error('SEO analysis failed:', error.message);
    process.exit(1);
  }
})();

async function fetchHTMLContent(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch HTML content from ${url}: ${error.message}`);
  }
}