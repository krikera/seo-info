import { JSDOM } from 'jsdom';
import axios from 'axios';
import path from 'path';

/**
 * Extract basic meta information from HTML document
 * @param {Document} document - The DOM document
 * @returns {Object} Object containing title, description, keywords
 */
export function extractMetaInfo(document) {
  const title = document.querySelector('title')?.textContent || '';
  const description =
    document.querySelector('meta[name="description"]')?.getAttribute('content') ||
    '';
  const keywords =
    document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

  return { title, description, keywords };
}

/**
 * Extract Open Graph meta tags
 * @param {Document} document - The DOM document
 * @returns {Object} Object containing Open Graph properties
 */
export function extractOpenGraph(document) {
  const openGraph = {};
  document.querySelectorAll('meta[property^="og:"]').forEach((meta) => {
    const property = meta.getAttribute('property');
    openGraph[property] = meta.getAttribute('content');
  });
  return openGraph;
}

/**
 * Extract headings structure
 * @param {Document} document - The DOM document
 * @returns {Object} Object containing heading levels and their content
 */
export function extractHeadings(document) {
  const headings = {};
  for (let i = 1; i <= 6; i++) {
    headings[`h${i}`] = Array.from(
      document.querySelectorAll(`h${i}`)
    ).map((h) => h.textContent);
  }
  return headings;
}

/**
 * Extract canonical link
 * @param {Document} document - The DOM document
 * @returns {string} Canonical link or empty string
 */
export function extractCanonicalLink(document) {
  return document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
}

/**
 * Check if the page is mobile-friendly
 * @param {Document} document - The DOM document
 * @returns {Object} Object containing mobile-friendliness information
 */
export function analyzeMobileFriendliness(document) {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  const isResponsive =
    viewportMeta && /width=device-width/i.test(viewportMeta.getAttribute('content'));

  return { isResponsive };
}

/**
 * Analyze images in the document
 * @param {Document} document - The DOM document
 * @param {string} baseUrl - Base URL of the page
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Promise resolving to image analysis results
 */
export async function analyzeImages(document, baseUrl, options) {
  const images = [];
  try {
    const imgElements = document.querySelectorAll('img');
    for (const img of imgElements) {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt') || '';
      const loading = img.getAttribute('loading') || '';
      let fileSize = null;
      const format = path.extname(src).toLowerCase();

      const imgUrl = new URL(src, baseUrl).href;

      try {
        const response = await axios.head(imgUrl, { timeout: options.timeout });
        fileSize = response.headers['content-length']
          ? parseInt(response.headers['content-length'], 10)
          : null;
      } catch (e) {
        console.warn(`Image not found or inaccessible: ${src}`);
        continue; // Skip to the next image
      }

      images.push({ src, alt, loading, fileSize, format });
    }
  } catch (err) {
    console.error('Error analyzing images:', err.message);
  }

  const largeImages = images.filter(
    (img) => img.fileSize && img.fileSize > options.thresholds.largeImageSize
  );
  return { images, largeImages };
}

/**
 * Analyze JS crawlability
 * @param {Document} document - The DOM document
 * @returns {Object} Object containing JS crawlability information
 */
export function analyzeJSCrawlability(document) {
  const scripts = Array.from(document.scripts).map((script) => script.src || 'inline');
  const jsCrawlabilityIssues = scripts.length === 0;
  return { scripts, jsCrawlabilityIssues };
}

/**
 * Get robots.txt and sitemap.xml content
 * @param {string} baseUrl - Base URL of the site
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Promise resolving to robots.txt and sitemap.xml content
 */
export async function getSEOFiles(baseUrl, options) {
  let robotsTxt = '';
  let sitemapXml = '';

  try {
    const robotsResponse = await axios.get(`${baseUrl}/robots.txt`, {
      timeout: options.timeout,
    });
    robotsTxt = robotsResponse.data;
  } catch (e) {
    robotsTxt = 'Not Found';
  }

  try {
    const sitemapResponse = await axios.get(`${baseUrl}/sitemap.xml`, {
      timeout: options.timeout,
    });
    sitemapXml = sitemapResponse.data;
  } catch (e) {
    sitemapXml = 'Not Found';
  }

  return { robotsTxt, sitemapXml };
}

/**
 * Create a DOM from HTML content
 * @param {string} htmlContent - HTML content string
 * @returns {Object} Object containing DOM document
 */
export function createDOM(htmlContent) {
  const dom = new JSDOM(htmlContent);
  return { dom, document: dom.window.document };
} 