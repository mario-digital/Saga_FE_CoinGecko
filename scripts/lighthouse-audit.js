/**
 * Lighthouse audit script for mobile performance testing
 */

const lighthouse = require('lighthouse').default || require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

async function runLighthouseAudit() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    // Mobile configuration
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
    },
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
    },
  };

  try {
    console.log('🚀 Starting Lighthouse audit for mobile...\n');

    // Run audit on homepage
    const runnerResult = await lighthouse('http://localhost:3000', options);

    // Extract scores
    const { categories } = runnerResult.lhr;
    const scores = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
    };

    console.log('📊 Lighthouse Mobile Scores:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(
      `Performance:    ${getScoreEmoji(scores.performance)} ${scores.performance}/100`
    );
    console.log(
      `Accessibility:  ${getScoreEmoji(scores.accessibility)} ${scores.accessibility}/100`
    );
    console.log(
      `Best Practices: ${getScoreEmoji(scores.bestPractices)} ${scores.bestPractices}/100`
    );
    console.log(
      `SEO:           ${getScoreEmoji(scores.seo)} ${scores.seo}/100`
    );
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if performance meets requirement
    if (scores.performance >= 90) {
      console.log('✅ Mobile performance score meets requirement (>= 90)');
    } else {
      console.log('❌ Mobile performance score below requirement (< 90)');
      console.log('\n🔍 Performance Issues:');

      // Show performance diagnostics
      const perfAudits = Object.values(runnerResult.lhr.audits)
        .filter(audit => audit.score !== null && audit.score < 0.9)
        .filter(audit => audit.details && audit.details.type === 'opportunity')
        .sort(
          (a, b) =>
            (b.details.overallSavingsMs || 0) -
            (a.details.overallSavingsMs || 0)
        )
        .slice(0, 5);

      perfAudits.forEach((audit, index) => {
        const savings = audit.details.overallSavingsMs
          ? `(${Math.round(audit.details.overallSavingsMs)}ms potential savings)`
          : '';
        console.log(`${index + 1}. ${audit.title} ${savings}`);
      });
    }

    // Save detailed reports
    const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
    await fs.mkdir(reportsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(
      path.join(reportsDir, `mobile-audit-${timestamp}.html`),
      runnerResult.report[0]
    );
    await fs.writeFile(
      path.join(reportsDir, `mobile-audit-${timestamp}.json`),
      runnerResult.report[1]
    );

    console.log(`\n📁 Detailed reports saved to: lighthouse-reports/`);

    // Return score for CI/CD integration
    return scores.performance >= 90;
  } catch (error) {
    console.error('Error running Lighthouse audit:', error);
    return false;
  } finally {
    await chrome.kill();
  }
}

function getScoreEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}

// Check if dev server is running
async function checkDevServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkDevServer();

  if (!serverRunning) {
    console.error('❌ Dev server not running on http://localhost:3000');
    console.log('Please run "pnpm dev" in another terminal first.');
    process.exit(1);
  }

  const passed = await runLighthouseAudit();
  process.exit(passed ? 0 : 1);
})();
