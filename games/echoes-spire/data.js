'use strict';
// =====================================================================
// Echoes of the Spire — static data: notes, resonators, enemies, relics, acts
// (classic scripts: these top-level consts are shared by the other game files)
// =====================================================================

// the five notes of the C major pentatonic scale — everything you build is always in tune
const NOTES = [
  { k: 'C', semi: 0, col: '#ff6fa3', rgb: '255,111,163' },
  { k: 'D', semi: 2, col: '#ffb454', rgb: '255,180,84' },
  { k: 'E', semi: 4, col: '#c8f26a', rgb: '200,242,106' },
  { k: 'G', semi: 7, col: '#4fe3ff', rgb: '79,227,255' },
  { k: 'A', semi: 9, col: '#a98bff', rgb: '169,139,255' },
];
const noteFreq = (n, oct) => 261.6256 * Math.pow(2, (NOTES[((n % 5) + 5) % 5].semi + 12 * (oct - 4)) / 12);
const isFifth = (a, b) => { const d = (NOTES[b].semi - NOTES[a].semi + 12) % 12; return d === 7 || d === 5; };

// chords (sets of note indices) formed by three mutually linked resonators
const CHORDS = {
  radiant: { notes: [0, 2, 3], col: '#ffe08a', rgb: '255,224,138' },   // C E G  — major triad: heals the spire
  lament:  { notes: [4, 0, 2], col: '#c38bff', rgb: '195,139,255' },   // A C E  — minor triad: enemies take more damage
  sus:     { notes: [1, 3, 4], col: '#7ff5ff', rgb: '127,245,255' },   // D G A  — suspended: a slowing field
};
// harmonies listed in the codex (discovered the first time you form them)
const HARMONIES = ['shield', 'blast', 'fifth', 'radiant', 'lament', 'sus', 'grand'];

const ROLE_ORDER = ['bell', 'harp', 'hum', 'ward', 'echo'];
// pat = the 16th-note steps (of a 16-step bar) on which the resonator sounds, per level
const ROLES = {
  bell: { cost: 50, range: 118, dmg: 10, oct: 4, pat: [[0, 8], [0, 4, 8, 12], [0, 4, 8, 12]], mul: [1, 1, 1.6] },
  harp: { cost: 65, range: 185, dmg: 16, oct: 5, pat: [[4, 12], [2, 6, 10, 14], [2, 6, 10, 14]], mul: [1, 1, 1.6], chain: [0, 0, 1] },
  hum:  { cost: 55, range: 112, dmg: 6, oct: 2, pat: [[0], [0, 8], [0, 8]], mul: [1, 1, 1.5], slow: [0.35, 0.45, 0.55] },
  ward: { cost: 70, range: 104, dmg: 10, oct: 3, pat: [[0], [0], [0, 8]], mul: [1, 1.3, 1.6], every: [2, 1, 1], push: [26, 34, 44], shield: [1, 1.4, 1.8] },
  echo: { cost: 80, range: 0, dmg: 0, oct: 5, pat: [[0], [0, 8], [0, 8]], mul: [1, 1, 1], amp: [0.25, 0.38, 0.55] },
};
const UPG = [0.8, 1.3];      // upgrade cost = base cost × this (to level 2, to level 3)
const SELL = 0.7;            // refund share when selling

