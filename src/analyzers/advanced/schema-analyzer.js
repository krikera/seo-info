/**
 * This is the Schema.org structured data analyzer
 * It Analyzes JSON-LD and microdata implementations
 */

/**
 * Extracts and analyzes JSON-LD structured data
 * @param {Document} document - DOM document
 * @returns {Object} JSON-LD analysis results
 */
export function analyzeJSONLD(document) {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const jsonldData = [];
  const errors = [];

  // Extract JSON-LD data
  Array.from(scripts).forEach((script, index) => {
    try {
      const content = script.textContent.trim();
      const data = JSON.parse(content);
      jsonldData.push(data);
    } catch (error) {
      errors.push({
        index,
        error: `Invalid JSON-LD: ${error.message}`
      });
    }
  });

  // Analyze each JSON-LD block
  const analysis = jsonldData.map((data, index) => {
    const type = getJsonLdType(data);
    const isValid = validateJsonLd(data);
    const coverage = assessJsonLdCoverage(data);

    return {
      index,
      type,
      valid: isValid.valid,
      validationIssues: isValid.issues,
      coverage: coverage.score,
      coverageAssessment: coverage.assessment,
      recommendations: generateJsonLdRecommendations(data, type, isValid, coverage)
    };
  });

  return {
    count: scripts.length,
    data: jsonldData,
    analysis,
    errors,
    recommendations: getOverallJsonLdRecommendations(jsonldData, errors)
  };
}

/**
 * Extracts and analyzes microdata structured data
 * @param {Document} document - DOM document
 * @returns {Object} Microdata analysis results
 */
export function analyzeMicrodata(document) {
  const elements = document.querySelectorAll('[itemscope]');
  const microdataItems = [];

  // Extract microdata
  Array.from(elements).forEach(element => {
    const item = {
      type: element.getAttribute('itemtype') || 'No type specified',
      properties: {}
    };

    // Get all itemprop elements
    const itemProps = element.querySelectorAll('[itemprop]');
    Array.from(itemProps).forEach(prop => {
      const name = prop.getAttribute('itemprop');
      let value;

      // Extract value based on element type
      if (prop.tagName === 'META') {
        value = prop.getAttribute('content');
      } else if (prop.tagName === 'IMG') {
        value = prop.getAttribute('src');
      } else if (prop.tagName === 'A') {
        value = prop.getAttribute('href');
      } else if (prop.tagName === 'TIME') {
        value = prop.getAttribute('datetime') || prop.textContent;
      } else {
        value = prop.textContent;
      }

      item.properties[name] = value;
    });

    microdataItems.push(item);
  });

  // Analyze microdata
  const analysis = microdataItems.map((item, index) => {
    const coverage = assessMicrodataCoverage(item);
    const issues = validateMicrodata(item);

    return {
      index,
      type: item.type,
      propertyCount: Object.keys(item.properties).length,
      coverage: coverage.score,
      coverageAssessment: coverage.assessment,
      valid: issues.valid,
      validationIssues: issues.issues,
      recommendations: generateMicrodataRecommendations(item, coverage, issues)
    };
  });

  return {
    count: elements.length,
    data: microdataItems,
    analysis,
    recommendations: getOverallMicrodataRecommendations(microdataItems)
  };
}

/**
 * Analyzes overall structured data implementation
 * @param {Document} document - DOM document
 * @returns {Object} Structured data analysis results
 */
export function analyzeStructuredData(document) {
  const jsonldAnalysis = analyzeJSONLD(document);
  const microdataAnalysis = analyzeMicrodata(document);

  const hasAnyStructuredData = jsonldAnalysis.count > 0 || microdataAnalysis.count > 0;

  // Determine which important types are implemented
  const implementedTypes = getImplementedSchemaTypes(jsonldAnalysis, microdataAnalysis);

  // Check for critical schema types for SEO
  const hasOrganization = implementedTypes.includes('Organization') || implementedTypes.includes('LocalBusiness');
  const hasBreadcrumbs = implementedTypes.includes('BreadcrumbList');
  const hasArticle = implementedTypes.includes('Article') || implementedTypes.includes('NewsArticle') || implementedTypes.includes('BlogPosting');
  const hasProduct = implementedTypes.includes('Product');
  const hasFAQ = implementedTypes.includes('FAQPage');

  // Generate recommendations
  const recommendations = [];

  if (!hasAnyStructuredData) {
    recommendations.push('No structured data found. Consider implementing JSON-LD for better search engine visibility.');
  }

  if (!hasOrganization) {
    recommendations.push('No Organization schema found. Add this to improve your brand presence in search results.');
  }

  if (!hasBreadcrumbs && document.querySelectorAll('nav, ol, ul').length > 0) {
    recommendations.push('Consider adding BreadcrumbList schema to enhance navigation display in search results.');
  }

  if (document.querySelectorAll('article, .article, .post').length > 0 && !hasArticle) {
    recommendations.push('Content appears to be an article. Add Article schema type to improve visibility in search.');
  }

  if (document.querySelectorAll('.product, [id*="product"]').length > 0 && !hasProduct) {
    recommendations.push('Page may contain product information. Consider adding Product schema.');
  }

  if (document.querySelectorAll('q, blockquote, .faq, .question').length > 0 && !hasFAQ) {
    recommendations.push('Page may contain FAQ content. Consider adding FAQPage schema to be eligible for rich results.');
  }

  return {
    hasStructuredData: hasAnyStructuredData,
    jsonld: jsonldAnalysis,
    microdata: microdataAnalysis,
    implementedTypes,
    recommendations
  };
}

// Helper functions

