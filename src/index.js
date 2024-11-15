import { JSDOM } from 'jsdom';
import axios from 'axios';
import path from 'path';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import ejs from 'ejs';

export async function analyzeSEO(htmlContent, baseUrl, options = {}) {

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

  let results = {};

  try {
    const dom = new JSDOM(htmlContent);
    const { document } = dom.window;


    const title = document.querySelector('title')?.textContent || '';
    const description =
      document.querySelector('meta[name="description"]')?.getAttribute('content') ||
      '';
    const keywords =
      document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

    const openGraph = {};
    document.querySelectorAll('meta[property^="og:"]').forEach((meta) => {
      const property = meta.getAttribute('property');
      openGraph[property] = meta.getAttribute('content');
    });

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

    const headings = {};
    for (let i = 1; i <= 6; i++) {
      headings[`h${i}`] = Array.from(
        document.querySelectorAll(`h${i}`)
      ).map((h) => h.textContent);
    }

    const { images, largeImages } = await analyzeImages(document, baseUrl, options);

    const canonicalLink =
      document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const urlStructure = new URL(baseUrl).pathname;

    const scripts = Array.from(document.scripts).map((script) => script.src || 'inline');
    const jsCrawlabilityIssues = scripts.length === 0;

    const performanceMetrics = await getPerformanceMetrics(baseUrl, options.timeout);

    const mobileFriendliness = analyzeMobileFriendliness(document);

    const accessibilityIssues = await performAccessibilityAudit(baseUrl, options.timeout);

    const csrSsrDetection = await detectCSRorSSR(baseUrl, options);

    const lazyLoadingIssues = await detectLazyLoading(baseUrl, options);

    const jsDependencies = await analyzeJavaScriptDependencies(baseUrl, options);

    results = {
      title,
      description,
      keywords,
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
  } catch (error) {
    console.error('Error during SEO analysis:', error.message);
    throw error;
  }

  try {
    await generateReport(results, options);
  } catch (err) {
    console.error('Error generating report:', err.message);
  }

  return results;
}

async function analyzeImages(document, baseUrl, options) {
  const images = [];
  try {
    const imgElements = document.querySelectorAll('img');
    for (const img of imgElements) {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt') || '';
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

      images.push({ src, alt, fileSize, format });
    }
  } catch (err) {
    console.error('Error analyzing images:', err.message);
  }

  const largeImages = images.filter(
    (img) => img.fileSize && img.fileSize > options.thresholds.largeImageSize
  );
  return { images, largeImages };
}

async function getPerformanceMetrics(url, timeout) {
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
      performanceScore: runnerResult.lhr.categories.performance.score * 100,
    };

    await chrome.kill();
  } catch (error) {
    console.error('Error getting performance metrics:', error.message);
  }
  return metrics;
}

function analyzeMobileFriendliness(document) {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  const isResponsive =
    viewportMeta && /width=device-width/i.test(viewportMeta.getAttribute('content'));

  return { isResponsive };
}

async function performAccessibilityAudit(url, timeout) {
  const browser = await puppeteer.launch({ headless: 'new' });
  let accessibilityIssues = [];
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout });

    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.5.3/axe.min.js',
    });

    const result = await page.evaluate(async () => {
      return await axe.run();
    });

    accessibilityIssues = result.violations;
  } catch (error) {
    console.error('Error during accessibility audit:', error.message);
  } finally {
    await browser.close();
  }
  return accessibilityIssues;
}

async function detectCSRorSSR(url, options) {
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

async function detectLazyLoading(url, options) {
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

async function analyzeJavaScriptDependencies(url, options) {
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

async function generateReport(results, options) {
  const { reportFormat, outputPath } = options;
  const outputDir = path.dirname(outputPath);
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (reportFormat === 'json') {
      fs.writeFileSync(`${outputPath}.json`, JSON.stringify(results, null, 2));
    } else if (reportFormat === 'html') {
      const template = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SEO Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            h2 { color: #2e6c80; }
            pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
            .section { margin-bottom: 40px; }
          </style>
        </head>
        <body>
          <h1>SEO Analysis Report</h1>
          <% for(let section in results) { %>
            <div class="section">
              <h2><%= section %></h2>
              <pre><%= JSON.stringify(results[section], null, 2) %></pre>
            </div>
          <% } %>
        </body>
        </html>
      `;
      const htmlContent = ejs.render(template, { results });
      fs.writeFileSync(`${outputPath}.html`, htmlContent);
    } else if (reportFormat === 'pdf') {
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(`${outputPath}.pdf`));
      doc.fontSize(18).text('SEO Analysis Report', { align: 'center' });
      doc.moveDown();
      for (let section in results) {
        doc.fontSize(14).text(section, { underline: true });
        doc.fontSize(10).text(JSON.stringify(results[section], null, 2));
        doc.moveDown();
      }
      doc.end();
    } else {
      throw new Error(`Unsupported report format: ${reportFormat}`);
    }
  } catch (error) {
    throw new Error(`Failed to generate report: ${error.message}`);
  }
}