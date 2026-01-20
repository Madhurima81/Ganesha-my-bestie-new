#!/usr/bin/env node

/**
 * Back Button Consistency Agent
 *
 * Checks all scenes for:
 * - Back button presence
 * - Implementation patterns
 * - Positioning consistency
 * - Functionality (handlers, navigation)
 * - Disabled/hidden states during scene lifecycle
 *
 * Generates a detailed markdown report with recommendations
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  zonesDir: path.join(__dirname, '../src/zones'),
  outputFile: path.join(__dirname, '../BACK-BUTTON-REPORT.md'),
};

// Results storage
const results = {
  scenesWithBackButton: [],
  scenesMissingBackButton: [],
  implementationPatterns: [],
  positioningIssues: [],
  functionalityIssues: [],
  disabledStateIssues: []
};

// Statistics
const stats = {
  totalScenes: 0,
  scenesWithBack: 0,
  scenesMissingBack: 0,
  patterns: {},
  positions: {},
  zones: {
    'symbol-mountain': { total: 0, withBack: 0, missing: 0 },
    'meaning cave': { total: 0, withBack: 0, missing: 0 },
    'shloka-river': { total: 0, withBack: 0, missing: 0 },
    'festival-square': { total: 0, withBack: 0, missing: 0 }
  }
};

/**
 * Recursively find all scene JSX files (excluding component files)
 */
function findSceneFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip component/shared directories
      if (!file.includes('component') && !file.includes('shared') && !file.includes('config')) {
        findSceneFiles(filePath, fileList);
      }
    } else if (file.match(/\.(jsx|js)$/) && !file.includes('.test.')) {
      // Only include files that look like actual scenes (not tiny components)
      const content = fs.readFileSync(filePath, 'utf8');
      // Heuristic: scenes are usually larger and have certain patterns
      if (content.length > 1000 || content.includes('onNavigate') || content.includes('SceneManager')) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Detect zone from file path
 */
function detectZone(filePath) {
  if (filePath.includes('symbol-mountain')) return 'symbol-mountain';
  if (filePath.includes('meaning cave')) return 'meaning cave';
  if (filePath.includes('shloka-river')) return 'shloka-river';
  if (filePath.includes('festival-square')) return 'festival-square';
  return 'unknown';
}

/**
 * Analyze a scene file for back button
 */
function analyzeBackButton(content, filePath) {
  const lines = content.split('\n');
  const relativePath = path.relative(CONFIG.zonesDir, filePath);
  const zone = detectZone(filePath);

  // Update zone stats
  stats.zones[zone].total++;

  // Back button patterns to look for
  const patterns = {
    component: {
      regex: /<BackButton|<Back\s/,
      name: 'BackButton Component',
      found: false,
      line: null
    },
    buttonWithBack: {
      regex: /<button[^>]*>.*[Bb]ack/,
      name: 'Button with "Back" text',
      found: false,
      line: null
    },
    arrowButton: {
      regex: /<button[^>]*>.*[←⬅◄]/,
      name: 'Button with arrow icon',
      found: false,
      line: null
    },
    navigationBack: {
      regex: /onNavigate\s*\(\s*['"]back['"]/,
      name: 'onNavigate("back") handler',
      found: false,
      line: null
    },
    handleBack: {
      regex: /handleBack|goBack|navigateBack/,
      name: 'handleBack function',
      found: false,
      line: null
    }
  };

  // Positioning patterns
  const positionPatterns = {
    topLeft: { regex: /position:\s*['"]?absolute.*top.*left|left.*top/i, found: false },
    topRight: { regex: /position:\s*['"]?absolute.*top.*right|right.*top/i, found: false },
    fixed: { regex: /position:\s*['"]?fixed/i, found: false }
  };

  // Disabled/hidden state patterns
  const statePatterns = {
    disabled: { regex: /disabled=\{.*\}|disabled:\s*true/, found: false, line: null },
    hidden: { regex: /display:\s*['"]?none|visibility:\s*['"]?hidden|opacity:\s*0/, found: false, line: null },
    conditionalRender: { regex: /\{.*&&.*<.*[Bb]ack|showBack|isBackVisible/, found: false, line: null }
  };

  let hasBackButton = false;
  let backButtonInfo = {
    file: relativePath,
    zone: zone,
    patterns: [],
    position: null,
    handler: null,
    states: [],
    issues: []
  };

  // Scan file line by line
  lines.forEach((line, index) => {
    // Check for back button patterns
    Object.entries(patterns).forEach(([key, pattern]) => {
      if (pattern.regex.test(line)) {
        pattern.found = true;
        pattern.line = index + 1;
        hasBackButton = true;
        backButtonInfo.patterns.push({
          type: pattern.name,
          line: index + 1,
          code: line.trim()
        });

        // Track pattern statistics
        stats.patterns[pattern.name] = (stats.patterns[pattern.name] || 0) + 1;
      }
    });

    // Check positioning
    Object.entries(positionPatterns).forEach(([key, pattern]) => {
      if (pattern.regex.test(line) && (line.includes('back') || line.includes('Back'))) {
        pattern.found = true;
        backButtonInfo.position = key;
        stats.positions[key] = (stats.positions[key] || 0) + 1;
      }
    });

    // Check for disabled/hidden states
    Object.entries(statePatterns).forEach(([key, pattern]) => {
      if (pattern.regex.test(line) && (line.includes('back') || line.includes('Back'))) {
        pattern.found = true;
        pattern.line = index + 1;
        backButtonInfo.states.push({
          type: key,
          line: index + 1,
          code: line.trim()
        });
      }
    });
  });

  // Validate back button functionality
  if (hasBackButton) {
    // Check if handler exists
    if (patterns.navigationBack.found || patterns.handleBack.found) {
      backButtonInfo.handler = 'present';
    } else {
      backButtonInfo.handler = 'missing';
      backButtonInfo.issues.push({
        severity: 'high',
        issue: 'Back button found but no navigation handler detected',
        suggestion: 'Add onNavigate("back") or handleBack function'
      });
    }

    // Check for conditional rendering issues
    if (statePatterns.conditionalRender.found) {
      backButtonInfo.issues.push({
        severity: 'medium',
        issue: 'Back button has conditional rendering - may not be available at all times',
        suggestion: 'Ensure back button is accessible throughout scene lifecycle',
        line: statePatterns.conditionalRender.line
      });
    }

    // Check for disabled states
    if (statePatterns.disabled.found) {
      backButtonInfo.issues.push({
        severity: 'medium',
        issue: 'Back button can be disabled - verify this is intentional',
        suggestion: 'Users should generally be able to navigate back at any time',
        line: statePatterns.disabled.line
      });
    }

    // Check if position is consistent
    if (!backButtonInfo.position) {
      backButtonInfo.issues.push({
        severity: 'low',
        issue: 'Back button position not clearly defined',
        suggestion: 'Use consistent positioning (recommend: fixed top-left)'
      });
    }

    stats.scenesWithBack++;
    stats.zones[zone].withBack++;
    results.scenesWithBackButton.push(backButtonInfo);
  } else {
    stats.scenesMissingBack++;
    stats.zones[zone].missing++;
    results.scenesMissingBackButton.push({
      file: relativePath,
      zone: zone,
      severity: 'critical'
    });
  }

  stats.totalScenes++;
}

/**
 * Generate markdown report
 */
function generateReport() {
  let report = `# 🔙 Back Button Consistency Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  report += `---\n\n`;

  // Executive Summary
  report += `## 📊 Executive Summary\n\n`;
  report += `**Total Scenes Analyzed:** ${stats.totalScenes}\n`;
  report += `**Scenes with Back Button:** ${stats.scenesWithBack} (${Math.round(stats.scenesWithBack / stats.totalScenes * 100)}%)\n`;
  report += `**Scenes Missing Back Button:** ${stats.scenesMissingBack} (${Math.round(stats.scenesMissingBack / stats.totalScenes * 100)}%)\n\n`;

  if (stats.scenesMissingBack === 0) {
    report += `✅ **Excellent!** All scenes have back buttons.\n\n`;
  } else if (stats.scenesMissingBack < 5) {
    report += `⚠️ **Good Progress** - Only ${stats.scenesMissingBack} scenes need back buttons.\n\n`;
  } else {
    report += `❌ **Action Required** - ${stats.scenesMissingBack} scenes are missing back buttons.\n\n`;
  }

  report += `### By Zone:\n\n`;
  Object.entries(stats.zones).forEach(([zone, data]) => {
    if (data.total > 0) {
      const percentage = Math.round(data.withBack / data.total * 100);
      const emoji = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
      report += `${emoji} **${zone}**: ${data.withBack}/${data.total} (${percentage}%) - Missing: ${data.missing}\n`;
    }
  });
  report += `\n`;

  report += `---\n\n`;

  // Critical: Missing Back Buttons
  if (results.scenesMissingBackButton.length > 0) {
    report += `## 🚨 Critical: Scenes Missing Back Buttons (${results.scenesMissingBackButton.length})\n\n`;
    report += `These scenes have NO back button - users cannot navigate away!\n\n`;

    // Group by zone
    const byZone = {};
    results.scenesMissingBackButton.forEach(scene => {
      if (!byZone[scene.zone]) byZone[scene.zone] = [];
      byZone[scene.zone].push(scene);
    });

    Object.entries(byZone).forEach(([zone, scenes]) => {
      report += `### ${zone} (${scenes.length} scenes)\n\n`;
      scenes.forEach(scene => {
        report += `- ❌ \`${scene.file}\`\n`;
      });
      report += `\n`;
    });

    report += `**Recommended Action:**\n`;
    report += `1. Add a standardized BackButton component to each scene\n`;
    report += `2. Position consistently (recommend: fixed top-left)\n`;
    report += `3. Ensure it calls \`onNavigate('back')\` or similar handler\n\n`;

    report += `---\n\n`;
  }

  // Implementation Patterns
  report += `## 🔍 Implementation Patterns Found\n\n`;
  if (Object.keys(stats.patterns).length > 0) {
    report += `### Pattern Usage:\n\n`;
    const sortedPatterns = Object.entries(stats.patterns).sort((a, b) => b[1] - a[1]);
    sortedPatterns.forEach(([pattern, count]) => {
      const percentage = Math.round(count / stats.scenesWithBack * 100);
      report += `- **${pattern}**: ${count} scenes (${percentage}%)\n`;
    });
    report += `\n`;

    const mostCommon = sortedPatterns[0];
    if (sortedPatterns.length > 1) {
      report += `⚠️ **Inconsistency Detected:** ${sortedPatterns.length} different patterns in use.\n`;
      report += `💡 **Recommendation:** Standardize on "${mostCommon[0]}" (most common)\n\n`;
    } else {
      report += `✅ **Consistent:** All scenes use the same pattern.\n\n`;
    }
  }

  // Positioning Analysis
  if (Object.keys(stats.positions).length > 0) {
    report += `### Positioning Patterns:\n\n`;
    const sortedPos = Object.entries(stats.positions).sort((a, b) => b[1] - a[1]);
    sortedPos.forEach(([pos, count]) => {
      report += `- **${pos}**: ${count} scenes\n`;
    });
    report += `\n`;

    if (sortedPos.length > 1) {
      report += `⚠️ **Inconsistent Positioning:** Back buttons appear in ${sortedPos.length} different locations.\n`;
      report += `💡 **Recommendation:** Standardize position (top-left is most common in apps)\n\n`;
    }
  }

  report += `---\n\n`;

  // Functionality Issues
  const functionalityIssues = results.scenesWithBackButton.filter(s => s.issues.length > 0);
  if (functionalityIssues.length > 0) {
    report += `## ⚠️ Functionality Issues (${functionalityIssues.length} scenes)\n\n`;
    report += `These scenes have back buttons but with potential issues:\n\n`;

    // Group by issue severity
    const critical = functionalityIssues.filter(s => s.issues.some(i => i.severity === 'high'));
    const medium = functionalityIssues.filter(s => s.issues.some(i => i.severity === 'medium'));
    const low = functionalityIssues.filter(s => s.issues.some(i => i.severity === 'low'));

    if (critical.length > 0) {
      report += `### 🔴 High Priority (${critical.length})\n\n`;
      critical.forEach(scene => {
        report += `#### 📁 \`${scene.file}\`\n\n`;
        scene.issues.filter(i => i.severity === 'high').forEach(issue => {
          report += `**Issue:** ${issue.issue}\n`;
          report += `💡 **Suggestion:** ${issue.suggestion}\n\n`;
        });
      });
    }

    if (medium.length > 0) {
      report += `### 🟡 Medium Priority (${medium.length})\n\n`;
      medium.forEach(scene => {
        report += `#### 📁 \`${scene.file}\`\n\n`;
        scene.issues.filter(i => i.severity === 'medium').forEach(issue => {
          report += `**Issue:** ${issue.issue}\n`;
          if (issue.line) report += `**Line:** ${issue.line}\n`;
          report += `💡 **Suggestion:** ${issue.suggestion}\n\n`;
        });
      });
    }

    report += `---\n\n`;
  }

  // Timing/State Issues
  const stateIssues = results.scenesWithBackButton.filter(s => s.states.length > 0);
  if (stateIssues.length > 0) {
    report += `## ⏱️ Timing & State Issues (${stateIssues.length} scenes)\n\n`;
    report += `These scenes have back buttons that may not be available at all times:\n\n`;

    stateIssues.forEach(scene => {
      report += `### 📁 \`${scene.file}\`\n\n`;
      scene.states.forEach(state => {
        report += `**Line ${state.line}** - ${state.type}\n`;
        report += `\`\`\`jsx\n${state.code}\n\`\`\`\n\n`;
      });
      report += `⚠️ **Impact:** Back button may be hidden, disabled, or conditionally rendered during scene.\n`;
      report += `💡 **Recommendation:** Ensure users can navigate back at ANY point in the scene lifecycle.\n\n`;
    });

    report += `---\n\n`;
  }

  // Recommendations
  report += `## 💡 Recommendations\n\n`;
  report += `### 1. Create a Standardized BackButton Component\n\n`;
  report += `\`\`\`jsx\n`;
  report += `// src/lib/components/navigation/BackButton.jsx\n`;
  report += `import { motion } from 'framer-motion';\n\n`;
  report += `export const BackButton = ({ onNavigate, className = '' }) => (\n`;
  report += `  <motion.button\n`;
  report += `    className={\`back-button \${className}\`}\n`;
  report += `    onClick={() => onNavigate('back')}\n`;
  report += `    initial={{ opacity: 0 }}\n`;
  report += `    animate={{ opacity: 1 }}\n`;
  report += `    transition={{ delay: 0.3 }}\n`;
  report += `    whileHover={{ scale: 1.1 }}\n`;
  report += `    whileTap={{ scale: 0.9 }}\n`;
  report += `  >\n`;
  report += `    <span className="back-arrow">←</span>\n`;
  report += `    <span className="back-text">Back</span>\n`;
  report += `  </motion.button>\n`;
  report += `);\n`;
  report += `\`\`\`\n\n`;

  report += `### 2. Consistent Styling\n\n`;
  report += `\`\`\`css\n`;
  report += `.back-button {\n`;
  report += `  position: fixed;\n`;
  report += `  top: 1rem;\n`;
  report += `  left: 1rem;\n`;
  report += `  z-index: 100;\n`;
  report += `  background: rgba(255, 255, 255, 0.9);\n`;
  report += `  border: 2px solid #333;\n`;
  report += `  border-radius: 8px;\n`;
  report += `  padding: 0.5rem 1rem;\n`;
  report += `  cursor: pointer;\n`;
  report += `  display: flex;\n`;
  report += `  align-items: center;\n`;
  report += `  gap: 0.5rem;\n`;
  report += `  font-size: 1rem;\n`;
  report += `}\n\n`;
  report += `.back-button:hover {\n`;
  report += `  background: rgba(255, 255, 255, 1);\n`;
  report += `}\n\n`;
  report += `.back-arrow {\n`;
  report += `  font-size: 1.2rem;\n`;
  report += `}\n`;
  report += `\`\`\`\n\n`;

  report += `### 3. Usage in Every Scene\n\n`;
  report += `\`\`\`jsx\n`;
  report += `import { BackButton } from '@/lib/components/navigation/BackButton';\n\n`;
  report += `const MyScene = ({ onNavigate }) => {\n`;
  report += `  return (\n`;
  report += `    <div className="scene-container">\n`;
  report += `      <BackButton onNavigate={onNavigate} />\n`;
  report += `      {/* Rest of scene content */}\n`;
  report += `    </div>\n`;
  report += `  );\n`;
  report += `};\n`;
  report += `\`\`\`\n\n`;

  report += `### 4. Ensure Always Available\n\n`;
  report += `**Do NOT:**\n`;
  report += `- Hide back button during animations\n`;
  report += `- Disable back button during games\n`;
  report += `- Conditionally render based on game state\n\n`;
  report += `**DO:**\n`;
  report += `- Keep back button visible and clickable at ALL times\n`;
  report += `- Use high z-index to appear above modals and overlays\n`;
  report += `- Provide clear visual feedback on hover/click\n\n`;

  report += `---\n\n`;

  // Summary Stats
  report += `## 📊 Summary\n\n`;
  report += `- **Critical Issues:** ${results.scenesMissingBackButton.length} (missing back buttons)\n`;
  report += `- **High Priority:** ${functionalityIssues.filter(s => s.issues.some(i => i.severity === 'high')).length} (broken handlers)\n`;
  report += `- **Medium Priority:** ${functionalityIssues.filter(s => s.issues.some(i => i.severity === 'medium')).length + stateIssues.length} (timing/state issues)\n`;
  report += `- **Low Priority:** ${functionalityIssues.filter(s => s.issues.some(i => i.severity === 'low')).length} (positioning inconsistencies)\n\n`;

  report += `**Next Steps:**\n`;
  report += `1. Add back buttons to ${results.scenesMissingBackButton.length} scenes without them\n`;
  report += `2. Fix ${functionalityIssues.filter(s => s.issues.some(i => i.severity === 'high')).length} scenes with missing handlers\n`;
  report += `3. Review ${stateIssues.length} scenes with conditional/disabled states\n`;
  report += `4. Standardize on one BackButton component across all scenes\n`;
  report += `5. Ensure consistent positioning (recommend: fixed top-left)\n\n`;

  report += `---\n\n`;
  report += `*Report generated by Back Button Consistency Agent*\n`;

  return report;
}

/**
 * Main execution
 */
function main() {
  console.log('🔙 Back Button Consistency Agent\n');

  // Find all scene files
  console.log('📂 Scanning zones directory...\n');
  const sceneFiles = findSceneFiles(CONFIG.zonesDir);

  console.log(`Found ${sceneFiles.length} scene files\n`);

  // Analyze each file
  console.log('🔍 Analyzing back button presence...\n');
  sceneFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(CONFIG.zonesDir, filePath);
    console.log(`  Checking: ${relativePath}`);
    analyzeBackButton(content, filePath);
  });

  console.log(`\n✅ Analysis complete!\n`);
  console.log(`📊 Results:`);
  console.log(`   - Scenes with back button: ${stats.scenesWithBack}`);
  console.log(`   - Scenes missing back button: ${stats.scenesMissingBack}`);
  console.log(`   - Functionality issues: ${results.scenesWithBackButton.filter(s => s.issues.length > 0).length}\n`);

  // Generate report
  console.log('📝 Generating report...\n');
  const report = generateReport();

  // Save report
  fs.writeFileSync(CONFIG.outputFile, report, 'utf8');
  console.log(`✅ Report saved to: ${path.relative(process.cwd(), CONFIG.outputFile)}\n`);

  console.log('🎯 Next steps:');
  console.log('   1. Open BACK-BUTTON-REPORT.md in VS Code');
  console.log('   2. Address critical issues (missing back buttons)');
  console.log('   3. Fix functionality issues (broken handlers)');
  console.log('   4. Review timing/state issues\n');

  // Exit with error if critical issues found
  if (stats.scenesMissingBack > 0) {
    console.log('⚠️  Critical issues found - see report for details\n');
    process.exit(1);
  }
}

// Run the agent
main();
