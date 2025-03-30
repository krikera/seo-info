import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer';

/**
 * Getting performance metrics using Lighthouse
 * @param {string} url - URL to analyze
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Promise resolving to performance metrics
 */
export async function getPerformanceMetrics(url, timeout) {
  let metrics = {};
  try {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      timeout,
    };
    const runnerResult = await lighthouse(url, options);

    metrics = {
      FCP: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
      LCP: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
      TBT: runnerResult.lhr.audits['total-blocking-time'].numericValue,
      performanceScore: runnerResult.lhr.categories.performance.score,
    };

    await chrome.kill();
  } catch (error) {
    console.error('Error getting performance metrics:', error.message);
  }
  return metrics;
}

/**
 * Detect Client-Side Rendering (CSR) or Server-Side Rendering (SSR)
 * @param {string} url - URL to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Promise resolving to CSR/SSR detection results
 */
export async function detectCSRorSSR(url, options) {
  let detection = {};
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();

    await page.setJavaScriptEnabled(false);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: options.timeout });
    const contentWithoutJS = await page.content();

    await page.setJavaScriptEnabled(true);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: options.timeout });
    const contentWithJS = await page.content();

    const lengthWithoutJS = contentWithoutJS.length;
    const lengthWithJS = contentWithJS.length;
    const threshold = options.thresholds.ssrContentLengthThreshold;

    const isSSR = lengthWithoutJS > threshold;
    const isCSR = !isSSR;

    const recommendation = isCSR
      ? 'Consider implementing SSR or pre-rendering for better SEO.'
      : 'Site appears to be using SSR effectively.';

    detection = { isSSR, isCSR, recommendation };
  } catch (error) {
    console.error('Error detecting CSR/SSR:', error.message);
  } finally {
    await browser.close();
  }
  return detection;
}

/**
 * Detect lazy loading implementation
 * @param {string} url - URL to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Promise resolving to lazy loading analysis results
 */
export async function detectLazyLoading(url, options) {
  const lazyLoadedImages = [];
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: options.timeout });

    const images = await page.$$eval('img', (imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute('src'),
        loading: img.getAttribute('loading'),
      }))
    );

    images.forEach((img) => {
      if (img.loading === 'lazy') {
        lazyLoadedImages.push(img.src);
      }
    });
  } catch (error) {
    console.error('Error detecting lazy loading:', error.message);
  } finally {
    await browser.close();
  }
  return { lazyLoadedImages };
}

/**
 * Analyze JavaScript dependencies
 * @param {string} url - URL to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Promise resolving to JS dependencies analysis results
 */
export async function analyzeJavaScriptDependencies(url, options) {
  const jsFiles = [];
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      request.continue();
    });

    page.on('response', async (response) => {
      if (response.request().resourceType() === 'script') {
        try {
          const buffer = await response.buffer();
          const size = buffer.length;
          jsFiles.push({ url: response.url(), size });
        } catch (error) {
          console.warn(`Error getting JS file size: ${error.message}`);
        }
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: options.timeout });
  } catch (error) {
    console.error('Error analyzing JavaScript dependencies:', error.message);
  } finally {
    await browser.close();
  }

  const totalJsSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
  const recommendation =
    totalJsSize > options.thresholds.totalJsSize
      ? 'Consider optimizing JavaScript dependencies to reduce page load time.'
      : 'JavaScript size is within acceptable limits.';

  return { jsFiles, totalJsSize, recommendation };
} 