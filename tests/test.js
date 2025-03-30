import { analyzeSEO } from '../src/index.js';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple test runner
const tests = [];
const describe = (name, fn) => {
  console.log(`\n\x1b[1m${name}\x1b[0m`);
  fn();
};

const it = (name, fn) => {
  tests.push({ name, fn });
};

const run = async () => {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test.fn();
      console.log(`  \x1b[32m✓\x1b[0m ${test.name}`);
      passed++;
    } catch (err) {
      console.log(`  \x1b[31m✗\x1b[0m ${test.name}`);
      console.error(`    \x1b[31m${err.message}\x1b[0m`);
      failed++;
    }
  }

  console.log(`\n\x1b[1mTest Results: ${passed} passed, ${failed} failed\x1b[0m`);
  if (failed > 0) {
    process.exit(1);
  }
};

describe('SEO Analyzer Tests', () => {
  // Test HTML content
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Test Page</title>
    <meta name="description" content="This is a test page">
    <meta name="keywords" content="test, sample">
    <meta property="og:title" content="Test Page">
    <meta property="og:description" content="This is a test page for social sharing">
    <meta property="og:image" content="https://example.com/image.jpg">
    <link rel="canonical" href="https://example.com/test-page">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <h1>Main Heading</h1>
    <h2>Subheading</h2>
    <h3>Sub-subheading</h3>
    <img src="https://via.placeholder.com/150" alt="Test Image">
    <img src="https://via.placeholder.com/200" loading="lazy" alt="">
    <script src="/app.js"></script>
    <noscript>Your browser does not support JavaScript!</noscript>
  </body>
  </html>
  `;

  const baseUrl = 'https://example.com';
  const options = {
    imageSizeLimit: 150 * 1024, // 150KB
    timeout: 30000,
    reportFormat: 'json',
    outputPath: './reports/test-report',
  };

  let results = null;

  it('should fetch and process HTML content', async () => {
    results = await analyzeSEO(htmlContent, baseUrl, options);
    assert(results, 'Results should not be null');
  });

  it('should extract basic meta information correctly', async () => {
    if (!results) results = await analyzeSEO(htmlContent, baseUrl, options);

    assert.strictEqual(results.title, 'Test Page', 'Title mismatch');
    assert.strictEqual(results.description, 'This is a test page', 'Description mismatch');
    assert.strictEqual(results.keywords, 'test, sample', 'Keywords mismatch');
  });

  it('should extract Open Graph tags', async () => {
    if (!results) results = await analyzeSEO(htmlContent, baseUrl, options);

    assert.strictEqual(results.openGraph['og:title'], 'Test Page', 'OG title mismatch');
    assert.strictEqual(results.openGraph['og:description'], 'This is a test page for social sharing', 'OG description mismatch');
    assert.strictEqual(results.openGraph['og:image'], 'https://example.com/image.jpg', 'OG image mismatch');
  });

  it('should detect headings structure', async () => {
    if (!results) results = await analyzeSEO(htmlContent, baseUrl, options);

    assert.strictEqual(results.headings.h1.length, 1, 'Should have 1 h1 tag');
    assert.strictEqual(results.headings.h1[0], 'Main Heading', 'H1 content mismatch');
    assert.strictEqual(results.headings.h2.length, 1, 'Should have 1 h2 tag');
    assert.strictEqual(results.headings.h3.length, 1, 'Should have 1 h3 tag');
  });

  it('should correctly analyze images', async () => {
    if (!results) results = await analyzeSEO(htmlContent, baseUrl, options);

    assert.strictEqual(results.images.length, 2, 'Incorrect number of images');

    const testImage = results.images.find(img => img.alt === 'Test Image');
    assert(testImage, 'Test image not found');

    const lazyImage = results.images.find(img => img.src.includes('200'));
    assert(lazyImage, 'Lazy loaded image not found');
  });

  it('should detect canonical link', async () => {
    if (!results) results = await analyzeSEO(htmlContent, baseUrl, options);

    assert.strictEqual(results.canonicalLink, 'https://example.com/test-page', 'Canonical link mismatch');
  });

  it('should check for mobile-friendliness', async () => {
    if (!results) results = await analyzeSEO(htmlContent, baseUrl, options);

    assert.strictEqual(results.mobileFriendliness.isResponsive, true, 'Should detect responsive design');
  });

  it('should generate a report file', async () => {
    if (!results) results = await analyzeSEO(htmlContent, baseUrl, options);

    const reportPath = `${options.outputPath}.json`;

    assert(fs.existsSync(reportPath), 'Report file should exist');

    // Clean up
    try {
      fs.unlinkSync(reportPath);
    } catch (err) {
      console.warn('Could not delete test report file');
    }
  });
});

// Run the tests
run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});