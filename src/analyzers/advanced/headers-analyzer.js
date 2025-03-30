/**
 * This is the HTTP Headers Analyzer
 * It Analyzes HTTP headers for SEO, security, and performance issues
 */

/**
 * Analyzes HTTP headers for SEO and technical issues
 * @param {Object} headers - HTTP headers object
 * @returns {Object} Analysis of HTTP headers
 */
export function analyzeHeaders(headers) {
  if (!headers || Object.keys(headers).length === 0) {
    return {
      issues: ['No headers provided for analysis'],
      recommendations: ['Ensure HTTP headers are properly captured and provided for analysis'],
      score: 0
    };
  }

  // Normalize header names (headers can be case-insensitive)
  const normalizedHeaders = {};
  Object.keys(headers).forEach(key => {
    normalizedHeaders[key.toLowerCase()] = headers[key];
  });

  // Analyze different aspects of headers
  const cacheAnalysis = analyzeCacheHeaders(normalizedHeaders);
  const securityAnalysis = analyzeSecurityHeaders(normalizedHeaders);
  const contentAnalysis = analyzeContentHeaders(normalizedHeaders);
  const compressionAnalysis = analyzeCompression(normalizedHeaders);

  // Combine all issues and recommendations
  const issues = [
    ...cacheAnalysis.issues,
    ...securityAnalysis.issues,
    ...contentAnalysis.issues,
    ...compressionAnalysis.issues
  ];

  const recommendations = [
    ...cacheAnalysis.recommendations,
    ...securityAnalysis.recommendations,
    ...contentAnalysis.recommendations,
    ...compressionAnalysis.recommendations
  ];

  // Calculate overall score
  const score = Math.round(
    (cacheAnalysis.score + securityAnalysis.score +
      contentAnalysis.score + compressionAnalysis.score) / 4
  );

  return {
    headers: normalizedHeaders,
    cacheAnalysis,
    securityAnalysis,
    contentAnalysis,
    compressionAnalysis,
    issues,
    recommendations,
    score
  };
}

/**
 * Analyzes cache-related headers
 * @param {Object} headers - Normalized HTTP headers
 * @returns {Object} Cache headers analysis
 */
function analyzeCacheHeaders(headers) {
  const issues = [];
  const recommendations = [];
  let score = 0;

  // Check for cache-control header
  const hasCacheControl = 'cache-control' in headers;
  const cacheControlValue = headers['cache-control'] || '';

  if (!hasCacheControl) {
    issues.push('No Cache-Control header found');
    recommendations.push('Add a Cache-Control header to improve resource caching');
  } else {
    // Check Cache-Control value
    if (cacheControlValue.includes('no-store') || cacheControlValue.includes('no-cache')) {
      issues.push('Cache-Control prevents caching entirely');
      recommendations.push('Consider enabling caching for static assets to improve performance');
    } else if (!cacheControlValue.includes('max-age')) {
      issues.push('Cache-Control has no max-age directive');
      recommendations.push('Add max-age directive to Cache-Control header for better caching control');
    } else {
      // Parse max-age value
      const maxAgeMatch = cacheControlValue.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        const maxAge = parseInt(maxAgeMatch[1], 10);
        if (maxAge < 86400) { // Less than a day
          issues.push(`Short cache period (${maxAge} seconds)`);
          recommendations.push('Consider increasing max-age for static resources to at least 1 day (86400)');
        } else {
          score += 50;
        }
      }
    }

    // Check for public/private
    if (cacheControlValue.includes('public')) {
      score += 20;
    } else if (!cacheControlValue.includes('private')) {
      recommendations.push('Consider adding "public" directive to Cache-Control for static resources');
    }
  }

  // Check for ETag
  if (!('etag' in headers)) {
    issues.push('No ETag header found');
    recommendations.push('Add ETag header to enable conditional requests and save bandwidth');
  } else {
    score += 15;
  }

  // Check for Last-Modified
  if (!('last-modified' in headers)) {
    issues.push('No Last-Modified header found');
    recommendations.push('Add Last-Modified header to enable conditional requests');
  } else {
    score += 15;
  }

  // If no issues found, the score is perfect
  if (issues.length === 0) {
    score = 100;
  }

  // Ensure score is capped at 100
  score = Math.min(100, score);

  return {
    issues,
    recommendations,
    score,
    cacheControl: cacheControlValue,
    etag: headers['etag'] || null,
    lastModified: headers['last-modified'] || null
  };
}

/**
 * Analyzes security-related headers
 * @param {Object} headers - Normalized HTTP headers
 * @returns {Object} Security headers analysis
 */
