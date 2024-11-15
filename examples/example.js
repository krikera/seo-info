import { analyzeSEO } from '../src/index.js'; // 'seo-info'
import fs from 'fs';

(async () => {
  const htmlContent = fs.readFileSync('path to your html file', 'utf-8'); // Replace with your html file
  const baseUrl = 'https://google.com'; // Replace with your base URL

  const options = {
    imageSizeLimit: 100 * 1024,
    timeout: 60000,
    reportFormat: 'pdf',
    outputPath: './reports/example-report',
  };

  try {
    const seoResults = await analyzeSEO(htmlContent, baseUrl, options);
    console.log('SEO analysis completed successfully.');
  } catch (error) {
    console.error('SEO analysis failed:', error.message);
  }
})();