import puppeteer from 'puppeteer';

/**
 * Perform accessibility audit using axe-core
 * @param {string} url - URL to analyze
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Array>} Promise resolving to accessibility issues
 */
export async function performAccessibilityAudit(url, timeout) {
  const browser = await puppeteer.launch({ headless: 'new' });
  let accessibilityIssues = [];
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout });

    // Load axe directly from CDN
    await page.addScriptTag({
      url: 'https://unpkg.com/axe-core@latest/axe.min.js',
    });

    const result = await page.evaluate(async () => {
      return await window.axe.run();
    });

    accessibilityIssues = result.violations;
  } catch (error) {
    console.error('Error during accessibility audit:', error.message);
  } finally {
    await browser.close();
  }
  return accessibilityIssues;
} 