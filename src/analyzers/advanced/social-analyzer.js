/**
 * This is the Social Media Analyzer
 * It Analyzes social media meta tags and presence for better shareability
 */

/**
 * Analyzes social media meta tags and presence
 * @param {Document} document - DOM document to analyze
 * @param {string} url - URL of the page being analyzed
 * @returns {Object} Analysis of social media tags and presence
 */
export function analyzeSocialMedia(document, url) {
  if (!document) {
    return {
      issues: ['No document provided for analysis'],
      recommendations: ['Provide a document for analysis'],
      score: 0
    };
  }

  // Analyze different aspects of social media
  const openGraphAnalysis = analyzeOpenGraph(document);
  const twitterCardAnalysis = analyzeTwitterCard(document);
  const socialLinksAnalysis = analyzeSocialLinks(document, url);
  const socialSharingAnalysis = analyzeSocialSharing(document);

  // Combine all issues and recommendations
  const issues = [
    ...openGraphAnalysis.issues,
    ...twitterCardAnalysis.issues,
    ...socialLinksAnalysis.issues,
    ...socialSharingAnalysis.issues
  ];

  const recommendations = [
    ...openGraphAnalysis.recommendations,
    ...twitterCardAnalysis.recommendations,
    ...socialLinksAnalysis.recommendations,
    ...socialSharingAnalysis.recommendations
  ];

  // Calculate overall score
  const score = Math.round(
    (openGraphAnalysis.score + twitterCardAnalysis.score +
      socialLinksAnalysis.score + socialSharingAnalysis.score) / 4
  );

  return {
    openGraphAnalysis,
    twitterCardAnalysis,
    socialLinksAnalysis,
    socialSharingAnalysis,
    issues,
    recommendations,
    score
  };
}

/**
 * Analyzes Open Graph meta tags
 * @param {Document} document - DOM document to analyze
 * @returns {Object} Analysis of Open Graph tags
 */
function analyzeOpenGraph(document) {
  const issues = [];
  const recommendations = [];
  let score = 0;

  // Get all Open Graph meta tags
  const ogTags = Array.from(document.querySelectorAll('meta[property^="og:"]'));

  // Initialize results object
  const ogData = {
    title: getMetaContent(document, 'meta[property="og:title"]'),
    description: getMetaContent(document, 'meta[property="og:description"]'),
    image: getMetaContent(document, 'meta[property="og:image"]'),
    url: getMetaContent(document, 'meta[property="og:url"]'),
    type: getMetaContent(document, 'meta[property="og:type"]'),
    siteName: getMetaContent(document, 'meta[property="og:site_name"]'),
    locale: getMetaContent(document, 'meta[property="og:locale"]'),
    allTags: ogTags.map(tag => ({
      property: tag.getAttribute('property'),
      content: tag.getAttribute('content')
    }))
  };

  // Check if Open Graph tags exist
  if (ogTags.length === 0) {
    issues.push('No Open Graph meta tags found');
    recommendations.push('Add Open Graph meta tags for better social media sharing');
  } else {
    score += 20; // Base score for having some OG tags

    // Check for essential OG tags
    const essentialTags = [
      {
        name: 'og:title', value: ogData.title, score: 20,
        recommendation: 'Add og:title meta tag for better social sharing'
      },
      {
        name: 'og:description', value: ogData.description, score: 15,
        recommendation: 'Add og:description meta tag for better social sharing'
      },
      {
        name: 'og:image', value: ogData.image, score: 20,
        recommendation: 'Add og:image meta tag for better social sharing'
      },
      {
        name: 'og:url', value: ogData.url, score: 10,
        recommendation: 'Add og:url meta tag to specify the canonical URL for the page'
      },
      {
        name: 'og:type', value: ogData.type, score: 10,
        recommendation: 'Add og:type meta tag to specify the type of content (e.g., website, article)'
      }
    ];

    // Check each essential tag
    essentialTags.forEach(tag => {
      if (!tag.value) {
        issues.push(`Missing ${tag.name} meta tag`);
        recommendations.push(tag.recommendation);
      } else {
        score += tag.score;
      }
    });

    // Check for additional tags
    if (!ogData.siteName) {
      recommendations.push('Add og:site_name meta tag for better brand recognition');
    } else {
      score += 5;
    }

    // Check image validity if present
    if (ogData.image) {
      if (!isValidUrl(ogData.image)) {
        issues.push('og:image URL may not be valid or is relative');
        recommendations.push('Use absolute URLs for og:image meta tags');
        score -= 10;
      }

      // Check for additional image tags
      const hasImageWidth = getMetaContent(document, 'meta[property="og:image:width"]');
      const hasImageHeight = getMetaContent(document, 'meta[property="og:image:height"]');

      if (!hasImageWidth || !hasImageHeight) {
        recommendations.push('Add og:image:width and og:image:height for better image rendering on social platforms');
      } else {
        score += 5;
      }
    }
  }

  // Ensure score doesn't exceed 100 or go below 0
  score = Math.min(100, Math.max(0, score));

  return {
    issues,
    recommendations,
    score,
    data: ogData
  };
}

