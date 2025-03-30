/**
 * This is the URL Analyzer
 * It Analyzes URL structures for SEO best practices
 */

/**
 * Analyzes URL structure for SEO best practices
 * @param {string} url - URL to analyze
 * @param {Array} pageUrls - Optional array of other URLs from the site for crawl path analysis
 * @returns {Object} Analysis of URL structure
 */
export function analyzeUrl(url, pageUrls = []) {
  if (!url) {
    return {
      issues: ['No URL provided for analysis'],
      recommendations: ['Provide a URL for analysis'],
      score: 0
    };
  }

  try {
    const parsedUrl = new URL(url);

    // Analyze different aspects of URL
    const protocolAnalysis = analyzeProtocol(parsedUrl);
    const domainAnalysis = analyzeDomain(parsedUrl);
    const pathAnalysis = analyzePath(parsedUrl);
    const queryAnalysis = analyzeQueryParameters(parsedUrl);
    const crawlPathAnalysis = analyzeCrawlPath(parsedUrl, pageUrls);

    // Combine all issues and recommendations
    const issues = [
      ...protocolAnalysis.issues,
      ...domainAnalysis.issues,
      ...pathAnalysis.issues,
      ...queryAnalysis.issues,
      ...crawlPathAnalysis.issues
    ];

    const recommendations = [
      ...protocolAnalysis.recommendations,
      ...domainAnalysis.recommendations,
      ...pathAnalysis.recommendations,
      ...queryAnalysis.recommendations,
      ...crawlPathAnalysis.recommendations
    ];

    // Calculate overall score
    const score = Math.round(
      (protocolAnalysis.score + domainAnalysis.score +
        pathAnalysis.score + queryAnalysis.score + crawlPathAnalysis.score) / 5
    );

    return {
      url,
      parsedUrl: {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search
      },
      protocolAnalysis,
      domainAnalysis,
      pathAnalysis,
      queryAnalysis,
      crawlPathAnalysis,
      issues,
      recommendations,
      score
    };
  } catch (error) {
    return {
      url,
      issues: [`Invalid URL: ${error.message}`],
      recommendations: ['Provide a valid URL for analysis'],
      score: 0
    };
  }
}

/**
 * Analyzes URL protocol for SEO best practices
 * @param {URL} parsedUrl - Parsed URL object
 * @returns {Object} Analysis of URL protocol
 */
function analyzeProtocol(parsedUrl) {
  const issues = [];
  const recommendations = [];
  let score = 0;

  // Check protocol (HTTPS is preferred)
  if (parsedUrl.protocol === 'https:') {
    score = 100;
  } else if (parsedUrl.protocol === 'http:') {
    issues.push('Site uses HTTP instead of HTTPS');
    recommendations.push('Migrate to HTTPS for better security and SEO performance');
    score = 40;
  } else {
    issues.push(`Unusual protocol: ${parsedUrl.protocol}`);
    recommendations.push('Use HTTPS protocol for website URLs');
    score = 20;
  }

  return {
    issues,
    recommendations,
    score,
    protocol: parsedUrl.protocol
  };
}

/**
 * Analyzes domain structure for SEO best practices
 * @param {URL} parsedUrl - Parsed URL object
 * @returns {Object} Analysis of domain structure
 */
function analyzeDomain(parsedUrl) {
  const issues = [];
  const recommendations = [];
  let score = 100; // Start with perfect score and deduct

  const hostname = parsedUrl.hostname;

  // Check domain length (shorter is generally better)
  if (hostname.length > 50) {
    issues.push('Domain name is excessively long');
    recommendations.push('Consider using a shorter domain name for better memorability');
    score -= 20;
  }

  // Check for www prefix (either with or without is fine, consistency is key)
  const hasWww = hostname.startsWith('www.');
  // This is not necessarily an issue, just something to note

  // Check for subdomains (excluding www)
  const subdomainCount = hostname.split('.').length - (hasWww ? 2 : 1);
  if (subdomainCount > 1) {
    issues.push('Multiple subdomains may dilute SEO value');
    recommendations.push('Consider consolidating content under fewer subdomains');
    score -= 10;
  }

  // Check for unusual TLDs
  const tld = hostname.split('.').pop();
  const commonTlds = ['com', 'org', 'net', 'edu', 'gov', 'co', 'io', 'app'];
  if (!commonTlds.includes(tld)) {
    // Not necessarily an issue, but worth noting
    recommendations.push('Consider using a common TLD like .com for better recognition');
  }

  // Check for hyphens in domain
  const domainPart = hostname.split('.').slice(hasWww ? 1 : 0, -1).join('.');
  if ((domainPart.match(/-/g) || []).length > 1) {
    issues.push('Multiple hyphens in domain name may look spammy');
    recommendations.push('Limit hyphens in domain names for better brand perception');
    score -= 15;
  }

  // Check for numbers in domain
  if (/\d/.test(domainPart)) {
    // Not necessarily an issue, but worth noting
    recommendations.push('Consider avoiding numbers in domain names for better memorability');
    score -= 5;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    issues,
    recommendations,
    score,
    hostname,
    hasWww,
    subdomainCount
  };
}

