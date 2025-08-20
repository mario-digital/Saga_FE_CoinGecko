#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const darkModeCSS = `
    <style type='text/css'>
        /* Auto dark mode for coverage reports */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #1a1a1a !important;
                color: #e0e0e0 !important;
            }
            
            .wrapper {
                background-color: #1a1a1a !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
                color: #f108ff !important;
            }
            
            .coverage-summary td, .coverage-summary th {
                background-color: #2a2a2a !important;
                color: #e0e0e0 !important;
                border-color: #404040 !important;
            }
            
            .coverage-summary thead {
                background-color: #333 !important;
            }
            
            .coverage-summary tbody tr:hover {
                background-color: #3a3a3a !important;
            }
            
            a {
                color: #4dabf7 !important;
            }
            
            a:hover {
                color: #74c0fc !important;
            }
            
            .status-line {
                background-color: #2a2a2a !important;
                border-color: #404040 !important;
            }
            
            .quiet {
                color: #999 !important;
            }
            
            .strong {
                color: #fff !important;
                font-size: 1.1em !important;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
            }
            
            .fraction {
                color: #aaa !important;
                font-size: 0.95em !important;
            }
            
            /* Top coverage stats styling */
            .fl.pad1y.space-right2 {
                background: linear-gradient(135deg, #2a2a2a 0%, #333 100%) !important;
                border: 1px solid #404040 !important;
                border-radius: 6px !important;
                padding: 8px 12px !important;
                margin: 3px !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
            }
            
            .fl.pad1y.space-right2:hover {
                background: linear-gradient(135deg, #333 0%, #3a3a3a 100%) !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 3px 6px rgba(0,0,0,0.4) !important;
                transition: all 0.2s ease !important;
            }
            
            /* Remove ALL white backgrounds from stat containers */
            .clearfix {
                background-color: transparent !important;
            }
            
            .fl {
                background-color: transparent !important;
            }
            
            /* Force dark background on the stat box container */
            .fl.pad1y.space-right2 * {
                background-color: transparent !important;
            }
            
            /* Re-apply gradient only to the main container */
            .fl.pad1y.space-right2 {
                background: linear-gradient(135deg, #2a2a2a 0%, #333 100%) !important;
            }
            
            /* Make the percentage numbers really stand out */
            .fl.pad1y.space-right2 .strong {
                display: block !important;
                font-size: 1rem !important;
                font-weight: bold !important;
                color: #52c41a !important;
                text-shadow: 0 0 10px rgba(82, 196, 26, 0.3) !important;
                margin-bottom: 4px !important;
            }
            
            /* Labels under the percentages */
            .fl.pad1y.space-right2 .quiet {
                display: block !important;
                text-transform: uppercase !important;
                font-size: 0.75em !important;
                letter-spacing: 1px !important;
                color: #999 !important;
                margin-bottom: 4px !important;
            }
            
            /* Fraction numbers */
            .fl.pad1y.space-right2 .fraction {
                display: block !important;
                color: #74c0fc !important;
                font-size: 0.9em !important;
                opacity: 0.9 !important;
            }
            
            .high {
                background-color: #2b382b !important;
                color: #90ee90 !important;
            }
            
            .medium {
                background-color: #5a5a2d !important;
                color: #ffeb3b !important;
            }
            
            .low {
                background-color: #5a2d2d !important;
                color: #ff6b6b !important;
            }
            
            pre, code {
                background-color: #2a2a2a !important;
                color: #e0e0e0 !important;
                border-color: #404040 !important;
            }
            
            .line-count, .line-coverage {
                background-color: #2a2a2a !important;
                border-color: #404040 !important;
                color: #999 !important;
            }
            
            .pad1 {
                background-color: #1a1a1a !important;
            }
            
            .footer {
                background-color: #2a2a2a !important;
                color: #999 !important;
                border-top: 1px solid #404040 !important;
            }
            
            /* Coverage percentage bars */
            .cover-fill {
                background-color: #57807d !important;
            }
            
            .cover-empty {
                background-color: #3a3a3a !important;
            }
            
            /* Syntax highlighting for code */
            .prettyprint {
                background-color: #2a2a2a !important;
            }
            
            .cline-any {
                background-color: #2a2a2a !important;
            }
            
            /* File browser specific */
            .file {
                color: #4dabf7 !important;
            }
            
            /* Filter input - Smooth dark vibes */
            input[type="text"], input {
                background-color: #181818 !important;
                background-image: none !important;
                color: #888 !important;
                border: 1px solid #7e4141 !important;
                padding: 6px 10px !important;
                border-radius: 4px !important;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.5) !important;
            }
            
            input[type="text"]::placeholder, input::placeholder {
                color: #555 !important;
                opacity: 1 !important;
            }
            
            input[type="text"]:focus, input:focus {
                outline: none !important;
                border-color: #3a3a3a !important;
                background-color: #1a1a1a !important;
                background-image: none !important;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 0 0 1px rgba(77, 171, 247, 0.1) !important;
                color: #999 !important;
            }
            
            /* Sort arrows */
            .sorter {
                opacity: 0.8 !important;
            }
            
            /* Branch coverage colors */
            .branch-0 {
                background-color: #5a2d2d !important;
            }
            
            .branch-1 {
                background-color: #2d5a2d !important;
            }
            
            .cbranch-no {
                background-color: #5a2d2d !important;
            }
            
            .cbranch-yes {
                background-color: #2d5a2d !important;
            }
            
            /* Missing coverage highlight */
            .missing-if-branch {
                background-color: #5a5a2d !important;
                color: #ffeb3b !important;
            }
            
            .cstat-no {
                background-color: #5a2d2d !important;
                color: #ff6b6b !important;
            }
            
            .cstat-yes {
                background-color: #2d5a2d !important;
                color: #90ee90 !important;
            }
            
            /* Line number gutter */
            .linenums li {
                color: #666 !important;
                background-color: #1a1a1a !important;
            }
            
            /* Pretty print colors */
            .prettyprint .str { color: #98c379 !important; }
            .prettyprint .kwd { color: #c678dd !important; }
            .prettyprint .com { color: #5c6370 !important; }
            .prettyprint .typ { color: #e06c75 !important; }
            .prettyprint .lit { color: #d19a66 !important; }
            .prettyprint .pun { color: #abb2bf !important; }
            .prettyprint .pln { color: #abb2bf !important; }
            .prettyprint .tag { color: #e06c75 !important; }
            .prettyprint .atn { color: #d19a66 !important; }
            .prettyprint .atv { color: #98c379 !important; }
            .prettyprint .dec { color: #c678dd !important; }
        }
    </style>
`;

let fileCount = 0;
let failedFiles = [];

function addDarkModeToHTML(filePath) {
  try {
    let html = fs.readFileSync(filePath, 'utf8');

    // Remove existing dark mode CSS if present
    const darkModeRegex =
      /<style type='text\/css'>[\s\S]*?\/\* Auto dark mode for coverage reports \*\/[\s\S]*?<\/style>/g;
    html = html.replace(darkModeRegex, '');

    // Insert the new dark mode CSS before </head>
    html = html.replace('</head>', darkModeCSS + '</head>');

    fs.writeFileSync(filePath, html, 'utf8');
    fileCount++;
  } catch (error) {
    failedFiles.push({ file: filePath, error: error.message });
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.endsWith('.html')) {
      addDarkModeToHTML(fullPath);
    }
  }
}

// Main execution
const coverageDir = path.join(process.cwd(), 'coverage');

if (!fs.existsSync(coverageDir)) {
  console.error(
    'Coverage directory not found. Please run tests with coverage first.'
  );
  process.exit(1);
}

// Reset counters
fileCount = 0;
failedFiles = [];

// Process all HTML files
processDirectory(coverageDir);

// Print summary with clickable link
const reportPath = path.join(coverageDir, 'index.html');
const fileUrl = `file://${reportPath}`;

if (failedFiles.length > 0) {
  console.log(
    `✅ Dark mode applied to ${fileCount} coverage files (${failedFiles.length} failed)`
  );
  failedFiles.forEach(({ file, error }) => {
    console.error(`  ✗ ${file}: ${error}`);
  });
} else {
  console.log(`✅ Dark mode applied to ${fileCount} coverage files`);
}
console.log(`📊 View report: \x1b[36m${fileUrl}\x1b[0m`);
