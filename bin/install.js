#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(SCRIPT_DIR, '..');
const SKILLS_SRC = join(PKG_ROOT, 'skills');
const SKILLS_DST = join(homedir(), '.claude', 'skills');

const args = process.argv.slice(2);
const force = args.includes('--force');
const positional = args.filter((a) => !a.startsWith('--'));
const cmd = positional[0] ?? 'install';
const names = positional.slice(1);

function listBundled() {
  if (!existsSync(SKILLS_SRC)) return [];
  return readdirSync(SKILLS_SRC).filter((n) => statSync(join(SKILLS_SRC, n)).isDirectory());
}

function listInstalled() {
  if (!existsSync(SKILLS_DST)) return [];
  return readdirSync(SKILLS_DST).filter((n) => statSync(join(SKILLS_DST, n)).isDirectory());
}

function die(msg, code = 1) {
  console.error(`safehold-skills: ${msg}`);
  process.exit(code);
}

function ensureDst() {
  mkdirSync(SKILLS_DST, { recursive: true });
}

function installOne(name) {
  const src = join(SKILLS_SRC, name);
  const dst = join(SKILLS_DST, name);
  if (!existsSync(src)) die(`unknown skill: ${name}`);
  if (existsSync(dst) && !force) {
    die(`${name} already installed at ${dst}. Re-run with --force to overwrite.`);
  }
  cpSync(src, dst, { recursive: true });
  console.log(`installed ${name} -> ${dst}`);
}

function uninstallOne(name) {
  const dst = join(SKILLS_DST, name);
  if (!existsSync(dst)) die(`${name} is not installed`);
  rmSync(dst, { recursive: true, force: true });
  console.log(`removed ${dst}`);
}

switch (cmd) {
  case 'install': {
    ensureDst();
    const targets = names.length ? names : listBundled();
    if (!targets.length) die('no skills bundled');
    for (const n of targets) installOne(n);
    console.log('\nrestart Claude Code to pick up new skills.');
    break;
  }
  case 'uninstall': {
    if (!names.length) die('uninstall requires at least one skill name');
    for (const n of names) uninstallOne(n);
    break;
  }
  case 'list': {
    const bundled = listBundled();
    const installed = new Set(listInstalled());
    console.log('Bundled skills:');
    for (const n of bundled) {
      console.log(`  ${installed.has(n) ? '✓' : ' '} ${n}`);
    }
    break;
  }
  case 'help':
  case '--help':
  case '-h':
    console.log(`safehold-skills — install Claude Code skills that use Safehold

Usage:
  safehold-skills install [skill...]   Install all bundled skills (or named ones)
  safehold-skills uninstall <skill>    Remove an installed skill
  safehold-skills list                 List bundled and installed skills
  safehold-skills help                 Show this message

Flags:
  --force    Overwrite an existing skill on install

Skills install to ~/.claude/skills/<name>/`);
    break;
  default:
    die(`unknown command: ${cmd}. Try 'safehold-skills help'.`);
}