/**
 * Analyzes URL path structure for SEO best practices
 * @param {URL} parsedUrl - Parsed URL object
 * @returns {Object} Analysis of path structure
 */
function analyzePath(parsedUrl) {
  const issues = [];
  const recommendations = [];
  let score = 100; // Start with perfect score and deduct

  const pathname = parsedUrl.pathname;

  // Check if there's a trailing slash
  const hasTrailingSlash = pathname.length > 1 && pathname.endsWith('/');

  // Check path length
  if (pathname.length > 100) {
    issues.push('URL path is excessively long');
    recommendations.push('Shorten URL paths to be more user and search engine friendly');
    score -= 20;
  }

  // Check path segments
  const segments = pathname.split('/').filter(segment => segment.length > 0);

  // Check number of segments (depth)
  if (segments.length > 4) {
    issues.push('URL has deep folder structure (more than 4 levels)');
    recommendations.push('Flatten site structure to keep important content closer to the root');
    score -= 10;
  }

  // Check for uppercase letters in path
  if (/[A-Z]/.test(pathname)) {
    issues.push('URL contains uppercase letters');
    recommendations.push('Use lowercase letters in URLs for consistency and to avoid duplicate content issues');
    score -= 15;
  }

  // Check for special characters in path
  if (/[^\w\-\/]/.test(pathname)) {
    issues.push('URL contains special characters or spaces');
    recommendations.push('Use only alphanumeric characters, hyphens, and slashes in URLs');
    score -= 15;
  }

  // Check for underscores (hyphens are preferred)
  if (pathname.includes('_')) {
    issues.push('URL contains underscores');
    recommendations.push('Use hyphens instead of underscores to separate words in URLs');
    score -= 10;
  }

  // Check for file extensions
  const fileExtensionMatch = pathname.match(/\.([a-zA-Z0-9]+)$/);
  if (fileExtensionMatch && !['html', 'htm', 'php'].includes(fileExtensionMatch[1])) {
    recommendations.push('Consider using clean URLs without file extensions');
    score -= 5;
  }

  // Check for URL keyword stuffing
  const segmentText = segments.join(' ');
  const words = segmentText.split(/[-_]/g).filter(word => word.length > 0);
  const wordFrequency = {};

  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  const repeatedWords = Object.entries(wordFrequency)
    .filter(([_, count]) => count > 1)
    .map(([word, _]) => word);

  if (repeatedWords.length > 1) {
    issues.push('URL appears to contain repeated keywords');
    recommendations.push('Avoid keyword stuffing in URLs');
    score -= 15;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    issues,
    recommendations,
    score,
    pathname,
    segments,
    depth: segments.length,
    hasTrailingSlash
  };
}

/**
 * Analyzes URL query parameters for SEO best practices
 * @param {URL} parsedUrl - Parsed URL object
 * @returns {Object} Analysis of query parameters
 */
function analyzeQueryParameters(parsedUrl) {
  const issues = [];
  const recommendations = [];
  let score = 100; // Start with perfect score and deduct

  const searchParams = parsedUrl.searchParams;
  const paramCount = Array.from(searchParams.keys()).length;

  // Check if there are query parameters
  if (paramCount > 0) {
    // Having parameters isn't necessarily bad, but it's worth noting
    recommendations.push('Consider using path segments instead of query parameters for important content');
    score -= 10;

    // Check number of parameters
    if (paramCount > 3) {
      issues.push(`URL has ${paramCount} query parameters, which may be excessive`);
      recommendations.push('Limit the number of query parameters in URLs');
      score -= 10 * Math.min(5, paramCount - 3); // Deduct more for more parameters, up to a limit
    }

    // Check for tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'gclid', 'fbclid', 'ref', 'source', 'campaign'];

    const foundTrackingParams = trackingParams.filter(param => searchParams.has(param));
    if (foundTrackingParams.length > 0) {
      issues.push('URL contains tracking parameters which should be canonicalized');
      recommendations.push('Use canonical tags or parameter handling in Google Search Console for URLs with tracking parameters');
      score -= 15;
    }

    // Check for session IDs or other dynamic parameters
    const suspiciousParams = ['sid', 'session', 'sessid', 'id', 'token', 'auth'];
    const foundSuspiciousParams = suspiciousParams.filter(param =>
      Array.from(searchParams.keys()).some(key => key.toLowerCase().includes(param))
    );

    if (foundSuspiciousParams.length > 0) {
      issues.push('URL may contain session IDs or dynamic parameters');
      recommendations.push('Avoid using session IDs or user-specific parameters in URLs to prevent duplicate content');
      score -= 20;
    }
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    issues,
    recommendations,
    score,
    queryString: parsedUrl.search,
    paramCount,
    params: Object.fromEntries(searchParams.entries())
  };
}