// shadow creatures. r = body radius, bdps = damage per second against shield arcs, threat = wave budget cost
const ENEMIES = {
  wisp:      { hp: 28, spd: 40, dmg: 1, gold: 5, threat: 1, r: 9, bdps: 7, gap: 4 },
  skitter:   { hp: 13, spd: 64, dmg: 1, gold: 2, threat: 0.6, r: 7, bdps: 4, gap: 2 },
  brute:     { hp: 150, spd: 23, dmg: 3, gold: 12, threat: 5, r: 15, bdps: 22, gap: 12, armor: 0.35 },
  splitter:  { hp: 85, spd: 32, dmg: 2, gold: 6, threat: 3.4, r: 13, bdps: 10, gap: 8, split: 3 },
  moth:      { hp: 36, spd: 44, dmg: 1, gold: 5, threat: 1.6, r: 10, gap: 4, fly: true },
  hush:      { hp: 80, spd: 30, dmg: 2, gold: 9, threat: 4, r: 12, bdps: 8, gap: 12, silence: 88 },
  mourner:   { hp: 95, spd: 28, dmg: 2, gold: 10, threat: 4.5, r: 12, bdps: 8, gap: 12, heal: 0.12 },
  maw:       { hp: 600, spd: 15, dmg: 10, gold: 120, r: 32, boss: 1, bdps: 999 },
  discord:   { hp: 950, spd: 17, dmg: 14, gold: 160, r: 30, boss: 2, bdps: 999 },
  leviathan: { hp: 1400, spd: 14, dmg: 18, gold: 240, r: 24, boss: 3, bdps: 999, shell: 0.35 },
};
const ENEMY_ORDER = ['wisp', 'skitter', 'brute', 'splitter', 'moth', 'hush', 'mourner'];
const BOSSES = ['maw', 'discord', 'leviathan'];

const RELICS = [
  { id: 'fork', ic: '🔔' }, { id: 'strings', ic: '🎻' }, { id: 'metronome', ic: '⏱️' }, { id: 'chamber', ic: '🐚' },
  { id: 'choir', ic: '🪨' }, { id: 'heart', ic: '💗' }, { id: 'magnet', ic: '🧲' }, { id: 'aegis', ic: '🛡️' },
  { id: 'velvet', ic: '🤫' }, { id: 'golden', ic: '🌀' }, { id: 'frost', ic: '❄️' }, { id: 'overtone', ic: '✨' },
  { id: 'coda', ic: '🎼' }, { id: 'savings', ic: '💰' }, { id: 'luthier', ic: '🔧' }, { id: 'spiresong', ic: '🗼' },
  { id: 'series', ic: '📐' }, { id: 'ears', ic: '👂' },
];
const RELIC_BY = Object.fromEntries(RELICS.map(r => [r.id, r]));

// acts: number of rift paths, tempo, bass progression (note indices per bar), boss, enemy types that may appear
const ACTS = [
  { paths: 2, bpm: 92, prog: [0, 0, 4, 3], boss: 'maw', pool: ['wisp', 'skitter', 'brute', 'splitter'] },
  { paths: 3, bpm: 100, prog: [4, 0, 3, 1], boss: 'discord', pool: ['wisp', 'skitter', 'brute', 'splitter', 'moth', 'hush'] },
  { paths: 4, bpm: 108, prog: [1, 4, 0, 3], boss: 'leviathan', pool: ['wisp', 'skitter', 'brute', 'splitter', 'moth', 'hush', 'mourner'] },
  { paths: 4, bpm: 112, prog: [0, 4, 1, 3], boss: null, pool: ['wisp', 'skitter', 'brute', 'splitter', 'moth', 'hush', 'mourner'] },  // endless
];
// the wave (global index, 1-based) on which each enemy type first shows up
const FIRST_WAVE = { wisp: 1, skitter: 2, brute: 3, splitter: 5, moth: 7, hush: 8, mourner: 13 };
const WAVES_PER_ACT = 6;
const START_SHARDS = 180, START_HP = 20;

// seeded random (state is a plain number so a run can be saved and resumed)
function makeRng(seed) {
  const r = { s: seed >>> 0 };
  r.next = () => { r.s = (r.s + 0x6D2B79F5) >>> 0; let t = r.s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.int = (n) => Math.floor(r.next() * n);
  r.pick = (arr) => arr[Math.floor(r.next() * arr.length)];
  r.range = (a, b) => a + (b - a) * r.next();
  return r;
}
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
