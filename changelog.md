# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-03-30

### Added
- Advanced analysis features:
  - Content analysis with readability scores and keyword density
  - URL structure analysis for SEO optimization
  - HTTP headers analysis for security and performance
  - Social media presence analysis
  - Structured data validation for schema.org markup

### Fixed
- Fixed social media analyzer to work in environments without `getComputedStyle`
- Improved error handling in CLI output to prevent crashes
- Fixed issue with headers analysis when running in Node.js environment
- Added safeguards against undefined values in report generation
- Fixed generateReport export in index.js

## [1.0.2] - 2024-11-16

### Added

- Github link in package.json

## [1.0.1] - 2024-11-16

### Updated

- Dependencies

## [1.0.0] - 2024-11-15

### Added
- Initial release of SEO Info
- Core SEO analysis functionality:
- Metadata extraction (titles, descriptions, keywords)
- Open Graph tag extraction
- Header structure analysis
- Robots.txt and sitemap.xml fetching
- Image optimization analysis:
- Detection of large images
- Alt text verification
- Canonical tags and URL structure checks
- JavaScript crawlability analysis
- Basic accessibility audit
- Performance metrics placeholders
- Command-line interface (CLI)
- Programmatic API for Node.js integration
- Configuration file support (.seoinforc)
- JSON report generation
- Documentation for CLI and API usage
- Examples and tests

### Changed
- N/A (Initial Release)

### Deprecated
- N/A (Initial Release)

### Removed
- N/A (Initial Release)

### Fixed
- N/A (Initial Release)

### Security
- N/A (Initial Release)