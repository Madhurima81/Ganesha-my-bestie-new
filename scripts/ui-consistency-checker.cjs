#!/usr/bin/env node

/**
 * UI Consistency Checker Agent
 *
 * Scans all scene files for UI pattern consistency:
 * - Scene headers
 * - Modals (instructions, info, etc.)
 * - Scene completion screens
 * - Opening/welcome modals
 * - Zone color systems
 *
 * Generates a detailed markdown report with file:line references
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  zonesDir: path.join(__dirname, '../src/zones'),
  outputFile: path.join(__dirname, '../UI-CONSISTENCY-REPORT.md'),
  modes: {
    reportOnly: true,
    interactive: false,
    autoFix: false
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
if (args.includes('--interactive')) {
  CONFIG.modes.reportOnly = false;
  CONFIG.modes.interactive = true;
}
if (args.includes('--auto-fix')) {
  CONFIG.modes.reportOnly = false;
  CONFIG.modes.autoFix = true;
}

// Results storage
const results = {
  sceneHeaders: [],
  modals: [],
  completionScreens: [],
  openingModals: [],
  colors: [],
  animations: [],
  buttons: []
};

// Statistics
const stats = {
  totalFiles: 0,
  totalIssues: 0,
  sceneHeaderPatterns: {},
  modalPatterns: {},
  completionPatterns: {},
  colorUsage: {},
  animationDurations: {}
};

/**
 * Recursively find all JSX/JS files in zones directory
 */
function findSceneFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findSceneFiles(filePath, fileList);
    } else if (file.match(/\.(jsx|js)$/) && !file.includes('.test.')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Analyze scene header patterns
 */
function analyzeSceneHeader(content, filePath) {
  const lines = content.split('\n');
  const issues = [];

  // Pattern 1: Check for scene header/title elements
  const headerPatterns = [
    { regex: /<div[^>]*className=["']scene-header/, name: 'scene-header', standard: true },
    { regex: /<header[^>]*className=["']scene-title/, name: 'scene-title-container', standard: false },
    { regex: /<div[^>]*className=["']title-container/, name: 'title-container', standard: false },
    { regex: /<h1[^>]*className=["']scene-title/, name: 'h1.scene-title', standard: true },
    { regex: /<h2[^>]*className=["']title/, name: 'h2.title', standard: false },
    { regex: /<div[^>]*className=["']scene-name/, name: 'scene-name', standard: false }
  ];

  let foundHeader = false;
  let headerType = null;

  lines.forEach((line, index) => {
    headerPatterns.forEach(pattern => {
      if (pattern.regex.test(line)) {
        foundHeader = true;
        headerType = pattern.name;

        // Track pattern usage
        stats.sceneHeaderPatterns[pattern.name] = (stats.sceneHeaderPatterns[pattern.name] || 0) + 1;

        if (!pattern.standard) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'scene-header',
            issue: `Non-standard header pattern: ${pattern.name}`,
            currentCode: line.trim(),
            severity: 'medium'
          });
        }
      }
    });
  });

  // Check for hardcoded header styles
  const headerStyleRegex = /<h[1-6][^>]*style=\{?\{?[^}]*position:|top:|color:/;
  lines.forEach((line, index) => {
    if (headerStyleRegex.test(line)) {
      issues.push({
        file: filePath,
        line: index + 1,
        type: 'scene-header',
        issue: 'Hardcoded inline styles in header (should use CSS classes)',
        currentCode: line.trim(),
        severity: 'high'
      });
    }
  });

  // Check for missing motion animations
  const hasMotion = content.includes('motion.h1') || content.includes('motion.div');
  const hasHeaderElement = content.match(/<h1|<header/);

  if (hasHeaderElement && !hasMotion && foundHeader) {
    const lineNum = content.split('\n').findIndex(l => l.match(/<h1|<header/)) + 1;
    issues.push({
      file: filePath,
      line: lineNum,
      type: 'scene-header',
      issue: 'Missing Framer Motion animation on header',
      currentCode: '',
      severity: 'low'
    });
  }

  return issues;
}

/**
 * Analyze modal patterns
 */
function analyzeModals(content, filePath) {
  const lines = content.split('\n');
  const issues = [];

  // Common modal patterns
  const modalPatterns = [
    { regex: /className=["']modal-overlay/, name: 'modal-overlay', standard: true },
    { regex: /className=["']modal-content/, name: 'modal-content', standard: true },
    { regex: /className=["']instruction-modal/, name: 'instruction-modal', standard: false },
    { regex: /className=["']info-modal/, name: 'info-modal', standard: false },
    { regex: /className=["']popup/, name: 'popup', standard: false }
  ];

  let modalFound = false;

  lines.forEach((line, index) => {
    modalPatterns.forEach(pattern => {
      if (pattern.regex.test(line)) {
        modalFound = true;
        stats.modalPatterns[pattern.name] = (stats.modalPatterns[pattern.name] || 0) + 1;

        if (!pattern.standard) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'modal',
            issue: `Non-standard modal class: ${pattern.name}`,
            currentCode: line.trim(),
            severity: 'medium'
          });
        }
      }
    });

    // Check for close button inconsistencies
    if (line.includes('modal-close') || line.includes('close-button') || line.includes('×')) {
      // Check position
      if (line.match(/position:\s*['"]?absolute/)) {
        const posMatch = line.match(/top:\s*['"]?([^'",}]+)|right:\s*['"]?([^'",}]+)|left:\s*['"]?([^'",}]+)/);
        if (posMatch && posMatch[0].includes('left:')) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'modal',
            issue: 'Close button positioned on left (should be top-right)',
            currentCode: line.trim(),
            severity: 'low'
          });
        }
      }
    }
  });

  return issues;
}

/**
 * Analyze completion screen patterns
 */
function analyzeCompletionScreens(content, filePath) {
  const lines = content.split('\n');
  const issues = [];

  // Check for completion screen components
  const completionPatterns = [
    'SceneCompletionCelebration',
    'DivineBlessingRain',
    'ZoneCompletionCelebration',
    'completion-screen',
    'fireworks'
  ];

  let hasCompletionScreen = false;
  let completionType = null;

  lines.forEach((line, index) => {
    completionPatterns.forEach(pattern => {
      if (line.includes(pattern)) {
        hasCompletionScreen = true;
        completionType = pattern;
        stats.completionPatterns[pattern] = (stats.completionPatterns[pattern] || 0) + 1;
      }
    });

    // Check for hardcoded stars display
    if (line.match(/⭐|★/) && !line.includes('//')) {
      issues.push({
        file: filePath,
        line: index + 1,
        type: 'completion',
        issue: 'Hardcoded star emojis (consider using StarDisplay component)',
        currentCode: line.trim(),
        severity: 'low'
      });
    }
  });

  return issues;
}

/**
 * Analyze color usage and zone color consistency
 */
function analyzeColors(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Detect zone from file path
  let zone = null;
  if (filePath.includes('symbol-mountain')) zone = 'symbol-mountain';
  else if (filePath.includes('meaning cave')) zone = 'cave-of-secrets';
  else if (filePath.includes('shloka-river')) zone = 'shloka-river';
  else if (filePath.includes('festival-square')) zone = 'festival-square';

  // Expected zone colors
  const zoneColors = {
    'symbol-mountain': ['#8B4513', '#CD853F', '#FFD700'],
    'cave-of-secrets': ['#4A148C', '#7B1FA2', '#9C27B0'],
    'shloka-river': ['#0277BD', '#0288D1', '#03A9F4'],
    'festival-square': ['#E91E63', '#F06292', '#FF4081']
  };

  // Find hex colors
  const hexColorRegex = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/g;

  lines.forEach((line, index) => {
    const matches = line.match(hexColorRegex);
    if (matches) {
      matches.forEach(color => {
        const upperColor = color.toUpperCase();

        // Track color usage
        stats.colorUsage[upperColor] = stats.colorUsage[upperColor] || { count: 0, files: [] };
        stats.colorUsage[upperColor].count++;
        if (!stats.colorUsage[upperColor].files.includes(filePath)) {
          stats.colorUsage[upperColor].files.push(filePath);
        }

        // Check if it's a zone color that should use CSS variable
        if (zone) {
          const expectedColors = zoneColors[zone] || [];
          const isZoneColor = expectedColors.some(zc => zc.toUpperCase() === upperColor);

          if (isZoneColor && !line.includes('var(--')) {
            issues.push({
              file: filePath,
              line: index + 1,
              type: 'color',
              issue: `Zone color ${color} should use CSS variable (--zone-${zone}-primary/secondary/accent)`,
              currentCode: line.trim(),
              severity: 'medium',
              suggestion: `Replace ${color} with var(--zone-${zone}-primary)`
            });
          }
        }
      });
    }
  });

  return issues;
}

/**
 * Analyze animation consistency
 */
function analyzeAnimations(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Find animation durations
  const durationRegex = /duration:\s*([0-9.]+)/g;

  lines.forEach((line, index) => {
    const matches = [...line.matchAll(durationRegex)];
    matches.forEach(match => {
      const duration = parseFloat(match[1]);
      stats.animationDurations[duration] = (stats.animationDurations[duration] || 0) + 1;

      // Flag unusual durations
      if (duration < 0.2 || duration > 2.0) {
        issues.push({
          file: filePath,
          line: index + 1,
          type: 'animation',
          issue: `Unusual animation duration: ${duration}s (standard is 0.3-0.8s)`,
          currentCode: line.trim(),
          severity: 'low'
        });
      }
    });
  });

  return issues;
}

/**
 * Analyze button consistency
 */
function analyzeButtons(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Common button class patterns
  const buttonPatterns = [
    { regex: /className=["']primary-btn["']/, name: 'primary-btn', standard: true },
    { regex: /className=["']button-primary["']/, name: 'button-primary', standard: false },
    { regex: /className=["']btn-primary["']/, name: 'btn-primary', standard: false },
    { regex: /className=["']main-button["']/, name: 'main-button', standard: false }
  ];

  lines.forEach((line, index) => {
    buttonPatterns.forEach(pattern => {
      if (pattern.regex.test(line)) {
        stats.sceneHeaderPatterns[pattern.name] = (stats.sceneHeaderPatterns[pattern.name] || 0) + 1;

        if (!pattern.standard && line.includes('<button')) {
          issues.push({
            file: filePath,
            line: index + 1,
            type: 'button',
            issue: `Non-standard button class: ${pattern.name} (should use "primary-btn")`,
            currentCode: line.trim(),
            severity: 'low'
          });
        }
      }
    });
  });

  return issues;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(CONFIG.zonesDir, filePath);

  console.log(`Scanning: ${relativePath}`);

  // Run all analyzers
  const headerIssues = analyzeSceneHeader(content, relativePath);
  const modalIssues = analyzeModals(content, relativePath);
  const completionIssues = analyzeCompletionScreens(content, relativePath);
  const colorIssues = analyzeColors(content, relativePath);
  const animationIssues = analyzeAnimations(content, relativePath);
  const buttonIssues = analyzeButtons(content, relativePath);

  // Aggregate issues
  results.sceneHeaders.push(...headerIssues);
  results.modals.push(...modalIssues);
  results.completionScreens.push(...completionIssues);
  results.colors.push(...colorIssues);
  results.animations.push(...animationIssues);
  results.buttons.push(...buttonIssues);

  stats.totalIssues += headerIssues.length + modalIssues.length + completionIssues.length +
                       colorIssues.length + animationIssues.length + buttonIssues.length;
}

/**
 * Generate markdown report
 */
function generateReport() {
  let report = `# 🎨 UI Consistency Report\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  report += `**Files Scanned:** ${stats.totalFiles}\n`;
  report += `**Total Issues Found:** ${stats.totalIssues}\n\n`;

  report += `---\n\n`;

  // Scene Headers Section
  report += `## 📋 Scene Header Consistency\n\n`;
  if (Object.keys(stats.sceneHeaderPatterns).length > 0) {
    report += `### Pattern Usage:\n`;
    const sorted = Object.entries(stats.sceneHeaderPatterns).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([pattern, count]) => {
      const emoji = pattern === 'scene-header' || pattern === 'h1.scene-title' ? '✅' : '⚠️';
      report += `- ${emoji} \`${pattern}\`: ${count} files\n`;
    });
    report += `\n`;
  }

  if (results.sceneHeaders.length > 0) {
    report += `### Issues Found (${results.sceneHeaders.length}):\n\n`;
    const groupedByFile = groupIssuesByFile(results.sceneHeaders);
    Object.entries(groupedByFile).forEach(([file, issues]) => {
      report += `#### 📁 \`${file}\`\n\n`;
      issues.forEach(issue => {
        report += `**Line ${issue.line}** - ${issue.issue}\n`;
        if (issue.currentCode) {
          report += `\`\`\`jsx\n${issue.currentCode}\n\`\`\`\n`;
        }
        if (issue.suggestion) {
          report += `💡 **Suggestion:** ${issue.suggestion}\n`;
        }
        report += `\n`;
      });
    });
  } else {
    report += `✅ No header inconsistencies found!\n\n`;
  }

  report += `---\n\n`;

  // Modals Section
  report += `## 🪟 Modal Consistency\n\n`;
  if (Object.keys(stats.modalPatterns).length > 0) {
    report += `### Pattern Usage:\n`;
    const sorted = Object.entries(stats.modalPatterns).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([pattern, count]) => {
      const emoji = pattern === 'modal-overlay' || pattern === 'modal-content' ? '✅' : '⚠️';
      report += `- ${emoji} \`${pattern}\`: ${count} files\n`;
    });
    report += `\n`;
  }

  if (results.modals.length > 0) {
    report += `### Issues Found (${results.modals.length}):\n\n`;
    const groupedByFile = groupIssuesByFile(results.modals);
    Object.entries(groupedByFile).forEach(([file, issues]) => {
      report += `#### 📁 \`${file}\`\n\n`;
      issues.forEach(issue => {
        report += `**Line ${issue.line}** - ${issue.issue}\n`;
        if (issue.currentCode) {
          report += `\`\`\`jsx\n${issue.currentCode}\n\`\`\`\n`;
        }
        report += `\n`;
      });
    });
  } else {
    report += `✅ No modal inconsistencies found!\n\n`;
  }

  report += `---\n\n`;

  // Completion Screens Section
  report += `## 🎉 Completion Screen Patterns\n\n`;
  if (Object.keys(stats.completionPatterns).length > 0) {
    report += `### Components Used:\n`;
    const sorted = Object.entries(stats.completionPatterns).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([pattern, count]) => {
      report += `- \`${pattern}\`: ${count} files\n`;
    });
    report += `\n`;
  }

  if (results.completionScreens.length > 0) {
    report += `### Issues Found (${results.completionScreens.length}):\n\n`;
    const groupedByFile = groupIssuesByFile(results.completionScreens);
    Object.entries(groupedByFile).forEach(([file, issues]) => {
      report += `#### 📁 \`${file}\`\n\n`;
      issues.forEach(issue => {
        report += `**Line ${issue.line}** - ${issue.issue}\n\n`;
      });
    });
  } else {
    report += `✅ No completion screen issues found!\n\n`;
  }

  report += `---\n\n`;

  // Colors Section
  report += `## 🎨 Zone Color System\n\n`;
  report += `### Recommended CSS Variables:\n\n`;
  report += `\`\`\`css\n`;
  report += `:root {\n`;
  report += `  /* Symbol Mountain - Earthy brown/orange */\n`;
  report += `  --zone-symbol-mountain-primary: #8B4513;\n`;
  report += `  --zone-symbol-mountain-secondary: #CD853F;\n`;
  report += `  --zone-symbol-mountain-accent: #FFD700;\n`;
  report += `  \n`;
  report += `  /* Cave of Secrets - Deep purple */\n`;
  report += `  --zone-cave-of-secrets-primary: #4A148C;\n`;
  report += `  --zone-cave-of-secrets-secondary: #7B1FA2;\n`;
  report += `  --zone-cave-of-secrets-accent: #9C27B0;\n`;
  report += `  \n`;
  report += `  /* Shloka River - Blue */\n`;
  report += `  --zone-shloka-river-primary: #0277BD;\n`;
  report += `  --zone-shloka-river-secondary: #0288D1;\n`;
  report += `  --zone-shloka-river-accent: #03A9F4;\n`;
  report += `  \n`;
  report += `  /* Festival Square - Pink/Celebration */\n`;
  report += `  --zone-festival-square-primary: #E91E63;\n`;
  report += `  --zone-festival-square-secondary: #F06292;\n`;
  report += `  --zone-festival-square-accent: #FF4081;\n`;
  report += `}\n`;
  report += `\`\`\`\n\n`;

  if (Object.keys(stats.colorUsage).length > 0) {
    report += `### Hardcoded Color Usage:\n`;
    const sorted = Object.entries(stats.colorUsage).sort((a, b) => b[1].count - a[1].count);
    sorted.forEach(([color, data]) => {
      report += `\n**${color}** (used ${data.count} times in ${data.files.length} files)\n`;
      data.files.slice(0, 3).forEach(file => {
        report += `  - ${file}\n`;
      });
      if (data.files.length > 3) {
        report += `  - ...and ${data.files.length - 3} more\n`;
      }
    });
    report += `\n\n`;
  }

  if (results.colors.length > 0) {
    report += `### Issues Found (${results.colors.length}):\n\n`;
    const groupedByFile = groupIssuesByFile(results.colors);
    Object.entries(groupedByFile).forEach(([file, issues]) => {
      report += `#### 📁 \`${file}\`\n\n`;
      issues.forEach(issue => {
        report += `**Line ${issue.line}** - ${issue.issue}\n`;
        if (issue.suggestion) {
          report += `💡 ${issue.suggestion}\n`;
        }
        report += `\n`;
      });
    });
  }

  report += `---\n\n`;

  // Animations Section
  report += `## ⏱️ Animation Timing Consistency\n\n`;
  if (Object.keys(stats.animationDurations).length > 0) {
    report += `### Duration Usage:\n`;
    const sorted = Object.entries(stats.animationDurations).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([duration, count]) => {
      const emoji = (duration >= 0.3 && duration <= 0.8) ? '✅' : '⚠️';
      report += `- ${emoji} ${duration}s: ${count} usages\n`;
    });
    report += `\n`;

    const mostCommon = sorted[0];
    report += `💡 **Recommended standard duration:** ${mostCommon[0]}s (most commonly used)\n\n`;
  }

  if (results.animations.length > 0) {
    report += `### Issues Found (${results.animations.length}):\n\n`;
    const groupedByFile = groupIssuesByFile(results.animations);
    Object.entries(groupedByFile).forEach(([file, issues]) => {
      report += `#### 📁 \`${file}\`\n\n`;
      issues.forEach(issue => {
        report += `**Line ${issue.line}** - ${issue.issue}\n\n`;
      });
    });
  } else {
    report += `✅ No animation timing issues found!\n\n`;
  }

  report += `---\n\n`;

  // Buttons Section
  report += `## 🔘 Button Class Consistency\n\n`;
  if (results.buttons.length > 0) {
    report += `### Issues Found (${results.buttons.length}):\n\n`;
    const groupedByFile = groupIssuesByFile(results.buttons);
    Object.entries(groupedByFile).forEach(([file, issues]) => {
      report += `#### 📁 \`${file}\`\n\n`;
      issues.forEach(issue => {
        report += `**Line ${issue.line}** - ${issue.issue}\n`;
        report += `\`\`\`jsx\n${issue.currentCode}\n\`\`\`\n\n`;
      });
    });
  } else {
    report += `✅ No button inconsistencies found!\n\n`;
  }

  report += `---\n\n`;

  // Recommendations Section
  report += `## 💡 Recommended Reusable Components\n\n`;
  report += `Based on the patterns found, consider creating these standardized components:\n\n`;

  report += `### 1. SceneHeader Component\n\n`;
  report += `\`\`\`jsx\n`;
  report += `// src/lib/components/common/SceneHeader.jsx\n`;
  report += `import { motion } from 'framer-motion';\n\n`;
  report += `export const SceneHeader = ({ title, zoneId, subtitle }) => (\n`;
  report += `  <div className={\`scene-header zone-\${zoneId}\`}>\n`;
  report += `    <motion.h1 \n`;
  report += `      className="scene-title"\n`;
  report += `      initial={{ opacity: 0, y: -20 }}\n`;
  report += `      animate={{ opacity: 1, y: 0 }}\n`;
  report += `      transition={{ duration: 0.5 }}\n`;
  report += `    >\n`;
  report += `      {title}\n`;
  report += `    </motion.h1>\n`;
  report += `    {subtitle && <p className="scene-subtitle">{subtitle}</p>}\n`;
  report += `  </div>\n`;
  report += `);\n`;
  report += `\`\`\`\n\n`;

  report += `### 2. StandardModal Component\n\n`;
  report += `\`\`\`jsx\n`;
  report += `// src/lib/components/common/StandardModal.jsx\n`;
  report += `import { motion, AnimatePresence } from 'framer-motion';\n\n`;
  report += `export const StandardModal = ({ isOpen, onClose, title, children, className = '' }) => (\n`;
  report += `  <AnimatePresence>\n`;
  report += `    {isOpen && (\n`;
  report += `      <motion.div \n`;
  report += `        className="modal-overlay"\n`;
  report += `        initial={{ opacity: 0 }}\n`;
  report += `        animate={{ opacity: 1 }}\n`;
  report += `        exit={{ opacity: 0 }}\n`;
  report += `        onClick={onClose}\n`;
  report += `      >\n`;
  report += `        <motion.div \n`;
  report += `          className={\`modal-content \${className}\`}\n`;
  report += `          initial={{ scale: 0.8, opacity: 0 }}\n`;
  report += `          animate={{ scale: 1, opacity: 1 }}\n`;
  report += `          exit={{ scale: 0.8, opacity: 0 }}\n`;
  report += `          onClick={e => e.stopPropagation()}\n`;
  report += `        >\n`;
  report += `          <button className="modal-close" onClick={onClose}>×</button>\n`;
  report += `          <h2 className="modal-title">{title}</h2>\n`;
  report += `          <div className="modal-body">{children}</div>\n`;
  report += `        </motion.div>\n`;
  report += `      </motion.div>\n`;
  report += `    )}\n`;
  report += `  </AnimatePresence>\n`;
  report += `);\n`;
  report += `\`\`\`\n\n`;

  report += `### 3. Corresponding CSS\n\n`;
  report += `\`\`\`css\n`;
  report += `/* Add to your global CSS or create SceneComponents.css */\n\n`;
  report += `/* Scene Headers */\n`;
  report += `.scene-header {\n`;
  report += `  padding: 2rem;\n`;
  report += `  text-align: center;\n`;
  report += `}\n\n`;
  report += `.scene-title {\n`;
  report += `  font-size: 2.5rem;\n`;
  report += `  margin: 0;\n`;
  report += `  font-weight: bold;\n`;
  report += `}\n\n`;
  report += `/* Zone-specific colors */\n`;
  report += `.zone-symbol-mountain .scene-title { color: var(--zone-symbol-mountain-primary); }\n`;
  report += `.zone-cave-of-secrets .scene-title { color: var(--zone-cave-of-secrets-primary); }\n`;
  report += `.zone-shloka-river .scene-title { color: var(--zone-shloka-river-primary); }\n`;
  report += `.zone-festival-square .scene-title { color: var(--zone-festival-square-primary); }\n\n`;
  report += `/* Standard Modal */\n`;
  report += `.modal-overlay {\n`;
  report += `  position: fixed;\n`;
  report += `  top: 0;\n`;
  report += `  left: 0;\n`;
  report += `  width: 100%;\n`;
  report += `  height: 100%;\n`;
  report += `  background: rgba(0, 0, 0, 0.7);\n`;
  report += `  display: flex;\n`;
  report += `  align-items: center;\n`;
  report += `  justify-content: center;\n`;
  report += `  z-index: 1000;\n`;
  report += `}\n\n`;
  report += `.modal-content {\n`;
  report += `  background: white;\n`;
  report += `  border-radius: 16px;\n`;
  report += `  padding: 2rem;\n`;
  report += `  max-width: 600px;\n`;
  report += `  max-height: 80vh;\n`;
  report += `  overflow-y: auto;\n`;
  report += `  position: relative;\n`;
  report += `}\n\n`;
  report += `.modal-close {\n`;
  report += `  position: absolute;\n`;
  report += `  top: 1rem;\n`;
  report += `  right: 1rem;\n`;
  report += `  background: none;\n`;
  report += `  border: none;\n`;
  report += `  font-size: 2rem;\n`;
  report += `  cursor: pointer;\n`;
  report += `  line-height: 1;\n`;
  report += `}\n`;
  report += `\`\`\`\n\n`;

  report += `---\n\n`;
  report += `## 📊 Summary\n\n`;
  report += `- **High Priority Issues:** ${countBySeverity('high')}\n`;
  report += `- **Medium Priority Issues:** ${countBySeverity('medium')}\n`;
  report += `- **Low Priority Issues:** ${countBySeverity('low')}\n\n`;

  report += `**Next Steps:**\n`;
  report += `1. Create the CSS variables file for zone colors\n`;
  report += `2. Build the standardized components (SceneHeader, StandardModal)\n`;
  report += `3. Gradually refactor scenes to use these components\n`;
  report += `4. Update your CSS to use the new variable system\n`;
  report += `5. Re-run this checker to verify improvements\n\n`;

  report += `---\n\n`;
  report += `*Report generated by UI Consistency Checker Agent*\n`;

  return report;
}

function groupIssuesByFile(issues) {
  const grouped = {};
  issues.forEach(issue => {
    if (!grouped[issue.file]) {
      grouped[issue.file] = [];
    }
    grouped[issue.file].push(issue);
  });
  return grouped;
}

function countBySeverity(severity) {
  let count = 0;
  Object.values(results).forEach(issueArray => {
    count += issueArray.filter(i => i.severity === severity).length;
  });
  return count;
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 UI Consistency Checker Agent\n');
  console.log(`Mode: ${CONFIG.modes.reportOnly ? 'Report Only' : CONFIG.modes.interactive ? 'Interactive' : 'Auto-Fix'}\n`);

  // Find all scene files
  console.log('📂 Scanning zones directory...\n');
  const sceneFiles = findSceneFiles(CONFIG.zonesDir);
  stats.totalFiles = sceneFiles.length;

  console.log(`Found ${sceneFiles.length} scene files\n`);

  // Analyze each file
  sceneFiles.forEach(analyzeFile);

  console.log(`\n✅ Scanning complete!`);
  console.log(`📊 Total issues found: ${stats.totalIssues}\n`);

  // Generate report
  console.log('📝 Generating report...\n');
  const report = generateReport();

  // Save report
  fs.writeFileSync(CONFIG.outputFile, report, 'utf8');
  console.log(`✅ Report saved to: ${path.relative(process.cwd(), CONFIG.outputFile)}\n`);

  console.log('🎯 Next steps:');
  console.log('   1. Open the report in VS Code');
  console.log('   2. Use Ctrl+G (or Cmd+G) to navigate to specific lines');
  console.log('   3. Fix issues manually or run with --auto-fix for simple changes\n');

  if (stats.totalIssues > 0) {
    process.exit(1); // Exit with error code if issues found
  }
}

// Run the agent
main();
