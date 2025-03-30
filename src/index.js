// Importing analyzers
import {
  createDOM,
  extractMetaInfo,
  extractOpenGraph,
  extractHeadings,
  extractCanonicalLink,
  analyzeMobileFriendliness,
  analyzeImages,
  analyzeJSCrawlability,
  getSEOFiles
} from './analyzers/html-analyzer.js';

import {
  getPerformanceMetrics,
  detectCSRorSSR,
  detectLazyLoading,
  analyzeJavaScriptDependencies
} from './analyzers/performance-analyzer.js';

import {
  performAccessibilityAudit
} from './analyzers/accessibility-analyzer.js';

// Import report generator
import { generateReport } from './reporters/report-generator.js';

// Import advanced analyzers
import { analyzeHeaders } from './analyzers/advanced/headers-analyzer.js';
import { analyzeUrl } from './analyzers/advanced/url-analyzer.js';
import { analyzeSocialMedia } from './analyzers/advanced/social-analyzer.js';
import { analyzeContentStructure, analyzeContentRatio, calculateReadability, analyzeKeywords } from './analyzers/advanced/content-analyzer.js';
import { analyzeStructuredData } from './analyzers/advanced/schema-analyzer.js';

/**
 * Analyze SEO aspects of a webpage
 * @param {string} htmlContent - HTML content of the page to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Promise resolving to analysis results
 */
export async function analyzeSEO(htmlContent, options = {}) {
  // Default options
  const defaultOptions = {
    imageSizeLimit: 100 * 1024, // 100KB
    timeout: 30000, // 30 seconds
    thresholds: {
      largeImageSize: 100 * 1024, // 100KB
      totalJsSize: 500 * 1024, // 500KB
      ssrContentLengthThreshold: 1000,
      lazyLoadDelay: 1000, // milliseconds
    },
    reportFormat: 'json', // 'json', 'html', 'pdf'
    outputPath: './seo-report',
  };

  options = { ...defaultOptions, ...options };
  const baseUrl = options.url; // Get the URL from options
  if (!baseUrl) {
    throw new Error('URL is required in options');
  }

  let results = { baseUrl };

  try {
    // Create DOM from HTML content
    const { document } = createDOM(htmlContent);

    // Extract meta information
    const metaInfo = extractMetaInfo(document);
    const openGraph = extractOpenGraph(document);
    const headings = extractHeadings(document);
    const canonicalLink = extractCanonicalLink(document);
    const urlStructure = new URL(baseUrl).pathname;

    // Get SEO files
    const { robotsTxt, sitemapXml } = await getSEOFiles(baseUrl, options);

    // Analyze images
    const { images, largeImages } = await analyzeImages(document, baseUrl, options);

    // Analyze JS crawlability
    const { scripts, jsCrawlabilityIssues } = analyzeJSCrawlability(document);

    // Analyze mobile-friendliness
    const mobileFriendliness = analyzeMobileFriendliness(document);

    // Performance analysis
    const performanceMetrics = await getPerformanceMetrics(baseUrl, options.timeout);

    // Accessibility analysis
    const accessibilityIssues = await performAccessibilityAudit(baseUrl, options.timeout);

    // Rendering and JavaScript analysis
    const csrSsrDetection = await detectCSRorSSR(baseUrl, options);
    const lazyLoadingIssues = await detectLazyLoading(baseUrl, options);
    const jsDependencies = await analyzeJavaScriptDependencies(baseUrl, options);

    // Combine all results
    results = {
      ...results,
      ...metaInfo,
      openGraph,
      robotsTxt,
      sitemapXml,
      headings,
      images,
      largeImages,
      canonicalLink,
      urlStructure,
      jsCrawlabilityIssues,
      performanceMetrics,
      mobileFriendliness,
      accessibilityIssues,
      csrSsrDetection,
      lazyLoadingIssues,
      jsDependencies,
    };

    // Run advanced analyzers if enabled
    if (options.advancedAnalysis !== false) {
      try {
        // Extract text content for content analysis
        const textContent = extractTextContent(document.body);

        // Headers analysis (if headers are provided)
        if (options.headers) {
          results.headersAnalysis = analyzeHeaders(options.headers);
        }

        // URL analysis
        if (options.url) {
          results.urlAnalysis = analyzeUrl(options.url, options.siteUrls || []);
        }

        // Social media analysis
        results.socialMediaAnalysis = analyzeSocialMedia(document, options.url);

        // Content analysis
        results.contentAnalysis = {
          readability: calculateReadability(textContent),
          contentStructure: analyzeContentStructure(document),
          contentRatio: analyzeContentRatio(htmlContent, textContent)
        };

        // Keyword analysis (if target keywords are provided)
        if (options.targetKeywords && options.targetKeywords.length > 0) {
          results.contentAnalysis.keywords = analyzeKeywords(textContent, options.targetKeywords);
        }

        // Structured data analysis
        results.structuredDataAnalysis = analyzeStructuredData(document);
      } catch (error) {
        console.error('Error in advanced analysis:', error);
        results.errors = results.errors || [];
        results.errors.push({
          type: 'advanced_analysis_error',
          message: error.message,
          stack: error.stack
        });
      }
    }
  } catch (error) {
    console.error('Error during SEO analysis:', error.message);
    throw error;
  }

  try {
    // Generate report
    const reportPath = await generateReport(results, options);

    if (options.verbose) {
      console.log(`Report generated successfully at: ${reportPath}`);
    }
  } catch (err) {
    console.error('Error generating report:', err.message);
  }

  return results;
}

/**
 * Helper function to extract text content from an element
 * @param {Element} element - Element to extract text from
 * @returns {string} Text content
 */
function extractTextContent(element) {
  if (!element) return '';

  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true);

  // Remove script and style elements
  const scripts = clone.querySelectorAll('script, style, noscript, iframe, svg');
  scripts.forEach(script => script.remove());

  // Get text content
  let text = '';
  try {
    text = clone.textContent || '';
  } catch (e) {
    console.error('Error extracting text content:', e);
    text = '';
  }

  // Clean the text (remove extra whitespace)
  return text.replace(/\s+/g, ' ').trim();
}

// Export the generateReport function directly
export { generateReport }; 