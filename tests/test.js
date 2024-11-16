import { analyzeSEO } from '../src/index.js';
import assert from 'assert';

(async () => {
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Test Page</title>
    <meta name="description" content="This is a test page">
    <meta name="keywords" content="test, sample">
    <meta property="og:title" content="Test Page">
    <link rel="canonical" href="https://example.com/test-page">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <h1>Main Heading</h1>
    <h2>Subheading</h2>
    <h3>Sub-subheading</h3>
    <img src="https://via.placeholder.com/150" alt="Test Image">
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

  try {
    const results = await analyzeSEO(htmlContent, baseUrl, options);

    // Log the results to inspect the structure
    console.log('AnalyzeSEO Results:', results);

    // Basic assertions
    assert.strictEqual(results.title, 'Test Page', 'Title mismatch');
    assert.strictEqual(results.description, 'This is a test page', 'Description mismatch');
    assert.strictEqual(results.keywords, 'test, sample', 'Keywords mismatch');

    // Adjusted image assertions based on actual structure
    assert.strictEqual(results.images.length, 1, 'Incorrect number of images');
    assert.strictEqual(
      results.images[0].alt,
      'Test Image',
      'Image alt text mismatch'
    );

    // Performance metrics should be available
    assert(results.performanceMetrics, 'Performance metrics missing');

    // Accessibility issues should be an array
    assert(
      Array.isArray(results.accessibilityIssues),
      'Accessibility issues is not an array'
    );

    // CSR/SSR detection result
    assert(results.csrSsrDetection, 'CSR/SSR detection missing');

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error);
  }
})();