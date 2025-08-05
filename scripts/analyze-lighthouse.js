const report = require('../lighthouse-reports/mobile-audit.report.json');

console.log('🔍 Performance Metrics:');
console.log('━━━━━━━━━━━━━━━━━━━━━━');

// Core Web Vitals
const fcp = report.audits['first-contentful-paint'];
const lcp = report.audits['largest-contentful-paint'];
const cls = report.audits['cumulative-layout-shift'];
const tbt = report.audits['total-blocking-time'];

console.log(`First Contentful Paint (FCP): ${fcp.displayValue}`);
console.log(`Largest Contentful Paint (LCP): ${lcp.displayValue}`);
console.log(`Cumulative Layout Shift (CLS): ${cls.displayValue}`);
console.log(`Total Blocking Time (TBT): ${tbt.displayValue}`);

console.log('\n📋 Failed Audits:');
console.log('━━━━━━━━━━━━━━━━━━━━━━');

// Get all failed audits
const failedAudits = Object.values(report.audits)
  .filter(audit => audit.score !== null && audit.score < 0.5)
  .filter(audit => audit.weight > 0)
  .sort((a, b) => b.weight - a.weight);

failedAudits.forEach(audit => {
  console.log(`- ${audit.title}`);
  if (audit.description) {
    console.log(`  → ${audit.description.split('.')[0]}.`);
  }
});

console.log('\n💡 Opportunities:');
console.log('━━━━━━━━━━━━━━━━━━━━━━');

// Get opportunities
const opportunities = Object.values(report.audits)
  .filter(audit => audit.details && audit.details.type === 'opportunity')
  .filter(audit => audit.score !== null && audit.score < 0.9)
  .sort(
    (a, b) =>
      (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0)
  );

opportunities.forEach(audit => {
  const savings = audit.details.overallSavingsMs
    ? ` (save ~${Math.round(audit.details.overallSavingsMs)}ms)`
    : '';
  console.log(`- ${audit.title}${savings}`);
});

console.log('\n🚀 Key Issues to Fix:');
console.log('━━━━━━━━━━━━━━━━━━━━━━');

// Main performance issues
if (lcp.score < 0.5) {
  console.log('1. Largest Contentful Paint is too slow');
  console.log('   - Current: ' + lcp.displayValue);
  console.log('   - Target: < 2.5s');
}

if (tbt.score < 0.5) {
  console.log('2. Total Blocking Time is too high');
  console.log('   - Current: ' + tbt.displayValue);
  console.log('   - Target: < 200ms');
}

// Check for specific issues
const renderBlocking = report.audits['render-blocking-resources'];
if (renderBlocking && renderBlocking.score < 1) {
  console.log('3. Eliminate render-blocking resources');
  if (renderBlocking.details && renderBlocking.details.items) {
    renderBlocking.details.items.forEach(item => {
      console.log(`   - ${item.url.split('/').pop()}`);
    });
  }
}
