/**
 * HTML template for SEO report
 */
export const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Analysis Report</title>
  <style>
    :root {
      --primary-color: #4a6cf7;
      --secondary-color: #eaeef7;
      --text-color: #333;
      --light-text: #666;
      --background: #ffffff;
      --border-color: #e8e8e8;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--background);
      padding: 0;
      margin: 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      background-color: var(--primary-color);
      color: white;
      padding: 20px 0;
      text-align: center;
      margin-bottom: 30px;
    }
    
    h1 {
      margin: 0;
      font-size: 2.5rem;
    }
    
    h2 {
      color: var(--primary-color);
      border-bottom: 2px solid var(--secondary-color);
      padding-bottom: 10px;
      margin-top: 40px;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid var(--border-color);
    }
    
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      padding: 15px;
      border-radius: 8px;
      background: var(--secondary-color);
      text-align: center;
    }
    
    .metric-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: var(--primary-color);
      margin: 10px 0;
    }
    
    pre {
      background: #f6f8fa;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      border: 1px solid var(--border-color);
    }
    
    .section {
      margin-bottom: 30px;
      overflow: hidden;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    table, th, td {
      border: 1px solid var(--border-color);
    }
    
    th, td {
      padding: 10px;
      text-align: left;
    }
    
    th {
      background-color: var(--secondary-color);
    }
    
    .issue {
      background-color: #fff8f8;
      border-left: 4px solid #ff5252;
      padding: 10px 15px;
      margin-bottom: 10px;
    }
    
    .footer {
      text-align: center;
      margin-top: 50px;
      padding: 20px;
      color: var(--light-text);
      font-size: 0.9rem;
      border-top: 1px solid var(--border-color);
    }
  </style>
</head>
<body>
  <header>
    <h1>SEO Analysis Report</h1>
    <p>Analysis performed on <%= generatedDate.toLocaleDateString() %></p>
  </header>
  
  <div class="container">
    <div class="section">
      <h2>Basic Information</h2>
      <div class="card">
        <p><strong>Title:</strong> <%= results.title %></p>
        <p><strong>Description:</strong> <%= results.description %></p>
        <p><strong>Keywords:</strong> <%= results.keywords %></p>
        <p><strong>Canonical Link:</strong> <%= results.canonicalLink %></p>
        <p><strong>URL Structure:</strong> <%= results.urlStructure %></p>
      </div>
    </div>
    
    <div class="section">
      <h2>Performance Metrics</h2>
      <div class="metrics">
        <div class="metric-card">
          <h3>Performance Score</h3>
          <div class="metric-value"><%= Math.round(results.performanceMetrics.performanceScore * 100) %>%</div>
        </div>
        <div class="metric-card">
          <h3>First Contentful Paint</h3>
          <div class="metric-value"><%= (results.performanceMetrics.FCP / 1000).toFixed(2) %>s</div>
        </div>
        <div class="metric-card">
          <h3>Largest Contentful Paint</h3>
          <div class="metric-value"><%= (results.performanceMetrics.LCP / 1000).toFixed(2) %>s</div>
        </div>
        <div class="metric-card">
          <h3>Total Blocking Time</h3>
          <div class="metric-value"><%= results.performanceMetrics.TBT.toFixed(0) %>ms</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>Images</h2>
      <div class="card">
        <p>Total Images: <%= results.images.length %></p>
        <p>Large Images (Potential Optimization): <%= results.largeImages.length %></p>
        
        <% if(results.images.length > 0) { %>
        <h3>Image Details</h3>
        <table>
          <tr>
            <th>Source</th>
            <th>Alt Text</th>
            <th>Size</th>
            <th>Format</th>
          </tr>
          <% results.images.forEach(img => { %>
          <tr>
            <td><%= img.src %></td>
            <td><%= img.alt || 'Missing Alt Text' %></td>
            <td><%= img.fileSize ? (img.fileSize / 1024).toFixed(2) + ' KB' : 'Unknown' %></td>
            <td><%= img.format || 'Unknown' %></td>
          </tr>
          <% }); %>
        </table>
        <% } %>
      </div>
    </div>
    
    <div class="section">
      <h2>Accessibility Issues</h2>
      <div class="card">
        <p>Total Issues: <%= results.accessibilityIssues.length %></p>
        
        <% if(results.accessibilityIssues.length > 0) { %>
          <% results.accessibilityIssues.forEach(issue => { %>
            <div class="issue">
              <h3><%= issue.id %>: <%= issue.description %></h3>
              <p><strong>Impact:</strong> <%= issue.impact %></p>
              <p><strong>Help:</strong> <%= issue.help %></p>
              <% if(issue.nodes && issue.nodes.length > 0) { %>
                <p><strong>Affected Elements:</strong> <%= issue.nodes.length %></p>
              <% } %>
            </div>
          <% }); %>
        <% } else { %>
          <p>No accessibility issues detected.</p>
        <% } %>
      </div>
    </div>
    
    <div class="section">
      <h2>JavaScript Analysis</h2>
      <div class="card">
        <p><strong>Rendering Method:</strong> <%= results.csrSsrDetection.isSSR ? 'Server-Side Rendering (SSR)' : 'Client-Side Rendering (CSR)' %></p>
        <p><strong>Recommendation:</strong> <%= results.csrSsrDetection.recommendation %></p>
        <p><strong>Total JS Size:</strong> <%= (results.jsDependencies.totalJsSize / 1024).toFixed(2) %> KB</p>
        <p><strong>Recommendation:</strong> <%= results.jsDependencies.recommendation %></p>
        
        <% if(results.jsDependencies.jsFiles.length > 0) { %>
        <h3>JS Files</h3>
        <table>
          <tr>
            <th>File URL</th>
            <th>Size (KB)</th>
          </tr>
          <% results.jsDependencies.jsFiles.forEach(file => { %>
          <tr>
            <td><%= file.url %></td>
            <td><%= (file.size / 1024).toFixed(2) %> KB</td>
          </tr>
          <% }); %>
        </table>
        <% } %>
      </div>
    </div>
    
    <div class="section">
      <h2>Mobile Friendliness</h2>
      <div class="card">
        <p><strong>Responsive Design:</strong> <%= results.mobileFriendliness.isResponsive ? 'Yes' : 'No' %></p>
        <% if(!results.mobileFriendliness.isResponsive) { %>
        <div class="issue">
          <p>The page does not have a proper viewport meta tag for responsive design. Consider adding:</p>
          <pre>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;</pre>
        </div>
        <% } %>
      </div>
    </div>
    
    <div class="section">
      <h2>Lazy Loading</h2>
      <div class="card">
        <p>Images with lazy loading: <%= results.lazyLoadingIssues.lazyLoadedImages.length %></p>
        
        <% if(results.lazyLoadingIssues.lazyLoadedImages.length > 0) { %>
        <h3>Lazy Loaded Images</h3>
        <ul>
          <% results.lazyLoadingIssues.lazyLoadedImages.forEach(img => { %>
            <li><%= img %></li>
          <% }); %>
        </ul>
        <% } else { %>
        <div class="issue">
          <p>No lazy loaded images detected. Consider adding the 'loading="lazy"' attribute to below-the-fold images.</p>
        </div>
        <% } %>
      </div>
    </div>
    
    <div class="section">
      <h2>SEO Files</h2>
      <div class="card">
        <h3>Robots.txt</h3>
        <pre><%= results.robotsTxt === 'Not Found' ? 'robots.txt file not found' : results.robotsTxt %></pre>
        
        <h3>Sitemap.xml</h3>
        <pre><%= results.sitemapXml === 'Not Found' ? 'sitemap.xml file not found' : results.sitemapXml %></pre>
      </div>
    </div>
    
    <div class="section">
      <h2>Open Graph</h2>
      <div class="card">
        <% if(Object.keys(results.openGraph).length > 0) { %>
        <table>
          <tr>
            <th>Property</th>
            <th>Content</th>
          </tr>
          <% for(let prop in results.openGraph) { %>
          <tr>
            <td><%= prop %></td>
            <td><%= results.openGraph[prop] %></td>
          </tr>
          <% } %>
        </table>
        <% } else { %>
        <div class="issue">
          <p>No Open Graph tags found. These are important for social media sharing.</p>
        </div>
        <% } %>
      </div>
    </div>
    
    <div class="section">
      <h2>Headings</h2>
      <div class="card">
        <% for(let i = 1; i <= 6; i++) { %>
          <% if(results.headings['h'+i] && results.headings['h'+i].length > 0) { %>
            <h3>H<%= i %> Tags (<%= results.headings['h'+i].length %>)</h3>
            <ul>
              <% results.headings['h'+i].forEach(heading => { %>
                <li><%= heading %></li>
              <% }); %>
            </ul>
          <% } %>
        <% } %>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Generated with SEO-Info - An SEO Analyzer for Single Page Applications</p>
    <p>Report generated on <%= generatedDate.toLocaleString() %></p>
  </div>
</body>
</html>
`; 