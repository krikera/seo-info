/**
 * This example demonstrates how to use the advanced analyzers
 * in the seo-info library.
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeSEO, generateReport } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Example URL to analyze
const targetUrl = 'https://example.com';

// Target keywords for content analysis
const targetKeywords = ['example', 'domain', 'internet', 'website'];

// Additional site URLs for crawl path analysis
const siteUrls = [
  'https://example.com/about',
  'https://example.com/contact',
  'https://example.com/products',
  'https://example.com/services',
  'https://example.com/blog'
];

async function runAdvancedAnalysis() {
  try {
    console.log(`🔍 Running advanced SEO analysis for ${targetUrl}`);

    // Fetch the HTML content
    console.log('📥 Fetching HTML content...');
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'SEO-Info-Tool/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    });

    // Configure analysis options
    const options = {
      url: targetUrl,
      headers: response.headers, // Pass headers for header analysis
      targetKeywords,           // Keywords to check for content relevance
      siteUrls,                 // URLs for crawl path analysis
      advancedAnalysis: true    // Enable advanced analysis
    };

    // Run the SEO analysis
    console.log('⚙️ Analyzing content...');
    const results = await analyzeSEO(response.data, options);

    // Output directory for reports
    const outputDir = path.resolve(__dirname, '../reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate reports in different formats
    console.log('📊 Generating reports...');

    // JSON report
    const jsonReportPath = await generateReport(results, {
      format: 'json',
      outputDir,
      filename: 'advanced-analysis',
      url: targetUrl
    });

    // HTML report 
    const htmlReportPath = await generateReport(results, {
      format: 'html',
      outputDir,
      filename: 'advanced-analysis',
      url: targetUrl
    });

    console.log('\n✅ Analysis complete!');
    console.log(`💾 JSON Report: ${jsonReportPath}`);
    console.log(`💾 HTML Report: ${htmlReportPath}`);

    // Print summary of advanced analysis
    console.log('\n📈 Advanced Analysis Summary:');

    // URL Analysis
    if (results.urlAnalysis) {
      console.log('\n🔗 URL Analysis:');
      console.log(`   Score: ${results.urlAnalysis.score}/100`);
      console.log(`   Issues: ${results.urlAnalysis.issues.length}`);
      if (results.urlAnalysis.issues.length > 0) {
        console.log('   Top issues:');
        results.urlAnalysis.issues.slice(0, 3).forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
    }

    // Content Analysis
    if (results.contentAnalysis) {
      console.log('\n📝 Content Analysis:');
      console.log(`   Readability score: ${results.contentAnalysis.readability.score}/100`);
      console.log(`   Content-to-HTML ratio: ${results.contentAnalysis.contentRatio.ratio}% (${results.contentAnalysis.contentRatio.rating})`);

      if (results.contentAnalysis.keywords) {
        console.log('\n   Keyword Analysis:');
        console.log(`   Word count: ${results.contentAnalysis.keywords.wordCount}`);
        console.log('   Top keywords:');
        results.contentAnalysis.keywords.topWords.slice(0, 5).forEach(word => {
          console.log(`   - ${word.word}: ${word.count} occurrences (${word.density.toFixed(2)}%)`);
        });

        console.log('\n   Target Keywords:');
        results.contentAnalysis.keywords.targetKeywordAnalysis.forEach(keyword => {
          console.log(`   - "${keyword.keyword}": ${keyword.count} occurrences (${keyword.density.toFixed(2)}%)`);
        });
      }
    }

    // Social Media Analysis
    if (results.socialMediaAnalysis) {
      console.log('\n📱 Social Media Analysis:');
      console.log(`   Score: ${results.socialMediaAnalysis.score}/100`);

      // Open Graph
      const ogTags = results.socialMediaAnalysis.openGraphAnalysis.data.allTags.length;
      console.log(`   Open Graph tags: ${ogTags}`);

      // Twitter Cards
      const twitterTags = results.socialMediaAnalysis.twitterCardAnalysis.data.allTags.length;
      console.log(`   Twitter Card tags: ${twitterTags}`);

      // Social Links
      const platforms = results.socialMediaAnalysis.socialLinksAnalysis.linkedPlatforms;
      console.log(`   Social platforms linked: ${platforms.length > 0 ? platforms.join(', ') : 'None'}`);
    }

    // Headers Analysis
    if (results.headersAnalysis) {
      console.log('\n📋 HTTP Headers Analysis:');
      console.log(`   Score: ${results.headersAnalysis.score}/100`);
      console.log(`   Security Score: ${results.headersAnalysis.securityAnalysis.score}/100`);
      console.log(`   Cache Score: ${results.headersAnalysis.cacheAnalysis.score}/100`);
      console.log(`   Compression: ${results.headersAnalysis.compressionAnalysis.contentEncoding || 'None'}`);
    }

    // Structured Data Analysis
    if (results.structuredDataAnalysis) {
      console.log('\n📊 Structured Data Analysis:');
      console.log(`   JSON-LD: ${results.structuredDataAnalysis.jsonLdData.length} items`);
      console.log(`   Microdata: ${results.structuredDataAnalysis.microdataItems.length} items`);

      if (results.structuredDataAnalysis.schemaTypes.length > 0) {
        console.log(`   Schema Types: ${results.structuredDataAnalysis.schemaTypes.join(', ')}`);
      } else {
        console.log('   No schema.org types detected');
      }
    }

  } catch (error) {
    console.error('❌ Error running advanced analysis:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the analysis
runAdvancedAnalysis(); 