/**
 * Sentinel CLI Dispatcher (v4.0.1)
 * Central Command for the Sovereign Council.
 */
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { runBrainstorm } from './brainstorm';
import { forgePlan } from './forge-engine';

const PLAN_PATH = path.join(process.cwd(), 'implementation_plan.md');

async function plan() {
  console.log('\n🛡️  SENTINEL: INITIALIZING PLAN PROTOCOL...\n');

  let preflightStatus = 'PASS';
  let preflightOutput = '';
  try {
    console.log('⏳ Running pre-flight baseline...');
    execSync('npm run pre-flight', { stdio: 'pipe' });
  } catch (error: unknown) {
    const err = error as { stdout?: Buffer; message: string };
    preflightStatus = 'FAIL';
    preflightOutput = err.stdout?.toString() || err.message;
  }

  const { goal } = await inquirer.prompt([
    { type: 'input', name: 'goal', message: 'Primary Objective (The "Goal"):' },
  ]);

  const skeleton = `# Implementation Plan: [PENDING COUNCIL RATIFICATION]

> [!IMPORTANT]
> **GOAL**: ${goal.trim()}
> **BASELINE**: ${preflightStatus === 'PASS' ? '✅ SECURE' : '❌ REGRESSED'}
> 
> **AI INSTRUCTION**: This is a Tiered Sovereign Plan. You are now the **Overlord**. 
> 1. Calculate the **Function Points (FP)** using \`docs/process/FPA-RULES.json\`.
> 2. Determine the **Complexity Tier**.
> 3. Fill the \`## Pre-Planning Tool Log\` with evidence before proposing the architecture.

## 🛡️ Sentinel Baseline Audit
${preflightStatus === 'FAIL' ? '\n```\n' + preflightOutput + '\n```' : 'No regressions detected.'}

## 🔍 Pre-Planning Tool Log
<!-- AI: PAUSE HERE. YOU MUST RUN SEARCH TOOLS AND PASTE OUTPUT BEFORE PROCEEDING -->

---
**Protocol Status**: Waiting for Overlord Analysis...
**Timestamp**: ${new Date().toISOString()}
`;

  fs.writeFileSync(PLAN_PATH, skeleton);
  console.log(`\n✅ SKELETON GENERATED: ${PLAN_PATH}`);

  // Auto-open logic
  try {
    const opener =
      process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    spawn(opener, [PLAN_PATH], { detached: true, stdio: 'ignore' }).unref();
    console.log('📖 Opening plan in your default editor...');
  } catch {
    console.log('🔗 Link: ' + path.relative(process.cwd(), PLAN_PATH));
  }
}

async function forge() {
  console.log('\n⚒️  SENTINEL: STARTING THE FORGE...\n');

  try {
    console.log('⏳ Running pre-flight baseline before forging...');
    execSync('npm run pre-flight', { stdio: 'pipe' });
  } catch (error: unknown) {
    const err = error as { stdout?: Buffer; message: string };
    console.error('❌ Baseline validation failed. Aborting Forge to maintain state integrity.');
    console.error(err.stdout?.toString() || err.message);
    return;
  }

  const insightsDir = path.join(process.cwd(), 'docs/reports/insights');
  if (!fs.existsSync(insightsDir)) {
    console.error('❌ No insights found in docs/reports/insights/');
    return;
  }

  const files = fs.readdirSync(insightsDir).filter((f) => f.endsWith('.md'));
  if (files.length === 0) {
    console.error('❌ No insight reports found.');
    return;
  }

  const { insightFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'insightFile',
      message: 'Select an Insight Report to forge:',
      choices: files,
    },
  ]);

  const { pathIndex } = await inquirer.prompt([
    {
      type: 'input',
      name: 'pathIndex',
      message: 'Which Path index to forge? (e.g., 1, 2, 3):',
      default: '1',
    },
  ]);

  await forgePlan(insightFile, parseInt(pathIndex));

  // Auto-open logic
  try {
    const opener =
      process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    spawn(opener, [PLAN_PATH], { detached: true, stdio: 'ignore' }).unref();
    console.log('📖 Plan forged and opened in your default editor.');
  } catch {
    console.log('🔗 Link: ' + path.relative(process.cwd(), PLAN_PATH));
  }
}

async function audit() {
  console.log('\n🛡️  SENTINEL: AUDITING CURRENT STATE...\n');
  try {
    execSync('npm run pre-flight', { stdio: 'inherit' });
    console.log('\n✅ BASELINE SECURE. All quality gates passed.');
  } catch {
    console.log('\n❌ AUDIT FAILED. Check logs for regressions.');
    process.exit(1);
  }
}

function status() {
  console.log('\n🛡️  SENTINEL STATUS');
  console.log('------------------');
  console.log('Protocol Version: 4.0.1');
  console.log(`Current Dir: ${process.cwd()}`);
  console.log(`Baseline Rule: docs/security/BASELINE.json`);
  console.log('------------------\n');
}

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'plan':
      await plan();
      break;
    case 'brainstorm':
    case 'shout':
      await runBrainstorm();
      break;
    case 'forge':
      await forge();
      break;
    case 'audit':
      await audit();
      break;
    case 'status':
      status();
      break;
    default:
      console.log('Usage: sentinel <plan|brainstorm|forge|audit|status>');
      process.exit(1);
  }
}

main().catch(console.error);
