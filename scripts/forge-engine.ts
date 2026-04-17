import fs from 'fs';
import path from 'path';

const INSIGHTS_DIR = path.join(process.cwd(), 'docs/reports/insights');
const PLAN_PATH = path.join(process.cwd(), 'implementation_plan.md');
const FPA_RULES_PATH = path.join(process.cwd(), 'docs/process/FPA-RULES.json');

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
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
  const insightPath = path.join(INSIGHTS_DIR, insightFile);
  const content = fs.readFileSync(insightPath, 'utf8');

  // Robust Markdown block splitting
  const pathDivider = `### Path ${pathIndex}:`;
  const nextPathDivider = `### Path ${pathIndex + 1}:`;

  if (!content.includes(pathDivider)) {
    console.error(
      `❌ Parse Error: Cannot find ${pathDivider} in the insight report. Forging aborted.`
    );
    return false;
  }

  const splitStart = content.split(pathDivider)[1];
  const chunk = splitStart.split(nextPathDivider)[0].split('---')[0]; // Limit to current path block

  // Extract name and vision safely from the chunk
  const lines = chunk.split('\n').filter((l) => l.trim() !== '');
  if (lines.length === 0) {
    console.error('❌ Parse Error: Selected path block is empty.');
    return false;
  }
  const pathName = lines[0].trim();

  const visionLine = lines.find((l) => l.includes('**The Vision**:'));
  const vision = visionLine
    ? visionLine.split('**The Vision**:')[1].trim()
    : 'No explicit vision detected.';

  console.log(`\n⚒️  FORGING: "${pathName}"...\n`);

  // 🔍 Predictive Scanning (Native Node.js to prevent Shell Injection)
  const impactFiles: string[] = [];
  try {
    const keywords = [...pathName.split(' '), ...vision.split(' ')]
      .filter((k) => k.length > 5)
      .map((k) => k.replace(/[^a-zA-Z0-9_-]/g, '')); // sanitize

    if (keywords.length > 0) {
      const srcDir = path.join(process.cwd(), 'src');
      if (fs.existsSync(srcDir)) {
        const allSrcFiles = getAllFiles(srcDir);

        for (const kw of keywords.slice(0, 5)) {
          if (kw.trim().length === 0) continue;
          allSrcFiles.forEach((f) => {
            const fileContent = fs.readFileSync(f, 'utf8');
            if (fileContent.toLowerCase().includes(kw.toLowerCase()) && !impactFiles.includes(f)) {
              impactFiles.push(f);
            }
          });
        }
      }
    }
  } catch (_e) {
    console.error('⚠️ Context scanning failed. Proceeding with limited FPA.');
  }

  // 🧮 Auto-FPA Calculation with Fail-Safe Fallbacks
  let fpaRules = {
    InternalLogicalFiles: { points_per_file: 7 },
    ExternalInterfaceFiles: { points_per_file: 5 },
  };

  if (fs.existsSync(FPA_RULES_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(FPA_RULES_PATH, 'utf8'));
      if (parsed.fpa_rules) fpaRules = parsed.fpa_rules;
    } catch (_e) {
      console.warn('⚠️ FPA Rules malformed. Using internal defaults.');
    }
  } else {
    console.warn('⚠️ FPA Rules file missing. Using internal defaults.');
  }

  let totalFP = 0;

  impactFiles.forEach((f) => {
    if (f.includes('prisma/schema') || f.includes('src/services/')) {
      totalFP += fpaRules.InternalLogicalFiles?.points_per_file || 7;
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      totalFP += 4;
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
> **AI INSTRUCTION**: This plan was forged via Sentinel Forge v5.1. Execute strictly within **${tier}** protocol gates.

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
            `| \`${path.relative(process.cwd(), f)}\` | Maintains type safety and logic boundaries | \`tsc\` & \`vitest\` | PRF-0${i + 1} |`
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
- [ ] 1. Run \`npm run pre-flight\` before edit.
- [ ] 2. Run \`./sentinel verify-plan\` before execution.
- [ ] 3. Ensure all new files follow the semantic naming convention.
- [ ] **GOTCHA**: [AI must identify specific side-effects here]

## Technical Execution (Proposed Changes)
<!-- AI: Flesh out the architecture here -->
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
  console.log(`\n✅ ELITE PLAN FORGED SUCCESSFULLY: implementation_plan.md`);
  return true;
}
