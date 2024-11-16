# SEO Info

An SEO Analyzer for Single Page Applications (SPAs) that provides comprehensive insights into SEO metrics, accessibility, performance, and best practices.

## Features

- **Command-Line Interface (CLI)**: Easily analyze websites directly from the terminal.
- **API Usage**: Integrate the analyzer into Node.js projects and CI/CD pipelines.
- **Configurable Settings**: Customize analysis parameters via configuration files or command-line options.
- **Detailed Reports**: Generate reports in JSON, HTML, or PDF formats.
- **Accessibility Audit**: Leverage Axe-core for in-depth accessibility analysis.
- **Performance Metrics**: Use Lighthouse to gather key performance indicators.
- **CSR/SSR Detection**: Determine if a site uses Client-Side or Server-Side Rendering.
- **Lazy Loading Detection**: Identify lazy-loaded images and content.
- **JavaScript Dependency Analysis**: Analyze JS dependencies and their impact on load times.
- **Error Handling**: Robust error handling for network issues and missing resources.
- **Savings Report**: Displays analysis statistics such as performance scores and accessibility issues.
- 
## Installation

### Via NPM

Install globally to use the CLI anywhere:

```bash
npm install -g seo-info
```
### Using NPX 

Run without installation

```bash
npx seo-info <url> [options]
```
### CLI Usage

Analyze a website by providing its URL

```bash
seo-info <url> [options]
```

Example 

```bash
seo-info https://example.com --format html --output ./reports/example-report
```
CLI Options:

- `-c, --config`: Path to a configuration file.
- `-0, --output`: Output path for the report (without extension).
- `-f, --format`: Format of the generated report (json, html, pdf).
- `-h, --help`: Display help information.

### API Usage 

Integrate the analyzer into your Node.js projects:

```javascript
import { analyzeSEO } from 'seo-info';

(async () => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Your SPA</title>
      <meta name="description" content="Description of your SPA">
      <!-- Other meta tags -->
    </head>
    <body>
      <!-- Your SPA content -->
    </body>
    </html>
  `;
  const baseUrl = 'https://example.com'; // Replace with your base URL

  const options = {
    imageSizeLimit: 200 * 1024, // 200KB
    timeout: 60000, // 60 seconds
    reportFormat: 'html',
    outputPath: './reports/seo-report',
  };

  try {
    const seoResults = await analyzeSEO(htmlContent, baseUrl, options);
    console.log('SEO analysis completed successfully.');
  } catch (error) {
    console.error('SEO analysis failed:', error.message);
  }
})();
```
### Configurations

You can customize the analyzer using a configuration file using .seoinforc. <br> <br>
Create a .seoinforc file in JSON format in your project's root directory:

```javascript
{
  "imageSizeLimit": 150000,
  "timeout": 60000,
  "thresholds": {
    "largeImageSize": 150000,
    "totalJsSize": 750000,
    "ssrContentLengthThreshold": 2000,
    "lazyLoadDelay": 1500
  },
  "reportFormat": "html",
  "outputPath": "./reports/seo-report"
}
```

## Output Statistics

Each compression operation returns statistics such as:

- Title: The title of the page.
- Description: Meta description content.
- Keywords: Meta keywords content.
- Open Graph Data: Extracted Open Graph tags.
- Headings: Structure of headings (h1 to h6).
- Images: Details about images, including alt text and file size.
- Performance Metrics: Key performance indicators from Lighthouse.
- Accessibility Issues: Detailed accessibility findings from axe-core.
- CSR/SSR Detection: Indicates whether the site uses Client-Side or Server-Side Rendering.
- Lazy Loading Issues: Information about lazy-loaded content.
- JavaScript Dependencies: Analysis of JS files and their sizes.


## License

This project is licensed under the MIT License.