/**
 * Analyzes Twitter Card meta tags
 * @param {Document} document - DOM document to analyze
 * @returns {Object} Analysis of Twitter Card tags
 */
function analyzeTwitterCard(document) {
  const issues = [];
  const recommendations = [];
  let score = 0;

  // Get Twitter Card meta tags
  const twitterTags = Array.from(document.querySelectorAll('meta[name^="twitter:"]'));

  // Initialize results object
  const twitterData = {
    card: getMetaContent(document, 'meta[name="twitter:card"]'),
    title: getMetaContent(document, 'meta[name="twitter:title"]'),
    description: getMetaContent(document, 'meta[name="twitter:description"]'),
    image: getMetaContent(document, 'meta[name="twitter:image"]'),
    site: getMetaContent(document, 'meta[name="twitter:site"]'),
    creator: getMetaContent(document, 'meta[name="twitter:creator"]'),
    allTags: twitterTags.map(tag => ({
      name: tag.getAttribute('name'),
      content: tag.getAttribute('content')
    }))
  };

  // Check if Twitter Card tags exist
  if (twitterTags.length === 0) {
    issues.push('No Twitter Card meta tags found');
    recommendations.push('Add Twitter Card meta tags for better Twitter sharing');
  } else {
    score += 20; // Base score for having some Twitter tags

    // Check for essential Twitter Card tags
    const essentialTags = [
      {
        name: 'twitter:card', value: twitterData.card, score: 20,
        recommendation: 'Add twitter:card meta tag to specify the card type'
      },
      {
        name: 'twitter:title', value: twitterData.title, score: 15,
        recommendation: 'Add twitter:title meta tag for better Twitter sharing'
      },
      {
        name: 'twitter:description', value: twitterData.description, score: 15,
        recommendation: 'Add twitter:description meta tag for better Twitter sharing'
      },
      {
        name: 'twitter:image', value: twitterData.image, score: 15,
        recommendation: 'Add twitter:image meta tag for better Twitter sharing'
      }
    ];

    // Check each essential tag
    essentialTags.forEach(tag => {
      if (!tag.value) {
        issues.push(`Missing ${tag.name} meta tag`);
        recommendations.push(tag.recommendation);
      } else {
        score += tag.score;
      }
    });

    // Check for additional tags
    if (!twitterData.site) {
      recommendations.push('Add twitter:site meta tag with your Twitter username');
    } else {
      score += 5;
    }

    // Check card type
    if (twitterData.card) {
      const validCardTypes = ['summary', 'summary_large_image', 'app', 'player'];
      if (!validCardTypes.includes(twitterData.card)) {
        issues.push(`Unknown twitter:card value: ${twitterData.card}`);
        recommendations.push('Use a valid Twitter card type: summary, summary_large_image, app, or player');
        score -= 10;
      }
    }

    // Check image validity if present
    if (twitterData.image && !isValidUrl(twitterData.image)) {
      issues.push('twitter:image URL may not be valid or is relative');
      recommendations.push('Use absolute URLs for twitter:image meta tags');
      score -= 10;
    }
  }

  // Check for fallback to Open Graph
  const hasOpenGraph = document.querySelector('meta[property^="og:"]');
  if (twitterTags.length === 0 && hasOpenGraph) {
    recommendations.push('Twitter Cards can fall back to Open Graph tags, but explicit Twitter Card tags are recommended');
    score += 10;
  }

  // Ensure score doesn't exceed 100 or go below 0
  score = Math.min(100, Math.max(0, score));

  return {
    issues,
    recommendations,
    score,
    data: twitterData
  };
}

/**
 * Analyzes social media links on the page
 * @param {Document} document - DOM document to analyze
 * @param {string} url - URL of the page being analyzed
 * @returns {Object} Analysis of social media links
 */
