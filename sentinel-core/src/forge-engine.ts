import fs from 'fs';
import path from 'path';
import { loadConfig } from './config-loader';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });

  return arrayOfFiles;
}

export async function forgePlan(insightFile: string, pathIndex: number): Promise<boolean> {
  const config = loadConfig();
  const INSIGHTS_DIR = path.join(process.cwd(), config.paths.insightsDir);
  const PLAN_PATH = path.join(process.cwd(), config.planPath);
  const FPA_RULES_PATH = config.paths.fpaRules ? path.join(process.cwd(), config.paths.fpaRules) : null;

  const insightPath = path.join(INSIGHTS_DIR, insightFile);
  if (!fs.existsSync(insightPath)) {
    console.error(`❌ Insight file not found: ${insightPath}`);
    return false;
  }
  
  const content = fs.readFileSync(insightPath, 'utf8');

  // Robust Markdown block splitting
  const pathDivider = `### Path ${pathIndex}:`;
  const nextPathDivider = `### Path ${pathIndex + 1}:`;

  if (!content.includes(pathDivider)) {
    console.error(`❌ Parse Error: Cannot find ${pathDivider} in the insight report. Forging aborted.`);
    return false;
  }

  const splitParts = content.split(pathDivider);
  if (splitParts.length < 2) {
    console.error(`❌ Parse Error: Cannot find ${pathDivider} in the insight report. Forging aborted.`);
    return false;
  }

  const splitStart = splitParts[1];
  if (!splitStart) {
    console.error(`❌ Parse Error: Content after ${pathDivider} is empty.`);
    return false;
  }

  const chunk = splitStart.split(nextPathDivider)[0]?.split('---')[0]; // Limit to current path block
  if (!chunk) {
    console.error('❌ Parse Error: Selected path block is empty.');
    return false;
  }

  // Extract name and vision safely from the chunk
  const lines = chunk.split('\n').filter((l) => l.trim() !== '');
  if (lines.length === 0) {
    console.error('❌ Parse Error: Selected path block contains no lines.');
    return false;
  }
  const pathName = lines[0]?.trim() || 'Unnamed Path';

  const visionLine = lines.find((l) => l.includes('**The Vision**:'));
  const vision = visionLine && visionLine.split('**The Vision**:')[1]
    ? visionLine.split('**The Vision**:')[1]?.trim()
    : 'No explicit vision detected.';

  console.log(`\n⚒️  FORGING: "${pathName}"...\n`);

  // 🔍 Predictive Scanning (Configurable Source Dirs)
  const impactFiles: string[] = [];
  try {
    const keywords = [...pathName.split(' '), ...vision.split(' ')]
      .filter((k) => k.length > 5)
      .map((k) => k.replace(/[^a-zA-Z0-9_-]/g, '')); // sanitize

    if (keywords.length > 0) {
      const allFilesToScan: string[] = [];
      config.paths.sourceDirs.forEach(dir => {
        const fullDirPath = path.join(process.cwd(), dir);
        allFilesToScan.push(...getAllFiles(fullDirPath));
      });

      for (const kw of keywords.slice(0, 5)) {
        if (kw.trim().length === 0) continue;
        allFilesToScan.forEach((f) => {
          const fileContent = fs.readFileSync(f, 'utf8');
          if (fileContent.toLowerCase().includes(kw.toLowerCase()) && !impactFiles.includes(f)) {
            impactFiles.push(f);
          }
        });
      }
    }
  } catch (_e) {
    console.error('⚠️ Context scanning failed. Proceeding with limited FPA.');
  }

  // 🧮 Auto-FPA Calculation with Config Rules
  let fpaRules = {
    InternalLogicalFiles: { points_per_file: 7 },
    ExternalInterfaceFiles: { points_per_file: 5 },
  };

  if (FPA_RULES_PATH && fs.existsSync(FPA_RULES_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(FPA_RULES_PATH, 'utf8'));
      if (parsed.fpa_rules) fpaRules = parsed.fpa_rules;
    } catch (_e) {
      console.warn('⚠️ FPA Rules malformed. Using defaults.');
    }
  }

  let totalFP = 0;
  const criticalPathEntries = Object.entries(config.fpa.criticalPaths);

  impactFiles.forEach((f) => {
    const relativePath = path.relative(process.cwd(), f);
    const criticalMatch = criticalPathEntries.find(([p]) => relativePath.includes(p));
    
    if (criticalMatch) {
      totalFP += criticalMatch[1];
    } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.py') || f.endsWith('.go')) {
      totalFP += config.fpa.defaultFilePoints;
    }
  });

  const tier = totalFP <= 5 ? 'Tier 1' : totalFP <= 15 ? 'Tier 2' : 'Tier 3';

  // Strict output conforming to ELITE_PLAN_PROTOCOL.md
  const plan = `# Implementation Plan: ${pathName} [PID-SENTINEL]

> [!IMPORTANT]
> **GOAL**: ${pathName}
> **SOURCE INSIGHT**: [${insightFile}](file://${insightPath})
> **STRATEGY**: ${vision}
> 
> **AI INSTRUCTION**: This plan was forged via Sentinel Framework v5.0. Execute strictly within **${tier}** protocol gates.

### I. Deterministic Baseline (Phase Alpha)

- **GATE(BASELINE)**: Mandatory \`pre-flight\` execution completed prior to generation.
- **STATUS**: [PASS]
- **INVARIANT**: If any CLI tests break during refactor, development stops.

### II. Verification Sovereignty (Phase Beta)

| Path | Assertion | Verification Tool | Proof ID |
| --- | --- | --- | --- |
${
  impactFiles.length > 0
    ? impactFiles
        .slice(0, 3)
        .map(
          (f, i) =>
            `| \`${path.relative(process.cwd(), f)}\` | Maintains type safety and logic boundaries | Audit Tool | PRF-0${i + 1} |`
        )
        .join('\n')
    : '| `docs/` | Ensure documentation is updated | Visual | PRF-01 |'
}