/**
 * Analyzes crawl path and URL relationship with other pages
 * @param {URL} parsedUrl - Parsed URL object
 * @param {Array} pageUrls - Array of other URLs from the site
 * @returns {Object} Analysis of crawl path
 */
function analyzeCrawlPath(parsedUrl, pageUrls) {
  const issues = [];
  const recommendations = [];
  let score = 100; // Start with perfect score and deduct

  // If no page URLs provided, we can't do much analysis
  if (!pageUrls || pageUrls.length === 0) {
    return {
      issues: [],
      recommendations: ['Provide multiple page URLs to enable crawl path analysis'],
      score: 100,
      details: 'No additional page URLs provided for crawl path analysis'
    };
  }

  try {
    // Convert all URLs to the same format for comparison
    const currentPath = parsedUrl.pathname;
    const currentPathSegments = currentPath.split('/').filter(segment => segment);

    // Check if the URL is deeply nested compared to other pages
    const pathDepths = pageUrls.map(url => {
      try {
        const otherUrl = new URL(url);
        return otherUrl.pathname.split('/').filter(segment => segment).length;
      } catch (e) {
        return 0;
      }
    });

    const averageDepth = pathDepths.reduce((sum, depth) => sum + depth, 0) / pathDepths.length;

    if (currentPathSegments.length > averageDepth + 2) {
      issues.push('URL is significantly deeper than average site URLs');
      recommendations.push('Consider restructuring content to be closer to the root');
      score -= 15;
    }

    // Check for potential content silos
    const parentPath = currentPathSegments.length > 1
      ? `/${currentPathSegments.slice(0, -1).join('/')}/`
      : '/';

    const siblingUrls = pageUrls.filter(url => {
      try {
        const otherUrl = new URL(url);
        const otherPathSegments = otherUrl.pathname.split('/').filter(segment => segment);

        if (otherPathSegments.length === currentPathSegments.length) {
          // Same path depth, check if they share the same parent
          const otherParentPath = otherPathSegments.length > 1
            ? `/${otherPathSegments.slice(0, -1).join('/')}/`
            : '/';

          return otherParentPath === parentPath && otherUrl.pathname !== currentPath;
        }
        return false;
      } catch (e) {
        return false;
      }
    });

    // If there are very few siblings, this URL might be isolated
    if (currentPathSegments.length > 1 && siblingUrls.length < 2) {
      recommendations.push('This URL has few sibling pages. Consider building out the content section.');
      score -= 5;
    }

    // Check URL consistency
    const inconsistentUrls = pageUrls.filter(url => {
      try {
        const otherUrl = new URL(url);
        // Check trailing slash consistency
        const hasTrailingSlash = currentPath.length > 1 && currentPath.endsWith('/');
        const otherHasTrailingSlash = otherUrl.pathname.length > 1 && otherUrl.pathname.endsWith('/');

        if (hasTrailingSlash !== otherHasTrailingSlash) {
          return true;
        }

        // Check case consistency
        const hasUppercase = /[A-Z]/.test(currentPath);
        const otherHasUppercase = /[A-Z]/.test(otherUrl.pathname);

        if (hasUppercase !== otherHasUppercase) {
          return true;
        }

        return false;
      } catch (e) {
        return false;
      }
    });

    if (inconsistentUrls.length > 0) {
      issues.push('URL format inconsistency detected across site');
      recommendations.push('Maintain consistent URL patterns across the site (trailing slashes, case)');
      score -= 10;
    }

  } catch (error) {
    issues.push(`Error analyzing crawl path: ${error.message}`);
    score -= 10;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    issues,
    recommendations,
    score
  };
} 