function analyzeSocialLinks(document, url) {
  const issues = [];
  const recommendations = [];
  let score = 0;

  // Define common social media platforms and their patterns
  const socialPlatforms = [
    { name: 'Facebook', patterns: ['facebook.com', 'fb.com'], icon: 'facebook' },
    { name: 'Twitter', patterns: ['twitter.com', 'x.com'], icon: 'twitter' },
    { name: 'LinkedIn', patterns: ['linkedin.com'], icon: 'linkedin' },
    { name: 'Instagram', patterns: ['instagram.com'], icon: 'instagram' },
    { name: 'YouTube', patterns: ['youtube.com', 'youtu.be'], icon: 'youtube' },
    { name: 'Pinterest', patterns: ['pinterest.com'], icon: 'pinterest' },
    { name: 'TikTok', patterns: ['tiktok.com'], icon: 'tiktok' },
    { name: 'Reddit', patterns: ['reddit.com'], icon: 'reddit' },
    { name: 'Discord', patterns: ['discord.com', 'discord.gg'], icon: 'discord' },
    { name: 'Snapchat', patterns: ['snapchat.com'], icon: 'snapchat' }
  ];

  // Find all links
  const links = Array.from(document.querySelectorAll('a[href]'));

  // Filter social media links
  const socialLinks = links.filter(link => {
    const href = link.getAttribute('href');
    return socialPlatforms.some(platform =>
      platform.patterns.some(pattern => href && href.includes(pattern))
    );
  });

  // Group links by social media platform
  const platformLinks = {};
  socialPlatforms.forEach(platform => {
    platformLinks[platform.name] = socialLinks.filter(link => {
      const href = link.getAttribute('href');
      return platform.patterns.some(pattern => href && href.includes(pattern));
    });
  });

  // Count total social platforms linked
  const linkedPlatforms = Object.entries(platformLinks)
    .filter(([_, links]) => links.length > 0)
    .map(([name, _]) => name);

  // Analyze social links
  if (socialLinks.length === 0) {
    issues.push('No social media links found on the page');
    recommendations.push('Add links to your social media profiles for better connectivity');
  } else {
    // Award points based on number of social platforms linked
    score += Math.min(60, linkedPlatforms.length * 15);

    // Check for common platforms that might be missing
    const commonPlatforms = ['Facebook', 'Twitter', 'LinkedIn', 'Instagram'];
    const missingCommonPlatforms = commonPlatforms.filter(platform =>
      !linkedPlatforms.includes(platform)
    );

    if (missingCommonPlatforms.length > 0) {
      recommendations.push(`Consider adding links to these popular platforms: ${missingCommonPlatforms.join(', ')}`);
    }

    // Check link placement and visibility
    const headerLinks = socialLinks.filter(link =>
      isElementInHeader(link, document)
    );

    const footerLinks = socialLinks.filter(link =>
      isElementInFooter(link, document)
    );

    const visibleLinks = socialLinks.filter(link =>
      !isElementHidden(link)
    );

    if (headerLinks.length > 0 || footerLinks.length > 0) {
      score += 20;
    } else {
      recommendations.push('Place social media links in header or footer for better visibility');
    }

    if (visibleLinks.length < socialLinks.length) {
      issues.push('Some social media links may be hidden');
      recommendations.push('Ensure social media links are visible to users');
      score -= 10;
    }

    // Check if links open in new tab
    const newTabLinks = socialLinks.filter(link =>
      link.getAttribute('target') === '_blank'
    );

    if (newTabLinks.length < socialLinks.length) {
      recommendations.push('Make social media links open in new tabs to prevent users from leaving your site');
    } else {
      score += 10;
    }

    // Check for link text or icons
    const namedLinks = socialLinks.filter(link =>
      link.textContent.trim() !== '' || link.querySelector('img, svg, [class*="icon"], [class*="social"]')
    );

    if (namedLinks.length < socialLinks.length) {
      issues.push('Some social media links may not have visible text or icons');
      recommendations.push('Add descriptive text or icons to social media links');
      score -= 10;
    }
  }

  // Check for social sharing buttons
  const sharingButtons = links.filter(link => {
    const href = link.getAttribute('href');
    return href && (
      href.includes('facebook.com/sharer') ||
      href.includes('twitter.com/intent/tweet') ||
      href.includes('linkedin.com/shareArticle') ||
      href.includes('pinterest.com/pin/create/button') ||
      href.includes('mailto:') ||
      href.includes('share') || href.includes('tweet')
    );
  });

  if (sharingButtons.length === 0) {
    recommendations.push('Consider adding social sharing buttons to make it easy for visitors to share your content');
  } else {
    score += 10;
  }

  // Ensure score doesn't exceed 100 or go below 0
  score = Math.min(100, Math.max(0, score));

  return {
    issues,
    recommendations,
    score,
    linkedPlatforms,
    socialLinks: Object.fromEntries(
      Object.entries(platformLinks)
        .map(([name, links]) => [name, links.map(link => link.getAttribute('href'))])
    )
  };
}