function getJsonLdType(data) {
  if (!data) return 'Unknown';

  if (Array.isArray(data)) {
    return data.map(item => item['@type'] || 'Unspecified').join(', ');
  }

  return data['@type'] || 'Unspecified';
}

function validateJsonLd(data) {
  const issues = [];

  if (!data) {
    issues.push('Empty JSON-LD data');
    return { valid: false, issues };
  }

  if (!data['@context'] || !data['@context'].includes('schema.org')) {
    issues.push('Missing or invalid @context (should be schema.org)');
  }

  if (!data['@type']) {
    issues.push('Missing @type property');
  }

  // For specific schema types, check required properties
  if (data['@type'] === 'Product') {
    if (!data.name) issues.push('Product schema missing required property: name');
    if (!data.description) issues.push('Product schema missing recommended property: description');
    if (!data.image) issues.push('Product schema missing recommended property: image');
    if (!data.offers) issues.push('Product schema missing recommended property: offers');
  } else if (data['@type'] === 'Article' || data['@type'] === 'BlogPosting') {
    if (!data.headline) issues.push('Article schema missing required property: headline');
    if (!data.author) issues.push('Article schema missing recommended property: author');
    if (!data.datePublished) issues.push('Article schema missing recommended property: datePublished');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

function assessJsonLdCoverage(data) {
  if (!data || !data['@type']) {
    return { score: 0, assessment: 'Missing or invalid schema' };
  }

  // Calculate property coverage based on schema type
  const type = data['@type'];
  const properties = Object.keys(data).filter(key => key !== '@context' && key !== '@type');

  let score = 0;
  let assessment = '';

  // Simplified coverage calculation
  if (properties.length === 0) {
    score = 0;
    assessment = 'No properties defined';
  } else if (properties.length < 3) {
    score = 20;
    assessment = 'Minimal properties defined';
  } else if (properties.length < 5) {
    score = 40;
    assessment = 'Basic properties defined';
  } else if (properties.length < 8) {
    score = 60;
    assessment = 'Good property coverage';
  } else if (properties.length < 12) {
    score = 80;
    assessment = 'Very good property coverage';
  } else {
    score = 100;
    assessment = 'Excellent property coverage';
  }

  return { score, assessment };
}

function generateJsonLdRecommendations(data, type, validation, coverage) {
  const recommendations = [];

  // Add recommendations based on validation issues
  validation.issues.forEach(issue => {
    recommendations.push(`Fix: ${issue}`);
  });

  // Add recommendations based on coverage
  if (coverage.score < 60) {
    recommendations.push(`Improve your ${type} schema by adding more properties.`);
  }

  return recommendations;
}

function getOverallJsonLdRecommendations(jsonldData, errors) {
  const recommendations = [];

  if (errors.length > 0) {
    recommendations.push('Fix JSON-LD syntax errors to ensure proper interpretation by search engines.');
  }

  if (jsonldData.length === 0) {
    recommendations.push('Implement JSON-LD structured data to improve search engine understanding of your content.');
  } else if (jsonldData.length > 5) {
    recommendations.push('You have many JSON-LD blocks. Consider consolidating them if possible.');
  }

  return recommendations;
}

function validateMicrodata(item) {
  const issues = [];

  if (!item.type || item.type === 'No type specified') {
    issues.push('Missing itemtype attribute');
  } else if (!item.type.includes('schema.org')) {
    issues.push('itemtype should reference schema.org');
  }

  if (Object.keys(item.properties).length === 0) {
    issues.push('No itemprop attributes found');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

function assessMicrodataCoverage(item) {
  const propertyCount = Object.keys(item.properties).length;

  let score = 0;
  let assessment = '';

  if (propertyCount === 0) {
    score = 0;
    assessment = 'No properties defined';
  } else if (propertyCount < 3) {
    score = 20;
    assessment = 'Minimal properties defined';
  } else if (propertyCount < 5) {
    score = 40;
    assessment = 'Basic properties defined';
  } else if (propertyCount < 8) {
    score = 60;
    assessment = 'Good property coverage';
  } else if (propertyCount < 12) {
    score = 80;
    assessment = 'Very good property coverage';
  } else {
    score = 100;
    assessment = 'Excellent property coverage';
  }

  return { score, assessment };
}

function generateMicrodataRecommendations(item, coverage, validation) {
  const recommendations = [];

  validation.issues.forEach(issue => {
    recommendations.push(`Fix: ${issue}`);
  });

  if (coverage.score < 60) {
    const type = item.type.split('/').pop(); // Extract type name from URI
    recommendations.push(`Add more properties to your ${type} microdata to improve coverage.`);
  }

  return recommendations;
}

function getOverallMicrodataRecommendations(microdataItems) {
  const recommendations = [];

  if (microdataItems.length === 0) {
    recommendations.push('No microdata found. Consider implementing structured data (preferably JSON-LD).');
  } else {
    recommendations.push('Consider converting microdata to JSON-LD format, which is preferred by Google.');
  }

  return recommendations;
}

function getImplementedSchemaTypes(jsonldAnalysis, microdataAnalysis) {
  const types = new Set();

  // Extract types from JSON-LD
  if (jsonldAnalysis.data) {
    jsonldAnalysis.data.forEach(data => {
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item['@type']) types.add(item['@type']);
        });
      } else if (data['@type']) {
        types.add(data['@type']);
      }
    });
  }

  // Extract types from microdata
  if (microdataAnalysis.data) {
    microdataAnalysis.data.forEach(item => {
      if (item.type && item.type !== 'No type specified') {
        // Extract the type name from the URL
        const typeName = item.type.split('/').pop();
        if (typeName) types.add(typeName);
      }
    });
  }

  return Array.from(types);
} 