function analyzeSecurityHeaders(headers) {
  const issues = [];
  const recommendations = [];
  let score = 0;

  // Check for security headers
  const securityHeaders = {
    'strict-transport-security': {
      present: 'strict-transport-security' in headers,
      recommendation: 'Add Strict-Transport-Security header to ensure secure connections',
      score: 15
    },
    'content-security-policy': {
      present: 'content-security-policy' in headers,
      recommendation: 'Add Content-Security-Policy header to prevent XSS attacks',
      score: 15
    },
    'x-content-type-options': {
      present: 'x-content-type-options' in headers,
      recommendation: 'Add X-Content-Type-Options: nosniff to prevent MIME type sniffing',
      score: 10
    },
    'x-frame-options': {
      present: 'x-frame-options' in headers,
      recommendation: 'Add X-Frame-Options header to prevent clickjacking',
      score: 10
    },
    'x-xss-protection': {
      present: 'x-xss-protection' in headers,
      recommendation: 'Add X-XSS-Protection header to enable browser XSS filtering',
      score: 10
    },
    'referrer-policy': {
      present: 'referrer-policy' in headers,
      recommendation: 'Add Referrer-Policy header to control referrer information',
      score: 10
    },
    'feature-policy': {
      present: 'feature-policy' in headers || 'permissions-policy' in headers,
      recommendation: 'Add Permissions-Policy header to control browser features',
      score: 10
    }
  };

  // Check each security header
  Object.entries(securityHeaders).forEach(([name, info]) => {
    if (!info.present) {
      issues.push(`Missing ${name} header`);
      recommendations.push(info.recommendation);
    } else {
      score += info.score;
    }
  });

  // HTTPS check
  if (headers['strict-transport-security']) {
    score += 20;
  } else {
    issues.push('No HSTS header found, site may not be enforcing HTTPS');
    recommendations.push('Implement HTTPS and add Strict-Transport-Security header');
  }

  // If no issues found, the score is perfect
  if (issues.length === 0) {
    score = 100;
  }

  // Ensure score is capped at 100
  score = Math.min(100, score);

  return {
    issues,
    recommendations,
    score,
    securityHeadersPresent: Object.entries(securityHeaders)
      .filter(([_, info]) => info.present)
      .map(([name, _]) => name)
  };
}

/**
 * Analyzes content-related headers
 * @param {Object} headers - Normalized HTTP headers
 * @returns {Object} Content headers analysis
 */
function analyzeContentHeaders(headers) {
  const issues = [];
  const recommendations = [];
  let score = 0;

  // Check content-type
  if (!('content-type' in headers)) {
    issues.push('No Content-Type header found');
    recommendations.push('Add Content-Type header to specify the MIME type');
  } else {
    score += 40;

    // Check for charset
    const contentTypeValue = headers['content-type'];
    if (!contentTypeValue.includes('charset=')) {
      issues.push('Content-Type header has no charset specification');
      recommendations.push('Add charset to Content-Type header (e.g., text/html; charset=UTF-8)');
    } else if (!contentTypeValue.toLowerCase().includes('utf-8')) {
      issues.push('Content-Type charset is not UTF-8');
      recommendations.push('Use UTF-8 charset for better international character support');
    } else {
      score += 20;
    }
  }

  // Check for language
  if (!('content-language' in headers)) {
    issues.push('No Content-Language header found');
    recommendations.push('Add Content-Language header to specify the language of your content');
  } else {
    score += 20;
  }

  // Check X-Robots-Tag
  if (!('x-robots-tag' in headers)) {
    // Not necessarily an issue, but worth mentioning
    recommendations.push('Consider using X-Robots-Tag header for more granular indexing control');
  } else {
    score += 20;

    // Check for potentially problematic values
    const xRobotsValue = headers['x-robots-tag'];
    if (xRobotsValue.includes('noindex')) {
      issues.push('X-Robots-Tag prevents indexing');
      recommendations.push('Remove "noindex" from X-Robots-Tag if you want the page to be indexed');
    }
  }

  // If no issues found, the score is perfect
  if (issues.length === 0) {
    score = 100;
  }

  // Ensure score is capped at 100
  score = Math.min(100, score);

  return {
    issues,
    recommendations,
    score,
    contentType: headers['content-type'] || null,
    contentLanguage: headers['content-language'] || null,
    xRobotsTag: headers['x-robots-tag'] || null
  };
}

/**
 * Analyzes compression-related headers
 * @param {Object} headers - Normalized HTTP headers
 * @returns {Object} Compression headers analysis
 */
function analyzeCompression(headers) {
  const issues = [];
  const recommendations = [];
  let score = 0;

  // Check for compression
  const encodingHeader = headers['content-encoding'];

  if (!encodingHeader) {
    issues.push('No Content-Encoding header found, compression may not be enabled');
    recommendations.push('Enable GZIP or Brotli compression to reduce page size and improve load times');
  } else {
    if (encodingHeader.includes('br')) {
      // Brotli compression is best
      score = 100;
    } else if (encodingHeader.includes('gzip')) {
      // GZIP compression is good
      score = 80;
      recommendations.push('Consider using Brotli compression instead of GZIP for better compression ratios');
    } else if (encodingHeader.includes('deflate')) {
      // Deflate is less common
      score = 70;
      recommendations.push('Consider using Brotli or GZIP compression instead of deflate');
    } else {
      // Unknown compression
      score = 50;
      issues.push(`Unknown compression method: ${encodingHeader}`);
      recommendations.push('Use standard compression methods like Brotli or GZIP');
    }
  }

  // Check for Vary header
  if (!('vary' in headers)) {
    issues.push('No Vary header found');
    recommendations.push('Add Vary: Accept-Encoding header when using compression');
  } else {
    const varyHeader = headers['vary'];
    if (!varyHeader.includes('Accept-Encoding')) {
      issues.push('Vary header does not include Accept-Encoding');
      recommendations.push('Update Vary header to include Accept-Encoding when using compression');
    } else {
      score += 20;
    }
  }

  // Ensure score is capped at 100
  score = Math.min(100, score);

  return {
    issues,
    recommendations,
    score,
    contentEncoding: encodingHeader || null,
    vary: headers['vary'] || null
  };
} 