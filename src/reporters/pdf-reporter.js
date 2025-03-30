import fs from 'fs';
import PDFDocument from 'pdfkit';
import { ensureOutputDir } from '../utils/paths.js';

/**
 * Generate a PDF report
 * @param {Object} results - Analysis results
 * @param {string} outputPath - Path to save the report
 * @returns {Promise<string>} Promise resolving to the report file path
 */
export async function generatePDFReport(results, outputPath) {
  try {
    ensureOutputDir(outputPath);

    const filePath = `${outputPath}.pdf`;
    const doc = createPDFDocument(results, filePath);

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(filePath));
      doc.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
}

/**
 * Create a PDF document with the analysis results
 * @param {Object} results - Analysis results
 * @param {string} filePath - Path to save the PDF
 * @returns {PDFDocument} The PDF document
 */
function createPDFDocument(results, filePath) {
  const doc = new PDFDocument({
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    size: 'A4',
  });

  doc.pipe(fs.createWriteStream(filePath));

  // Helper functions for PDF generation
  const addHeader = (text, size = 18, options = {}) => {
    const defaultOptions = { underline: false, align: 'left' };
    const mergedOptions = { ...defaultOptions, ...options };

    doc.fontSize(size)
      .fillColor('#4a6cf7')
      .text(text, mergedOptions);

    if (mergedOptions.underline) {
      const textWidth = doc.widthOfString(text);
      const x = mergedOptions.align === 'center' ?
        (doc.page.width - textWidth) / 2 :
        doc.x - textWidth;

      doc.moveTo(x, doc.y)
        .lineTo(x + textWidth, doc.y)
        .strokeColor('#4a6cf7')
        .lineWidth(1)
        .stroke();
    }

    doc.moveDown();
  };

  const addSection = (title) => {
    doc.addPage();
    addHeader(title, 16, { underline: true });
    doc.moveDown();
  };

  const addInfo = (label, value) => {
    doc.fontSize(10)
      .fillColor('#000000');

    doc.font('Helvetica-Bold').text(label + ': ', { continued: true });
    doc.font('Helvetica').text(value || 'N/A');
    doc.moveDown(0.5);
  };

  const addTable = (headers, data) => {
    const colWidth = (doc.page.width - 100) / headers.length;
    const rowHeight = 20;
    let y = doc.y;

    // Draw header
    doc.font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#000000');

    headers.forEach((header, i) => {
      doc.text(
        header,
        50 + (i * colWidth),
        y,
        { width: colWidth, align: 'left' }
      );
    });

    doc.moveDown();
    y = doc.y;

    // Draw horizontal line
    doc.moveTo(50, y - 5)
      .lineTo(doc.page.width - 50, y - 5)
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .stroke();

    // Draw data
    data.forEach((row, rowIndex) => {
      y = doc.y;

      // Check if we need a new page
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }

      row.forEach((cell, cellIndex) => {
        doc.font('Helvetica')
          .fontSize(9)
          .text(
            cell.toString(),
            50 + (cellIndex * colWidth),
            y,
            { width: colWidth, align: 'left' }
          );
      });

      doc.moveDown();

      // Draw row separator
      doc.moveTo(50, doc.y - 5)
        .lineTo(doc.page.width - 50, doc.y - 5)
        .strokeColor('#eeeeee')
        .lineWidth(0.5)
        .stroke();
    });

    doc.moveDown();
  };

  // Title page
  doc.font('Helvetica-Bold')
    .fontSize(24)
    .fillColor('#4a6cf7')
    .text('SEO Analysis Report', { align: 'center' });

  doc.moveDown();
  doc.font('Helvetica')
    .fontSize(14)
    .fillColor('#666666')
    .text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

  doc.moveDown(2);
  doc.font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#000000')
    .text(`Analyzed URL: ${results.baseUrl || 'N/A'}`, { align: 'center' });

  // Basic Info section
  addSection('Basic Information');
  addInfo('Title', results.title);
  addInfo('Description', results.description);
  addInfo('Keywords', results.keywords);
  addInfo('Canonical Link', results.canonicalLink);
  addInfo('URL Structure', results.urlStructure);

  // Performance Metrics
  addSection('Performance Metrics');
  addInfo('Performance Score', `${Math.round(results.performanceMetrics.performanceScore * 100)}%`);
  addInfo('First Contentful Paint', `${(results.performanceMetrics.FCP / 1000).toFixed(2)}s`);
  addInfo('Largest Contentful Paint', `${(results.performanceMetrics.LCP / 1000).toFixed(2)}s`);
  addInfo('Total Blocking Time', `${results.performanceMetrics.TBT.toFixed(0)}ms`);

  // Images
  addSection('Images');
  addInfo('Total Images', results.images.length.toString());
  addInfo('Large Images', results.largeImages.length.toString());

  if (results.images.length > 0) {
    doc.moveDown();
    addHeader('Image Details', 12);

    const imageHeaders = ['Source', 'Alt Text', 'Size', 'Format'];
    const imageData = results.images.map(img => [
      img.src.substring(0, 30) + (img.src.length > 30 ? '...' : ''),
      img.alt || 'Missing Alt',
      img.fileSize ? `${(img.fileSize / 1024).toFixed(2)} KB` : 'Unknown',
      img.format || 'Unknown'
    ]);

    addTable(imageHeaders, imageData);
  }

  // Accessibility Issues
  addSection('Accessibility Issues');
  addInfo('Total Issues', results.accessibilityIssues.length.toString());

  if (results.accessibilityIssues.length > 0) {
    results.accessibilityIssues.slice(0, 5).forEach((issue, index) => {
      doc.moveDown();
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .text(`Issue ${index + 1}: ${issue.id}`);

      doc.font('Helvetica')
        .fontSize(10)
        .text(issue.description);

      addInfo('Impact', issue.impact);
      doc.moveDown(0.5);
    });

    if (results.accessibilityIssues.length > 5) {
      doc.font('Helvetica-Oblique')
        .fontSize(9)
        .text(`... and ${results.accessibilityIssues.length - 5} more issues`);
    }
  }

  // JavaScript Analysis
  addSection('JavaScript Analysis');
  addInfo('Rendering Method', results.csrSsrDetection.isSSR ? 'Server-Side Rendering (SSR)' : 'Client-Side Rendering (CSR)');
  addInfo('Total JS Size', `${(results.jsDependencies.totalJsSize / 1024).toFixed(2)} KB`);
  addInfo('Recommendation', results.jsDependencies.recommendation);

  if (results.jsDependencies.jsFiles.length > 0) {
    doc.moveDown();
    addHeader('JS Files', 12);

    const jsHeaders = ['File URL', 'Size (KB)'];
    const jsData = results.jsDependencies.jsFiles.slice(0, 10).map(file => [
      file.url.substring(0, 40) + (file.url.length > 40 ? '...' : ''),
      (file.size / 1024).toFixed(2)
    ]);

    addTable(jsHeaders, jsData);

    if (results.jsDependencies.jsFiles.length > 10) {
      doc.font('Helvetica-Oblique')
        .fontSize(9)
        .text(`... and ${results.jsDependencies.jsFiles.length - 10} more files`);
    }
  }

  // Mobile Friendliness
  addSection('Mobile Friendliness');
  addInfo('Responsive Design', results.mobileFriendliness.isResponsive ? 'Yes' : 'No');

  if (!results.mobileFriendliness.isResponsive) {
    doc.moveDown();
    doc.font('Helvetica-Bold')
      .fontSize(10)
      .text('Recommendation:');

    doc.font('Helvetica')
      .fontSize(9)
      .text('The page does not have a proper viewport meta tag for responsive design. Consider adding:');

    doc.moveDown(0.5);
    doc.font('Courier')
      .fontSize(8)
      .text('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  }

  // Lazy Loading
  addSection('Lazy Loading');
  addInfo('Images with lazy loading', results.lazyLoadingIssues.lazyLoadedImages.length.toString());

  if (results.lazyLoadingIssues.lazyLoadedImages.length === 0) {
    doc.moveDown();
    doc.font('Helvetica-Bold')
      .fontSize(10)
      .text('Recommendation:');

    doc.font('Helvetica')
      .fontSize(9)
      .text('No lazy loaded images detected. Consider adding the \'loading="lazy"\' attribute to below-the-fold images.');
  }

  // Footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);

    // Footer text
    doc.fontSize(8)
      .fillColor('#999999')
      .text(
        'Generated with SEO-Info - An SEO Analyzer for SPAs',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    // Page numbers
    doc.text(
      `Page ${i + 1} of ${pageCount}`,
      50,
      doc.page.height - 35,
      { align: 'center' }
    );
  }

  doc.end();
  return doc;
} 