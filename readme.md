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

## Installation

### Via NPM

Install globally to use the CLI anywhere:

```bash
npm install -g seo-info