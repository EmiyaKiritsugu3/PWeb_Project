/**
 * Sentinel Brainstorm Engine (v4.0.1)
 * The Insight Generator for the Sovereign Council.
 */
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

const INSIGHTS_DIR = path.join(process.cwd(), 'docs/reports/insights');

export async function runBrainstorm() {
  console.log('\n🎨 SENTINEL: ACTIVATING INSIGHT ENGINE (SHOUT)...\n');

  if (!fs.existsSync(INSIGHTS_DIR)) {
    fs.mkdirSync(INSIGHTS_DIR, { recursive: true });
  }

  const { themeInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'themeInput',
      message: 'What is the Epicenter of the brainstorm? (Leave blank for Autopilot 360º Scan):',
    },
  ]);

  const theme = themeInput.trim() || 'Autopilot 360 Scan';
  const sanitizedTheme = theme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const reportFile = `INSIGHT-${new Date().toISOString().split('T')[0]}-${sanitizedTheme || 'unnamed'}.md`;
  const reportPath = path.join(INSIGHTS_DIR, reportFile);

  const skeleton = `# Insight Report: ${theme}

> [!TIP]
> **Epicenter**: ${theme}
> **Status**: [PENDING AI DIALECTIC]
> 
> **AI INSTRUCTION**: Act as **The Muse** and **The Artisan**. 
> 1. Read \`docs/CURRENT-STATE.md\`.
> 2. Propose 3 state-of-the-art directions.
> 3. Assign an **Innovation Score (0-100)** to each.

## 🌌 Context Radiance (360º Scan)
<!-- AI: Analyze how this theme impacts security, data, and user experience -->

## 🛠️ The 3 Paths (Brainstorm)

### Path 1: [Name]
- **Innovation Score**: 
- **The Vision**: 

### Path 2: [Name]
- ...

---
**Timestamp**: ${new Date().toISOString()}
`;

  fs.writeFileSync(reportPath, skeleton);
  console.log(`\n✅ BRAINSTORM SKELETON GENERATED: ${path.relative(process.cwd(), reportPath)}`);
  console.log('🤖 AI is now primed to start the ideation loop here.\n');
}