/**
 * Analyzes social media sharing options
 * @param {Document} document - DOM document to analyze
 * @returns {Object} Analysis of social sharing options
 */
function analyzeSocialSharing(document) {
  const issues = [];
  const recommendations = [];
  let score = 0;

  // Find all links
  const links = Array.from(document.querySelectorAll('a[href]'));

  // Find sharing links or buttons
  const sharingPatterns = [
    { name: 'Facebook', patterns: ['facebook.com/sharer', 'facebook.com/share'] },
    { name: 'Twitter', patterns: ['twitter.com/intent/tweet', 'twitter.com/share'] },
    { name: 'LinkedIn', patterns: ['linkedin.com/shareArticle'] },
    { name: 'Pinterest', patterns: ['pinterest.com/pin/create'] },
    { name: 'Email', patterns: ['mailto:'] },
    { name: 'WhatsApp', patterns: ['api.whatsapp.com/send', 'web.whatsapp.com/send'] },
    { name: 'Telegram', patterns: ['t.me/share'] }
  ];

  // Find sharing buttons
  const sharingButtons = {};
  sharingPatterns.forEach(platform => {
    sharingButtons[platform.name] = links.filter(link => {
      const href = link.getAttribute('href');
      return href && platform.patterns.some(pattern => href.includes(pattern));
    });
  });

  // Count sharing options
  const sharingOptions = Object.entries(sharingButtons)
    .filter(([_, links]) => links.length > 0)
    .map(([name, _]) => name);

  // Check for sharing buttons/links
  if (sharingOptions.length === 0) {
    // Look for share buttons by class/ID naming
    const potentialShareElements = Array.from(document.querySelectorAll(
      '[class*="share"], [id*="share"], [class*="social"], [id*="social"], ' +
      '[class*="facebook"], [class*="twitter"], [class*="linkedin"], ' +
      '[aria-label*="share"], [title*="share"]'
    ));

    if (potentialShareElements.length === 0) {
      issues.push('No social sharing buttons/links found');
      recommendations.push('Add social sharing buttons to make content easily shareable');
    } else {
      // Potential share buttons found, but not as standard links
      recommendations.push('Consider using standard social sharing links with proper URLs');
      score += 30;
    }
  } else {
    // Score based on number of sharing options
    score += Math.min(60, sharingOptions.length * 15);

    // Check for common sharing options that might be missing
    const commonPlatforms = ['Facebook', 'Twitter', 'LinkedIn', 'Email'];
    const missingCommonPlatforms = commonPlatforms.filter(platform =>
      !sharingOptions.includes(platform)
    );

    if (missingCommonPlatforms.length > 0) {
      recommendations.push(`Consider adding sharing options for: ${missingCommonPlatforms.join(', ')}`);
    }

    // Verify if sharing buttons include correct URL and content
    const pageUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content') ||
      document.querySelector('link[rel="canonical"]')?.getAttribute('href');

    const pageTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      document.querySelector('title')?.textContent;

    if (pageUrl) {
      const facebookShares = sharingButtons['Facebook'] || [];
      const twitterShares = sharingButtons['Twitter'] || [];
      const linkedinShares = sharingButtons['LinkedIn'] || [];

      // Check Facebook sharing links
      const validFacebookShares = facebookShares.filter(link => {
        const href = link.getAttribute('href');
        return href && (
          href.includes('u=') && (
            href.includes(encodeURIComponent(pageUrl)) ||
            href.includes('${url}') ||
            href.includes('{url}')
          )
        );
      });

      if (facebookShares.length > 0 && validFacebookShares.length === 0) {
        issues.push('Facebook sharing links may not properly include the page URL');
        recommendations.push('Ensure Facebook sharing links include the proper page URL');
        score -= 10;
      }

      // Check Twitter sharing links
      const validTwitterShares = twitterShares.filter(link => {
        const href = link.getAttribute('href');
        return href && (
          href.includes('url=') && (
            href.includes(encodeURIComponent(pageUrl)) ||
            href.includes('${url}') ||
            href.includes('{url}')
          )
        );
      });

      if (twitterShares.length > 0 && validTwitterShares.length === 0) {
        issues.push('Twitter sharing links may not properly include the page URL');
        recommendations.push('Ensure Twitter sharing links include the proper page URL');
        score -= 10;
      }
    }

    // Check for share counts/social proof
    const potentialShareCounts = Array.from(document.querySelectorAll(
      '[class*="count"], [class*="shares"], [class*="reactions"], [class*="comments"]'
    ));

    if (potentialShareCounts.length === 0) {
      recommendations.push('Consider displaying share counts for social proof');
    } else {
      score += 10;
    }
  }

  // Check position of sharing buttons
  const contentElement = findMainContentElement(document);
  let shareButtonsInContent = false;

  if (contentElement) {
    shareButtonsInContent = Object.values(sharingButtons)
      .flat()
      .some(button => contentElement.contains(button));

    if (!shareButtonsInContent) {
      recommendations.push('Place sharing buttons near your main content for better visibility');
    } else {
      score += 20;
    }
  }

  // Ensure score doesn't exceed 100 or go below 0
  score = Math.min(100, Math.max(0, score));

  return {
    issues,
    recommendations,
    score,
    sharingOptions,
    shareButtons: Object.fromEntries(
      Object.entries(sharingButtons)
        .map(([name, links]) => [name, links.map(link => link.getAttribute('href'))])
    )
  };
}

