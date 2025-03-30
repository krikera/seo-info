/**
 * This is the Advanced content analysis module
 * It Provides deeper insight into content quality, readability, and keyword usage
 */

/**
 * Calculates text readability metrics
 * @param {string} text - The text to analyze
 * @returns {Object} Readability metrics
 */
export function calculateReadability(text) {
  // Clean the text for analysis
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Split into sentences and words
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = cleanText.split(/\s+/).filter(w => w.trim().length > 0);
  const syllables = countSyllables(cleanText);

  // Calculate metrics
  const averageWordsPerSentence = words.length / Math.max(sentences.length, 1);
  const averageSyllablesPerWord = syllables / Math.max(words.length, 1);

  // Flesch Reading Ease score
  // Higher scores indicate material that is easier to read
  const fleschReadingEase = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);

  // Flesch-Kincaid Grade Level
  // Corresponds to a U.S. grade level
  const fleschKincaidGrade = (0.39 * averageWordsPerSentence) + (11.8 * averageSyllablesPerWord) - 15.59;

  // Interpret the reading ease
  let readabilityLevel;
  if (fleschReadingEase >= 90) readabilityLevel = 'Very Easy';
  else if (fleschReadingEase >= 80) readabilityLevel = 'Easy';
  else if (fleschReadingEase >= 70) readabilityLevel = 'Fairly Easy';
  else if (fleschReadingEase >= 60) readabilityLevel = 'Standard';
  else if (fleschReadingEase >= 50) readabilityLevel = 'Fairly Difficult';
  else if (fleschReadingEase >= 30) readabilityLevel = 'Difficult';
  else readabilityLevel = 'Very Difficult';

  return {
    statistics: {
      sentenceCount: sentences.length,
      wordCount: words.length,
      syllableCount: syllables,
      averageWordsPerSentence: averageWordsPerSentence.toFixed(1),
      averageSyllablesPerWord: averageSyllablesPerWord.toFixed(1)
    },
    scores: {
      fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)).toFixed(1),
      fleschKincaidGrade: Math.max(0, fleschKincaidGrade).toFixed(1),
      readabilityLevel
    }
  };
}

/**
 * Analyzes keyword density and usage
 * @param {string} text - The text to analyze
 * @param {Array} targetKeywords - Optional list of keywords to specifically check for
 * @returns {Object} Keyword analysis
 */
