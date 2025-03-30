# SEO-Info Tool

A comprehensive SEO analysis tool that helps you identify and fix SEO issues on your website.

## Features

- **Basic SEO Analysis**: Meta tags, heading structure, links, etc.
- **Performance Analysis**: Load time, render-blocking resources, etc.
- **Accessibility Analysis**: WCAG compliance checks
- **Mobile Friendliness**: Responsive design checks, viewport configuration
- **Image Optimization**: Large image detection, alt text analysis
- **Advanced Analysis**:
  - **Content Analysis**: Readability scores, keyword density, and content structure
  - **URL Structure Analysis**: URL format, length, parameters, and crawl path
  - **HTTP Headers Analysis**: Security headers, caching, compression
  - **Social Media Analysis**: Open Graph, Twitter Cards, social sharing capabilities
  - **Structured Data Analysis**: JSON-LD and Microdata validation

## Installation

```bash
npm install seo-info
```

## Quick Start

### Command Line Usage

```bash
# Basic usage
seo-info https://example.com

# Generate HTML report
seo-info https://example.com --format html --output ./reports/my-report

# Generate PDF report
seo-info https://example.com --format pdf --output ./reports/my-report

# Analyze with target keywords
seo-info https://example.com --keywords "seo,analysis,tool"

# Enable verbose output
seo-info https://example.com --verbose

# Use custom configuration
seo-info https://example.com --config my-config.json
```

### Advanced Analysis Options

```bash
# Include HTTP headers analysis
seo-info https://example.com --save-headers

# Provide additional site URLs for crawl path analysis
seo-info https://example.com --site-urls "https://example.com/about,https://example.com/contact"

# Set custom thresholds
seo-info https://example.com --max-image-size 200 --min-words 500 --max-js-size 500
```

### API Usage

```javascript
import { analyzeSEO, generateReport } from 'seo-info';

// Fetch HTML content (using fetch, axios, or any method)
const htmlContent = await fetchHtmlContent('https://example.com');

// Run analysis
const results = await analyzeSEO(htmlContent, {
  url: 'https://example.com',
  targetKeywords: ['seo', 'analysis', 'tool'],
  advancedAnalysis: true
});

// Generate report
const reportPath = await generateReport(results, {
  format: 'html',
  outputDir: './reports',
  filename: 'seo-report'
});

console.log(`Report saved to: ${reportPath}`);
```

## Advanced Analysis Example

```javascript
import { analyzeSEO } from 'seo-info';
import axios from 'axios';

async function runAnalysis() {
  // Fetch HTML and headers
  const response = await axios.get('https://example.com');
  
  const results = await analyzeSEO(response.data, {
    url: 'https://example.com',
    headers: response.headers,
    targetKeywords: ['example', 'domain'],
    siteUrls: [
      'https://example.com/about',
      'https://example.com/contact'
    ],
    advancedAnalysis: true
  });
  
  // Access advanced analysis results
  console.log('Content Readability:', results.contentAnalysis.readability.score);
  console.log('URL Score:', results.urlAnalysis.score);
  console.log('Social Media Score:', results.socialMediaAnalysis.score);
  console.log('Security Headers:', results.headersAnalysis.securityAnalysis.score);
  console.log('Structured Data Types:', results.structuredDataAnalysis.schemaTypes);
}
```

## Configuration

Create a `.seoinforc` file in your project root:

```json
{
  "maxImageSize": 100,
  "minWords": 300,
  "maxJsSize": 400,
  "advancedAnalysis": true,
  "targetKeywords": ["seo", "website", "optimization"]
}
```

## Available Analyzers

### Basic Analyzers
- **HTML Analyzer**: Meta tags, headings, links, images
- **Performance Analyzer**: Core Web Vitals, resource loading, render-blocking resources
- **Accessibility Analyzer**: WCAG compliance, ARIA roles, contrast ratios

### Advanced Analyzers
- **Content Analyzer**: 
  - Readability scores (Flesch Reading Ease, Flesch-Kincaid Grade Level)
  - Content structure (paragraph lengths, lists usage)
  - Keyword density and usage
  - Content-to-HTML ratio
  
- **URL Analyzer**:
  - URL structure (protocol, domain, path)
  - Query parameters impact on SEO
  - Crawl path analysis with other site URLs
  
- **Headers Analyzer**:
  - Security headers (HSTS, CSP, X-Frame-Options)
  - Caching headers (Cache-Control, ETag)
  - Content-related headers (Content-Type, Content-Language)
  - Compression (GZIP, Brotli)
  
- **Social Media Analyzer**:
  - Open Graph meta tags
  - Twitter Card meta tags
  - Social media links and presence
  - Social sharing capabilities
  
- **Schema Analyzer**:
  - JSON-LD structured data validation
  - Microdata schema validation
  - Schema.org type detection and recommendations

## Report Formats

- **JSON**: Raw data for programmatic use
- **HTML**: Interactive HTML report with visualizations
- **PDF**: Printable PDF report with all analysis results

## License

MIT