### III. Dialectical Audit (Phase Gamma)

- **SENIOR_ARCHITECT**: "The strategy aims for ${vision.substring(0, 60)}... Ensure abstractions remain clean and do not cross unintended domain boundaries."
- **SECURITY_AUDITOR**: "Watch for PII leaks if touching components, and validate JWT enforcement on any new server actions invoked by this path."

### IV. Impact Heatmap (Phase Delta)

- **EPICENTER**: Insight Engine generated core vision.
- **RIPPLES**:
${impactFiles.length > 0 ? impactFiles.map((f) => `  - \`${path.relative(process.cwd(), f)}\``).join('\n') : '  - No direct file collision detected.'}
- **RISK_LEVEL**: ${totalFP > 15 ? 'HIGH' : totalFP > 5 ? 'MEDIUM' : 'LOW'}

### V. Fail-Safe Operations (Phase Epsilon)
- **POLICY(INTEGRITY)**: "Data integrity precedes feature availability."
- **MECHANISM**: Mandatory fallback paths. If regressions occur, revert to the deterministic baseline.

---

## 📋 Sentinel Governance Checklist & Gotchas
- [ ] 1. Run \`pre-flight\` before edit.
- [ ] 2. Run \`sentinel verify-plan\` before execution.
- [ ] 3. Ensure all new files follow the semantic naming convention.
- [ ] **GOTCHA**: [AI must identify specific side-effects here]

## Technical Execution (Proposed Changes)
<!-- AI: Flesh out the architecture here based on the forged context and ripples -->

## Function Point Analysis (FPA)

| Category | FP | 
| --- | --- |
| **Total Base FP** | **${totalFP}** |
| **Tier** | **${tier}** |

---
**Protocol Status**: Forged & Ready for Overlord execution.
**Timestamp**: ${new Date().toISOString()}
`;

  fs.writeFileSync(PLAN_PATH, plan);
  console.log(`\n✅ ELITE PLAN FORGED SUCCESSFULLY: ${config.planPath}`);
  return true;
}
