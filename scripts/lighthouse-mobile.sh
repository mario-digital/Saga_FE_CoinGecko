#!/bin/bash

# Lighthouse mobile audit script

echo "🚀 Running Lighthouse mobile audit..."
echo ""

# Create reports directory if it doesn't exist
mkdir -p lighthouse-reports

# Run Lighthouse with mobile config
npx lighthouse http://localhost:3000 \
  --output=html,json \
  --output-path=./lighthouse-reports/mobile-audit \
  --emulated-form-factor=mobile \
  --throttling-method=simulate \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless" \
  --quiet

# Parse the JSON output to get scores
if [ -f "./lighthouse-reports/mobile-audit.report.json" ]; then
  echo "📊 Lighthouse Mobile Scores:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Extract scores using node
  node -e "
    const report = require('./lighthouse-reports/mobile-audit.report.json');
    const scores = {
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      bestPractices: Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
    };
    
    console.log(\`Performance:    \${scores.performance >= 90 ? '🟢' : scores.performance >= 50 ? '🟡' : '🔴'} \${scores.performance}/100\`);
    console.log(\`Accessibility:  \${scores.accessibility >= 90 ? '🟢' : scores.accessibility >= 50 ? '🟡' : '🔴'} \${scores.accessibility}/100\`);
    console.log(\`Best Practices: \${scores.bestPractices >= 90 ? '🟢' : scores.bestPractices >= 50 ? '🟡' : '🔴'} \${scores.bestPractices}/100\`);
    console.log(\`SEO:           \${scores.seo >= 90 ? '🟢' : scores.seo >= 50 ? '🟡' : '🔴'} \${scores.seo}/100\`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    if (scores.performance >= 90) {
      console.log('✅ Mobile performance score meets requirement (>= 90)');
    } else {
      console.log('❌ Mobile performance score below requirement (< 90)');
      console.log('');
      console.log('🔍 Top Performance Issues:');
      
      // Show top 5 performance opportunities
      const audits = Object.values(report.audits)
        .filter(audit => audit.score !== null && audit.score < 0.9)
        .filter(audit => audit.details && audit.details.type === 'opportunity')
        .filter(audit => audit.details.overallSavingsMs > 0)
        .sort((a, b) => (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0))
        .slice(0, 5);
        
      audits.forEach((audit, index) => {
        const savings = Math.round(audit.details.overallSavingsMs);
        console.log(\`\${index + 1}. \${audit.title} (\${savings}ms potential savings)\`);
      });
    }
  "
  
  echo ""
  echo "📁 Detailed reports saved to: lighthouse-reports/"
  echo "   - HTML: lighthouse-reports/mobile-audit.report.html"
  echo "   - JSON: lighthouse-reports/mobile-audit.report.json"
else
  echo "❌ Failed to generate Lighthouse report"
  exit 1
fi