export function analyzeKeywords(text, targetKeywords = []) {
  // Prepare text
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = cleanText.split(/\s+/).filter(w => w.trim().length > 0);

  // Count occurrences of each word
  const wordCounts = {};
  words.forEach(word => {
    if (word.length < 2) return; // Skip very short words
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // Sort by frequency
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20) // Top 20 words
    .map(([word, count]) => ({
      word,
      count,
      density: ((count / words.length) * 100).toFixed(2) + '%'
    }));

  // Check for stop words among top words
  const stopWords = ['the', 'and', 'a', 'to', 'of', 'in', 'is', 'it', 'that', 'you',
    'for', 'on', 'with', 'as', 'are', 'be', 'this', 'was', 'have', 'or', 'at', 'not', 'your'];

  const topWordsExcludingStopWords = sortedWords
    .filter(item => !stopWords.includes(item.word))
    .slice(0, 10);

  // Check for target keywords
  const targetKeywordAnalysis = targetKeywords.map(keyword => {
    const keywordLower = keyword.toLowerCase();
    const count = (cleanText.match(new RegExp(`\\b${keywordLower}\\b`, 'g')) || []).length;
    const density = ((count / words.length) * 100).toFixed(2) + '%';

    // Check if keyword is in title, headings, etc. would be done here
    // but requires the document to be passed

    return {
      keyword,
      count,
      density,
      sufficient: count > 0
    };
  });

  return {
    wordCount: words.length,
    topWords: sortedWords,
    relevantKeywords: topWordsExcludingStopWords,
    targetKeywords: targetKeywordAnalysis.length > 0 ? targetKeywordAnalysis : undefined
  };
}

/**
 * Analyzes content structure (paragraphs, sentence structure, etc.)
 * @param {Document} document - DOM document
 * @returns {Object} Content structure analysis
 */
export function analyzeContentStructure(document) {
  const paragraphs = document.querySelectorAll('p');
  const paragraphCount = paragraphs.length;

  // Analyze paragraph lengths
  const paragraphLengths = Array.from(paragraphs).map(p => {
    const text = p.textContent.trim();
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    return wordCount;
  });

  const avgParagraphLength = paragraphLengths.reduce((sum, len) => sum + len, 0) /
    Math.max(paragraphLengths.length, 1);

  // Check for long paragraphs (potential readability issues)
  const longParagraphs = paragraphLengths.filter(len => len > 150).length;

  // Check for short paragraphs (often good for web readability)
  const shortParagraphs = paragraphLengths.filter(len => len <= 50).length;

  // Analyze lists (good for readability)
  const listItems = document.querySelectorAll('li').length;
  const lists = document.querySelectorAll('ul, ol').length;

  return {
    paragraphCount,
    averageParagraphLength: Math.round(avgParagraphLength),
    longParagraphs,
    shortParagraphs,
    listCount: lists,
    listItemCount: listItems,
    structureRating: getRatingForStructure(avgParagraphLength, longParagraphs, paragraphCount, lists),
    recommendations: getStructureRecommendations(avgParagraphLength, longParagraphs, paragraphCount, lists)
  };
}

/**
 * Analyzes the content-to-HTML ratio
 * @param {string} htmlContent - Raw HTML content
 * @param {string} textContent - Extracted text content
 * @returns {Object} Content-to-HTML analysis
 */
export function analyzeContentRatio(htmlContent, textContent) {
  const htmlSize = htmlContent.length;
  const textSize = textContent.length;

  const ratio = (textSize / htmlSize) * 100;

  let rating;
  if (ratio < 10) rating = 'Poor';
  else if (ratio < 25) rating = 'Average';
  else if (ratio < 50) rating = 'Good';
  else rating = 'Excellent';

  return {
    htmlSize,
    textSize,
    ratio: ratio.toFixed(2) + '%',
    rating
  };
}

// Helper function to estimate syllable count in text
function countSyllables(text) {
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;

  words.forEach(word => {
    word = word.replace(/[^a-z]/g, '');
    if (!word) return;

    // Special cases
    if (word.length <= 3) { count += 1; return; }

    // Count vowel groups
    word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllableCount = word.match(/[aeiouy]{1,2}/g);

    count += syllableCount ? syllableCount.length : 1;
  });

  return count;
}

// Helper function to rate content structure
function getRatingForStructure(avgParagraphLength, longParagraphs, paragraphCount, lists) {
  if (avgParagraphLength > 150 && longParagraphs > 5 && lists === 0) return 'Poor';
  if (avgParagraphLength > 100 && longParagraphs > 2) return 'Below Average';
  if (avgParagraphLength < 80 && paragraphCount > 3 && lists > 0) return 'Good';
  if (avgParagraphLength < 60 && paragraphCount > 5 && lists > 1) return 'Excellent';
  return 'Average';
}

// Helper function to generate recommendations for content structure
function getStructureRecommendations(avgParagraphLength, longParagraphs, paragraphCount, lists) {
  const recommendations = [];

  if (avgParagraphLength > 100) {
    recommendations.push('Consider breaking long paragraphs into shorter ones for better readability.');
  }

  if (longParagraphs > 3) {
    recommendations.push('Too many long paragraphs detected. Web users prefer shorter paragraphs.');
  }

  if (paragraphCount < 3) {
    recommendations.push('Add more paragraphs to properly organize your content.');
  }

  if (lists === 0) {
    recommendations.push('Consider using bulleted or numbered lists to improve content scanability.');
  }

  return recommendations;
} 