// Helper functions

/**
 * Gets content from a meta tag
 * @param {Document} document - DOM document
 * @param {string} selector - CSS selector for the meta tag
 * @returns {string|null} Meta tag content or null if not found
 */
function getMetaContent(document, selector) {
  const meta = document.querySelector(selector);
  return meta ? meta.getAttribute('content') : null;
}

/**
 * Checks if a URL is valid
 * @param {string} url - URL to check
 * @returns {boolean} True if URL is valid
 */
function isValidUrl(url) {
  if (!url) return false;

  // Check for absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  return false;
}

/**
 * Checks if an element is in the page header
 * @param {Element} element - Element to check
 * @param {Document} document - DOM document
 * @returns {boolean} True if element is in header
 */
function isElementInHeader(element, document) {
  try {
    const headerSelectors = ['header', '[role="banner"]', '#header', '.header', '.site-header'];
    // Get all valid header elements
    const headers = [];

    for (const selector of headerSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements && elements.length) {
        for (let i = 0; i < elements.length; i++) {
          if (elements[i] && typeof elements[i].contains === 'function') {
            headers.push(elements[i]);
          }
        }
      }
    }

    // Check if the element is contained in any header
    return headers.some(header => {
      try {
        return header.contains(element);
      } catch (e) {
        return false;
      }
    });
  } catch (e) {
    console.error('Error in isElementInHeader:', e.message);
    return false;
  }
}

/**
 * Checks if an element is in the page footer
 * @param {Element} element - Element to check
 * @param {Document} document - DOM document
 * @returns {boolean} True if element is in footer
 */
function isElementInFooter(element, document) {
  try {
    const footerSelectors = ['footer', '[role="contentinfo"]', '#footer', '.footer', '.site-footer'];
    // Get all valid footer elements
    const footers = [];

    for (const selector of footerSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements && elements.length) {
        for (let i = 0; i < elements.length; i++) {
          if (elements[i] && typeof elements[i].contains === 'function') {
            footers.push(elements[i]);
          }
        }
      }
    }

    // Check if the element is contained in any footer
    return footers.some(footer => {
      try {
        return footer.contains(element);
      } catch (e) {
        return false;
      }
    });
  } catch (e) {
    console.error('Error in isElementInFooter:', e.message);
    return false;
  }
}

/**
 * Checks if an element is hidden
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is hidden
 */
function isElementHidden(element) {
  try {
    // Check if element exists
    if (!element) return true;

    // Check for hidden attribute
    if (element.hasAttribute && element.hasAttribute('hidden')) {
      return true;
    }

    // Check for display:none or visibility:hidden in inline style
    if (element.style) {
      if (element.style.display === 'none' || element.style.visibility === 'hidden') {
        return true;
      }
    }

    // Try to use getComputedStyle if available
    if (typeof getComputedStyle === 'function') {
      const style = getComputedStyle(element);
      return style.display === 'none' || style.visibility === 'hidden';
    }

    // If getComputedStyle is not available, check for some common class names
    if (element.classList) {
      return ['hidden', 'hide', 'invisible', 'd-none', 'display-none'].some(cls =>
        element.classList.contains(cls)
      );
    }

    // If we can't determine, assume it's visible
    return false;
  } catch (e) {
    console.error('Error in isElementHidden:', e.message);
    return false;
  }
}

/**
 * Attempts to find the main content element
 * @param {Document} document - DOM document
 * @returns {Element|null} Main content element or null if not found
 */
function findMainContentElement(document) {
  const contentSelectors = [
    'main',
    '[role="main"]',
    'article',
    '.content',
    '.main-content',
    '#content',
    '.post',
    '.article',
    '.page-content'
  ];

  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }

  return null;
} 