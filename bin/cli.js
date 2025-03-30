#!/usr/bin/env node

import { program } from 'commander';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeSEO, generateReport } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  CLI configuration
program
  .name('seo-info')
  .description('SEO analysis tool')
  .version('1.0.0')
  .argument('<url>', 'URL to analyze')
  .option('-f, --format <format>', 'Output format (json, html, pdf)', 'json')
  .option('-o, --output <directory>', 'Output directory', './reports')
  .option('-c, --config <file>', 'Configuration file')
  .option('-v, --verbose', 'Verbose output')
  .option('--no-advanced', 'Disable advanced analysis')
  .option('-k, --keywords <keywords>', 'Target keywords (comma separated)')
  .option('--site-urls <urls>', 'Additional site URLs for crawl path analysis (comma separated)')
  .option('--save-headers', 'Save HTTP headers in the report')
  .option('--max-image-size <size>', 'Maximum recommended image size in KB', '100')
  .option('--min-words <count>', 'Minimum recommended word count', '300')
  .option('--max-js-size <size>', 'Maximum recommended JavaScript size in KB', '400')
  .option('--crawl-depth <depth>', 'Crawl depth for site analysis', '0')
  .action(async (url, options) => {
    try {
      const spinner = ora('Analyzing URL...').start();

      // Loading config if provided
      let config = {};
      if (options.config) {
        try {
          const configPath = path.resolve(process.cwd(), options.config);
          const configContent = fs.readFileSync(configPath, 'utf8');
          config = JSON.parse(configContent);
          if (options.verbose) {
            spinner.info(`Loaded configuration from ${options.config}`);
            spinner.start();
          }
        } catch (error) {
          spinner.warn(`Failed to load config: ${error.message}`);
          spinner.start();
        }
      }

      // Merge command line options with config
      const analysisOptions = {
        ...config,
        advanced: options.advanced ?? config.advanced ?? true,
        maxImageSize: parseInt(options.maxImageSize || config.maxImageSize || 100, 10),
        minWords: parseInt(options.minWords || config.minWords || 300, 10),
        maxJsSize: parseInt(options.maxJsSize || config.maxJsSize || 400, 10),
        verbose: options.verbose || config.verbose || false,
        advancedAnalysis: options.advanced
      };

      // Process target keywords if provided
      if (options.keywords) {
        analysisOptions.targetKeywords = options.keywords.split(',').map(k => k.trim());
      }

      // Process site URLs if provided
      if (options.siteUrls) {
        analysisOptions.siteUrls = options.siteUrls.split(',').map(u => u.trim());
      }

      // Fetch the webpage
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'SEO-Info-Tool/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml'
        }
      });

      // Save headers if requested
      if (options.saveHeaders) {
        analysisOptions.headers = response.headers;
      }

      // Set URL for analysis
      analysisOptions.url = url;

      // Analyze the HTML content
      const htmlContent = response.data;
      const results = await analyzeSEO(htmlContent, analysisOptions);

      spinner.succeed('Analysis complete');

      // Output format handling
      const outputDir = path.resolve(process.cwd(), options.output);

      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate filename based on URL
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/[^a-z0-9]/gi, '_');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseFilename = `${hostname}_${timestamp}`;

      // Generate and save report
      const reportOptions = {
        format: options.format,
        outputDir,
        filename: baseFilename,
        url
      };

      const reportPath = await generateReport(results, reportOptions);

      console.log(chalk.green(`\nReport saved to: ${reportPath}`));

      // Printing summary to console
      if (options.verbose) {
        console.log('\n' + chalk.bold('Analysis Summary:'));
        console.log(chalk.cyan('Title: ') + (results.title || 'No title found'));
        console.log(chalk.cyan('Meta Description: ') + (results.description || 'Not found'));
        console.log(chalk.cyan('Performance Score: ') + getColoredScore(results.performanceScore));
        console.log(chalk.cyan('SEO Issues: ') + (results.issues?.length || 0));

        if (results.issues?.length > 0) {
          console.log('\n' + chalk.bold('Top SEO Issues:'));
          results.issues.slice(0, 5).forEach((issue, index) => {
            console.log(`${index + 1}. ${issue}`);
          });
        }

        // Displaying advanced analysis summary if available
        if (results.contentAnalysis) {
          console.log('\n' + chalk.bold('Content Analysis:'));
          console.log(chalk.cyan('Readability Score: ') +
            getColoredScore(results.contentAnalysis.readability?.score));
          console.log(chalk.cyan('Content-to-HTML Ratio: ') +
            `${results.contentAnalysis.contentRatio?.ratio || 'N/A'}% (${results.contentAnalysis.contentRatio?.rating || 'N/A'})`);
        }

        if (results.urlAnalysis) {
          console.log('\n' + chalk.bold('URL Analysis:'));
          console.log(chalk.cyan('URL Score: ') + getColoredScore(results.urlAnalysis.score));
          if (results.urlAnalysis.issues?.length > 0) {
            console.log(chalk.cyan('URL Issues: ') + results.urlAnalysis.issues[0]);
          }
        }

        if (results.socialMediaAnalysis) {
          console.log('\n' + chalk.bold('Social Media:'));
          console.log(chalk.cyan('Social Score: ') + getColoredScore(results.socialMediaAnalysis.score));
          const hasTags = (results.socialMediaAnalysis.openGraphAnalysis?.data?.allTags?.length > 0) ||
            (results.socialMediaAnalysis.twitterCardAnalysis?.data?.allTags?.length > 0);
          console.log(chalk.cyan('Social Tags: ') + (hasTags ? 'Present' : 'Missing'));
        }

        if (results.structuredDataAnalysis) {
          console.log('\n' + chalk.bold('Structured Data:'));
          console.log(chalk.cyan('Schema Types: ') +
            (results.structuredDataAnalysis.schemaTypes?.length > 0
              ? results.structuredDataAnalysis.schemaTypes.join(', ')
              : 'None found'));
        }
      } else {
        // Simple output for non-verbose mode
        console.log(`\n${chalk.bold('Quick Summary:')} ${results.title || 'No title found'}`);
        console.log(`SEO Score: ${getColoredScore(calculateOverallScore(results))}`);
        console.log(`Issues found: ${results.issues?.length || 0}`);
      }

    } catch (error) {
      ora().fail(chalk.red(`Error: ${error.message}`));
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

// Helper function to color scores
function getColoredScore(score) {
  if (!score && score !== 0) return chalk.gray('N/A');

  const numScore = typeof score === 'string' ? parseInt(score, 10) : score;

  if (numScore >= 80) return chalk.green(numScore);
  if (numScore >= 60) return chalk.yellow(numScore);
  return chalk.red(numScore);
}

// Calculating the overall score from various metrics
function calculateOverallScore(results) {
  const scores = [
    results.performanceScore || 0
  ];

  // Adding advanced scores if available
  if (results.contentAnalysis?.readability?.score) {
    scores.push(results.contentAnalysis.readability.score);
  }

  if (results.urlAnalysis?.score) {
    scores.push(results.urlAnalysis.score);
  }

  if (results.socialMediaAnalysis?.score) {
    scores.push(results.socialMediaAnalysis.score);
  }

  if (results.headersAnalysis?.score) {
    scores.push(results.headersAnalysis.score);
  }

  // Calculating the average
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

program.parse();