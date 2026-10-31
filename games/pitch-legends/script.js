/* ============================================================
   Pitch Legends — Football Card Arcade
   Vanilla ES6+. Modules:
     Data · Store · Challenges · Gacha · Upgrades · Lineup ·
     Game (canvas match engine, team AI, powers) · UI
   ============================================================ */
'use strict';

/* ---------------- Static data ---------------- */
const COLORS = ['blue', 'green', 'yellow', 'red'];
const POS = {
  blue:   { name: 'Goalkeeper', short: 'GK',  icon: '🧤', effect: 'Guards the goal. High SAVE. Slot levels boost the Save power.' },
  green:  { name: 'Attacker',   short: 'ATT', icon: '⚽', effect: 'Finisher. High POWER shots. Slot levels boost the Shot power.' },
  yellow: { name: 'Midfielder', short: 'MID', icon: '🎯', effect: 'Engine of the team. High SPEED & CONTROL, generates energy.' },
  red:    { name: 'Defender',   short: 'DEF', icon: '🛡️', effect: 'Wins the ball. High TACKLE. Slot levels boost the Block power.' },
  black:  { name: 'Legend',     short: 'ANY', icon: '🌟', effect: 'Plays anywhere. Strong in every stat.' },
};
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
const SPECIAL = {
  skip:    { label: '⚡', title: 'Dribbler',  tier: 7, bonus: { speed: 0.25 } },
  reverse: { label: '🎩', title: 'Playmaker', tier: 7, bonus: { control: 0.25 } },
  draw2:   { label: '💪', title: 'Enforcer',  tier: 7, bonus: { tackle: 0.25 } },
  wild:    { label: '★',  title: 'Legend',    tier: 8, bonus: { speed: 0.1, power: 0.1, control: 0.1, tackle: 0.1, save: 0.1 } },
  wild4:   { label: '👑', title: 'Superstar', tier: 9, bonus: { speed: 0.15, power: 0.15, control: 0.15, tackle: 0.15, save: 0.15 } },
};
const RARITY_SHARDS = { common: 1, rare: 3, epic: 6 };
const MAX_LEVEL = 5;
const MAX_ENERGY = 6;
const SLOT_ORDER = ['gk', 'def', 'mid', 'att', 'flex'];
const SLOT_DEF = {
  gk:   { title: 'Goalkeeper', color: 'blue',   icon: '🧤' },
  def:  { title: 'Defender',   color: 'red',    icon: '🛡️' },
  mid:  { title: 'Midfielder', color: 'yellow', icon: '🎯' },
  att:  { title: 'Attacker',   color: 'green',  icon: '⚽' },
  flex: { title: 'Free role',  color: 'black',  icon: '🌟' },
};

function makeDef(color, value) {
  const isNum = /^\d$/.test(value);
  const rarity = color === 'black' ? 'epic' : isNum ? 'common' : 'rare';
  const sp = SPECIAL[value];
  return {
    id: `${color}-${value}`, color, value, isNum, rarity,
    tier: isNum ? Number(value) : sp.tier,
    label: isNum ? value : sp.label,
    name: isNum ? `${POS[color].name} #${value}` : (color === 'black' ? sp.title : `${sp.title} ${POS[color].short}`),
    bonus: sp ? sp.bonus : {},
  };
}
const CATALOG = [];
COLORS.forEach(c => VALUES.forEach(v => CATALOG.push(makeDef(c, v))));
CATALOG.push(makeDef('black', 'wild'), makeDef('black', 'wild4'));
const CATALOG_BY_ID = Object.fromEntries(CATALOG.map(d => [d.id, d]));

const POWERS = {
  shot:  { name: 'Shot',  icon: '🥅', cost: 3, key: 'Q', cls: 'shot',  blurb: 'Your next shot becomes a cannon: much faster, harder to save, and it bursts through defenders. Boosted by your Attacker slot.' },
  save:  { name: 'Save',  icon: '🧤', cost: 3, key: 'E', cls: 'save',  blurb: 'Raises a shield across your goal for a few seconds — every shot is repelled — and clears stuns on your whole team. Boosted by your Goalkeeper slot.' },
  block: { name: 'Block', icon: '🛡️', cost: 2, key: 'R', cls: 'block', blurb: 'Nullifies the enemy: opponents near the ball are frozen, and any enemy power shot in flight dies instantly. Boosted by your Defender slot.' },
};
const AI_STYLES = {
  aggressive: { label: 'Aggressive', icon: '🔥', press: 1.4, shootRange: 1.25, pass: 0.7 },
  defensive:  { label: 'Defensive',  icon: '🧱', press: 0.8, shootRange: 0.85, pass: 1.3 },
  tactical:   { label: 'Tactical',   icon: '🧠', press: 1.0, shootRange: 1.0,  pass: 1.0 },
};
const AI_NAMES = ['FC Robotica', 'Dynamo Bytes', 'AI United', 'Real Circuit', 'Sporting Neural', 'Inter Logic'];

/* ---------------- Helpers ---------------- */
const rand = n => Math.floor(Math.random() * n);
const pick = arr => arr[rand(arr.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

/* ---------------- Persistence ---------------- */
const Store = {
  KEY: 'pitchLegends.save.v1',
  state: null,
  fresh() {
    const cards = {};
    COLORS.forEach(c => { for (let v = 0; v <= 4; v++) cards[`${c}-${v}`] = { count: 1, level: 1 }; });
    cards['green-skip'] = { count: 1, level: 1 };
    cards['black-wild'] = { count: 1, level: 1 };
    return {
      tokens: 150, shards: 0, cards,
      slots: { blue: 1, green: 1, yellow: 1, red: 1, black: 1 },
      powers: { shot: 1, save: 1, block: 1 },
      lineup: { gk: null, def: null, mid: null, att: null, flex: null },
      stats: { wins: 0, draws: 0, losses: 0, played: 0, pulls: 0, streak: 0, bestStreak: 0, goals: 0 },
      challenges: [], challengeSeed: 0,
    };
  },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      const base = this.fresh();
      this.state = raw ? deepMerge(base, JSON.parse(raw)) : base;
    } catch { this.state = this.fresh(); }
    Challenges.ensure();
    Lineup.validate();
    return this.state;
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.state)); } catch { /* storage unavailable */ } },
  reset() { this.state = this.fresh(); Challenges.ensure(); Lineup.validate(); this.save(); },
};
function deepMerge(base, extra) {
  const out = { ...base };
  for (const k of Object.keys(extra || {})) {
    const b = base[k], e = extra[k];
    if (e && typeof e === 'object' && !Array.isArray(e) && b && typeof b === 'object' && !Array.isArray(b) && k !== 'cards' && k !== 'lineup') out[k] = deepMerge(b, e);
    else out[k] = e;
  }
  return out;
}

/* ---------------- Challenges ---------------- */
const CHALLENGE_POOL = [
  { id: 'win1',    text: 'Win a match',                      ev: 'win',         target: 1,  reward: 40 },
  { id: 'goal5',   text: 'Score 5 goals',                    ev: 'goal',        target: 5,  reward: 35 },
  { id: 'shot3',   text: 'Use the Shot power 3 times',       ev: 'power:shot',  target: 3,  reward: 30 },
  { id: 'tackle8', text: 'Win 8 tackles',                    ev: 'tackle',      target: 8,  reward: 30 },
  { id: 'pull5',   text: 'Pull 5 cards from the Gacha',      ev: 'pull',        target: 5,  reward: 25 },
  { id: 'save5',   text: 'Make 5 goalkeeper saves',          ev: 'save',        target: 5,  reward: 35 },
  { id: 'pass15',  text: 'Complete 15 passes',               ev: 'pass',        target: 15, reward: 30 },
  { id: 'block3',  text: 'Use the Block power 3 times',      ev: 'power:block', target: 3,  reward: 30 },
  { id: 'savep3',  text: 'Use the Save power 3 times',       ev: 'power:save',  target: 3,  reward: 30 },
  { id: 'clean1',  text: 'Win with a clean sheet',           ev: 'cleanSheet',  target: 1,  reward: 60 },
  { id: 'win3',    text: 'Win 3 matches',                    ev: 'win',         target: 3,  reward: 90 },
  { id: 'goal15',  text: 'Score 15 goals',                   ev: 'goal',        target: 15, reward: 80 },
  { id: 'pgoal3',  text: 'Score 3 goals with a power Shot',  ev: 'powerGoal',   target: 3,  reward: 60 },
];
const Challenges = {
  def(id) { return CHALLENGE_POOL.find(d => d.id === id); },
  ensure() {
    const s = Store.state;
    let guard = 0;
    while (s.challenges.length < 3 && guard++ < 50) {
      const def = CHALLENGE_POOL[s.challengeSeed % CHALLENGE_POOL.length];
      s.challengeSeed++;
      if (!s.challenges.some(c => c.id === def.id)) s.challenges.push({ id: def.id, progress: 0, done: false });
    }
  },
  track(ev, amount = 1) {
    const s = Store.state;
    let changed = false;
    s.challenges.forEach(c => {
      const def = this.def(c.id);
      if (!def || def.ev !== ev || c.done) return;
      c.progress = Math.min(def.target, c.progress + amount);
      changed = true;
      if (c.progress >= def.target) { c.done = true; UI.toast(`🏆 Challenge complete: ${def.text}`, 'gold'); }
    });
    if (changed) Store.save();
  },
  claim(id) {
    const s = Store.state;
    const i = s.challenges.findIndex(c => c.id === id);
    if (i < 0 || !s.challenges[i].done) return;
    const def = this.def(id);
    s.challenges.splice(i, 1);
    s.tokens += def.reward;
    this.ensure();
    Store.save();
    UI.toast(`+${def.reward} 🪙 claimed!`, 'gold');
    UI.refreshHud(true);
    UI.render('challenges');
  },
};

/* ---------------- Gacha ---------------- */
const Gacha = {
  COST1: 10, COST10: 90,
  RATES: { epic: 0.06, rare: 0.24, common: 0.70 },
  roll() {
    const r = Math.random();
    const rarity = r < this.RATES.epic ? 'epic' : r < this.RATES.epic + this.RATES.rare ? 'rare' : 'common';
    return pick(CATALOG.filter(d => d.rarity === rarity));
  },
  pull(n) {
    const s = Store.state;
    const cost = n === 10 ? this.COST10 : this.COST1;
    if (s.tokens < cost) { UI.toast('Not enough tokens — win matches or claim challenges!', 'bad'); return null; }
    s.tokens -= cost;
    const results = [];
    for (let i = 0; i < n; i++) {
      const def = this.roll();
      const owned = s.cards[def.id];
      let isNew = false, shards = 0;
      if (owned) { owned.count++; shards = RARITY_SHARDS[def.rarity]; s.shards += shards; }
      else { s.cards[def.id] = { count: 1, level: 1 }; isNew = true; }
      results.push({ def, isNew, shards });
    }
    s.stats.pulls += n;
    Store.save();
    Challenges.track('pull', n);
    UI.refreshHud(true);
    return results;
  },
};

/* ---------------- Upgrades ---------------- */
const Upgrades = {
  cardCost: level => level * 2,
  slotCost: level => 40 * level,
  powerCost: level => ({ shards: 4 * level, tokens: 25 * level }),
  upgradeCard(id) {
    const s = Store.state, c = s.cards[id];
    if (!c || c.level >= MAX_LEVEL) return;
    const cost = this.cardCost(c.level);
    if (s.shards < cost) { UI.toast(`Need ${cost} 💎 shards`, 'bad'); return; }
    s.shards -= cost; c.level++;
    Store.save(); UI.refreshHud(true); UI.toast(`${CATALOG_BY_ID[id].name} → Lv ${c.level}`, 'gold'); UI.render('inventory');
  },
  upgradeSlot(color) {
    const s = Store.state, lv = s.slots[color];
    if (lv >= MAX_LEVEL) return;
    const cost = this.slotCost(lv);
    if (s.tokens < cost) { UI.toast(`Need ${cost} 🪙 tokens`, 'bad'); return; }
    s.tokens -= cost; s.slots[color]++;
    Store.save(); UI.refreshHud(true); UI.toast(`${POS[color].name} slot → Lv ${s.slots[color]}`, 'gold'); UI.render('inventory');
  },
  upgradePower(p) {
    const s = Store.state, lv = s.powers[p];
    if (lv >= MAX_LEVEL) return;
    const cost = this.powerCost(lv);
    if (s.tokens < cost.tokens || s.shards < cost.shards) { UI.toast(`Need ${cost.tokens} 🪙 and ${cost.shards} 💎`, 'bad'); return; }
    s.tokens -= cost.tokens; s.shards -= cost.shards; s.powers[p]++;
    Store.save(); UI.refreshHud(true); UI.toast(`${POWERS[p].name} → Lv ${s.powers[p]}`, 'gold'); UI.render('powers');
  },
};

/* Power formulas (shared by player & AI; AI uses its level for everything) */
const Formula = {
  shotSpeedMult: (lv, greenSlot) => 1.5 + 0.12 * lv + 0.05 * (greenSlot - 1),
  shotPierce:    lv => lv >= 3,
  saveDuration:  (lv, blueSlot) => 2.5 + 0.6 * lv + 0.3 * (blueSlot - 1),
  blockDuration: (lv, redSlot)  => 1.5 + 0.4 * lv + 0.25 * (redSlot - 1),
  blockRadius:   lv => 150 + 20 * lv,
};

/* ---------------- Player stats from cards ---------------- */
const Stats = {
  // Effective tier blends the card's number, the card level and the position slot level
  tier(def, level, slotLevel) { return def.tier + (level - 1) * 1.2 + (slotLevel - 1) * 1.2; },
  fromCard(def, level, slotLevel) {
    const t = this.tier(def, level, slotLevel);
    const st = { speed: 1 + t * 0.055, power: 1 + t * 0.06, control: 1 + t * 0.06, tackle: 1 + t * 0.06, save: 1 + t * 0.07 };
    const roleBoost = { green: { power: 0.3 }, red: { tackle: 0.3 }, blue: { save: 0.45 }, yellow: { speed: 0.12, control: 0.2 }, black: { speed: 0.08, power: 0.12, control: 0.12, tackle: 0.12, save: 0.12 } }[def.color];
    Object.entries(roleBoost).forEach(([k, v]) => st[k] += v);
    Object.entries(def.bonus).forEach(([k, v]) => st[k] += v);
    return st;
  },
  forOwned(id) {
    const s = Store.state, def = CATALOG_BY_ID[id], o = s.cards[id];
    return this.fromCard(def, o ? o.level : 1, s.slots[def.color]);
  },
  ai(level, color) {
    const t = 3 + level * 1.3 + Math.random() * 1.5;
    const def = { tier: t, color, bonus: {} };
    return this.fromCard(def, 1, 1);
  },
  label(st) { return { SPD: st.speed, POW: st.power, CTL: st.control, TKL: st.tackle, SAV: st.save }; },
  pct(v) { return Math.round((v - 1) * 100); },
};

/* ---------------- Lineup ---------------- */
const Lineup = {
  eligible(slot) {
    const col = SLOT_DEF[slot].color;
    return Object.keys(Store.state.cards).map(id => CATALOG_BY_ID[id]).filter(d => slot === 'flex' || d.color === col || d.color === 'black');
  },
  validate() {
    const s = Store.state, used = new Set();
    SLOT_ORDER.forEach(slot => {
      const id = s.lineup[slot];
      const ok = id && s.cards[id] && this.eligible(slot).some(d => d.id === id) && !used.has(id);
      if (!ok) s.lineup[slot] = this.autoPick(slot, used);
      if (s.lineup[slot]) used.add(s.lineup[slot]);
    });
  },
  autoPick(slot, used) {
    const list = this.eligible(slot).filter(d => !used.has(d.id));
    if (!list.length) return null;
    // Prefer same-color card over spending a Legend; highest effective tier wins
    const score = d => Stats.tier(d, Store.state.cards[d.id].level, Store.state.slots[d.color]) - (d.color === 'black' && slot !== 'flex' ? 20 : 0);
    list.sort((a, b) => score(b) - score(a));
    return list[0].id;
  },
  set(slot, id) {
    const s = Store.state;
    SLOT_ORDER.forEach(k => { if (k !== slot && s.lineup[k] === id) s.lineup[k] = null; });
    s.lineup[slot] = id;
    this.validate(); Store.save();
  },
  autoFill() { const s = Store.state; SLOT_ORDER.forEach(k => s.lineup[k] = null); this.validate(); Store.save(); },
};

/* ============================================================
   GAME — canvas match engine
   ============================================================ */
const FIELD = { w: 1000, h: 640, left: 40, right: 960, top: 40, bottom: 600, goalTop: 250, goalBottom: 390, goalDepth: 32, boxW: 150, boxH: 300 };
const MATCH_SECONDS = 90;     // real seconds; shown as 0–90'
const PLAYER_R = 14, BALL_R = 7;

class Athlete {
  constructor(team, slot, def, stats, name) {
    this.team = team; this.slot = slot; this.def = def; this.stats = stats; this.name = name;
    this.color = def ? def.color : SLOT_DEF[slot].color;
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.fx = 1; this.fy = 0;
    this.stun = 0; this.tackleCd = 0; this.kickCd = 0; this.frozen = 0; this.isUser = false;
    this.label = def ? (def.isNum ? def.value : def.label) : String(1 + SLOT_ORDER.indexOf(slot));
  }
  get speed() { return 150 * this.stats.speed * (this.frozen > 0 ? 0.15 : 1); }
  get isGK() { return this.slot === 'gk'; }
}

const Game = {
  running: false, over: false, paused: false, time: 0, score: { home: 0, away: 0 },
  ball: { x: 500, y: 320, vx: 0, vy: 0, owner: null, lastTouch: null, kicker: null, power: false, noPickup: 0 },
  home: [], away: [], all: [], controlled: null, keys: {}, pressed: {}, touch: null,
  energy: { home: 2, away: 2 }, regen: { home: 0, away: 0 },
  fx: { shield: { home: 0, away: 0 }, block: { home: 0, away: 0 }, powerShot: { home: false, away: false }, banner: null, bannerT: 0 },
  aiLevel: 1, aiStyle: 'tactical', aiName: '', aiPowerCd: 0, freeze: 0, log: [], events: [],
  stats: { goals: 0, saves: 0, tackles: 0, passes: 0, powerGoals: 0 },
  canvas: null, ctx: null, raf: 0, lastTs: 0, switchCd: 0, simulate: false, speed: 1,
  dir: { home: 1, away: -1 },                       // attacking direction (home attacks right)

  nextOpponent() {
    const s = Store.state;
    return { level: clamp(1 + Math.floor(s.stats.wins / 3), 1, MAX_LEVEL), style: pick(Object.keys(AI_STYLES)), name: pick(AI_NAMES) };
  },

  start(opts = {}) {
    this.stop();
    this.simulate = !!opts.simulate; this.speed = 1;
    const opp = this.nextOpponent();
    this.aiLevel = opp.level; this.aiStyle = opp.style; this.aiName = opp.name;
    const s = Store.state;
    Lineup.validate();
    this.home = SLOT_ORDER.map(slot => {
      const id = s.lineup[slot];
      const def = id ? CATALOG_BY_ID[id] : makeDef(SLOT_DEF[slot].color, '0');
      const st = id ? Stats.forOwned(id) : Stats.fromCard(def, 1, 1);
      return new Athlete('home', slot, def, st, def.name);
    });
    this.away = SLOT_ORDER.map(slot => new Athlete('away', slot, null, Stats.ai(this.aiLevel, SLOT_DEF[slot].color), `${SLOT_DEF[slot].title}`));
    this.all = [...this.home, ...this.away];
    this.score = { home: 0, away: 0 }; this.time = 0; this.over = false; this.paused = false;
    this.energy = { home: 2, away: 2 }; this.regen = { home: 0, away: 0 };
    this.fx = { shield: { home: 0, away: 0 }, block: { home: 0, away: 0 }, powerShot: { home: false, away: false }, banner: null, bannerT: 0 };
    this.stats = { goals: 0, saves: 0, tackles: 0, passes: 0, powerGoals: 0 };
    this.log = []; this.keys = {}; this.pressed = {}; this.aiPowerCd = 3; this.homePowerCd = 3;
    this.kickoff('home');
    this.say(`Kick-off! ${this.aiName} (${AI_STYLES[this.aiStyle].label}, Lv ${this.aiLevel}) — 90 seconds on the clock.${this.simulate ? ' SIMULATION: your team plays itself — you can still fire powers.' : ''}`);
    this.running = true;
    this.lastTs = performance.now();
    this.raf = requestAnimationFrame(ts => this.frame(ts));
  },
  stop() { this.running = false; cancelAnimationFrame(this.raf); },
  pause(v) { if (!this.running || this.over) return; this.paused = v; if (!v) this.lastTs = performance.now(); },
  say(msg) { this.log.unshift(msg); if (this.log.length > 6) this.log.pop(); UI.updateCommentary(); },
  banner(text) { this.fx.banner = text; this.fx.bannerT = 2.2; UI.banner(text); },

  homeSpot(a) {
    const d = this.dir[a.team], cx = FIELD.w / 2, cy = FIELD.h / 2;
    const base = { gk: [-440, 0], def: [-270, 0], mid: [-60, 0], att: [150, 0], flex: [60, 130] }[a.slot];
    return { x: cx + base[0] * d, y: cy + base[1] * (a.team === 'home' ? 1 : -1) };
  },
  kickoff(toTeam) {
    this.all.forEach(a => { const h = this.homeSpot(a); a.x = h.x; a.y = h.y; a.vx = a.vy = 0; a.stun = 0; a.frozen = 0; a.fx = this.dir[a.team]; a.fy = 0; });
    const b = this.ball; b.x = FIELD.w / 2; b.y = FIELD.h / 2; b.vx = b.vy = 0; b.owner = null; b.power = false; b.noPickup = 0; b.kicker = null;
    const taker = this[toTeam].find(a => a.slot === 'mid');
    taker.x = FIELD.w / 2 - 24 * this.dir[toTeam]; taker.y = FIELD.h / 2;
    this.freeze = 1.0;
    this.controlled = this.simulate ? null : this.home.find(a => a.slot === 'mid');
    this.home.forEach(a => a.isUser = a === this.controlled);
  },

  /* ---------- Frame loop ---------- */
  frame(ts) {
    if (!this.running) return;
    let dt = (ts - this.lastTs) / 1000; this.lastTs = ts;
    dt = Math.min(dt, 1 / 30) * this.speed;
    if (!this.paused && !this.over) this.update(dt);
    this.render();
    this.raf = requestAnimationFrame(t => this.frame(t));
  },
  update(dt) {
    this.time += dt;
    if (this.time >= MATCH_SECONDS) { this.end(); return; }
    if (this.fx.bannerT > 0) this.fx.bannerT -= dt;
    this.hudTimer = (this.hudTimer || 0) + dt;
    if (this.hudTimer > 0.25) { this.hudTimer = 0; UI.updateCommentary(); }
    ['home', 'away'].forEach(t => {
      this.regen[t] += dt; if (this.regen[t] >= 7) { this.regen[t] = 0; this.energy[t] = Math.min(MAX_ENERGY, this.energy[t] + 1); if (t === 'home') UI.updateHud(); }
      if (this.fx.shield[t] > 0) this.fx.shield[t] -= dt;
      if (this.fx.block[t] > 0) this.fx.block[t] -= dt;
    });
    if (this.switchCd > 0) this.switchCd -= dt;
    this.all.forEach(a => { a.stun = Math.max(0, a.stun - dt); a.tackleCd = Math.max(0, a.tackleCd - dt); a.kickCd = Math.max(0, a.kickCd - dt); a.frozen = Math.max(0, a.frozen - dt); });
    if (this.freeze > 0) { this.freeze -= dt; this.handleInputPowers(); return; }

    if (this.simulate) this.handleInputPowers(); else this.handleInput(dt);
    this.aiPowerCd -= dt; this.homePowerCd -= dt;
    this.all.forEach(a => { if (!a.isUser) this.aiMove(a, dt); });
    this.all.forEach(a => this.moveAthlete(a, dt));
    this.updateBall(dt);
    this.resolvePossession(dt);
    this.checkGoal();
    this.aiPowers('away');
    if (this.simulate) this.aiPowers('home');
    this.pressed = {};
  },

  /* ---------- Input ---------- */
  handleInputPowers() {
    if (this.pressed['q']) this.usePower('home', 'shot');
    if (this.pressed['e']) this.usePower('home', 'save');
    if (this.pressed['r']) this.usePower('home', 'block');
    this.pressed = {};
  },
  handleInput(dt) {
    const k = this.keys, me = this.controlled, b = this.ball;
    let ix = 0, iy = 0;
    if (k['arrowleft'] || k['a']) ix -= 1;
    if (k['arrowright'] || k['d']) ix += 1;
    if (k['arrowup'] || k['w']) iy -= 1;
    if (k['arrowdown'] || k['s']) iy += 1;
    if (this.touch) { ix = this.touch.x; iy = this.touch.y; }
    const len = Math.hypot(ix, iy);
    if (len > 0.1) { ix /= Math.max(1, len); iy /= Math.max(1, len); }
    if (me.stun > 0) { ix = iy = 0; }
    me.vx = ix * me.speed * (b.owner === me ? 0.88 : 1);
    me.vy = iy * me.speed * (b.owner === me ? 0.88 : 1);
    if (len > 0.1) { me.fx = ix / len; me.fy = iy / len; }

    // Auto-switch to the teammate closest to a loose/opponent ball (unless I'm already close)
    if (b.owner !== me && this.switchCd <= 0 && (!b.owner || b.owner.team === 'away')) {
      const best = this.nearestTo(this.home.filter(a => !a.isGK), b);
      if (best && best !== me && dist(best, b) < dist(me, b) - 70) this.switchTo(best);
    }
    if (this.pressed['c']) { const best = this.nearestTo(this.home.filter(a => a !== me), b); if (best) this.switchTo(best); }
    if (this.pressed[' '] || this.pressed['pass']) { if (b.owner === me) this.pass(me); else this.tackleAttempt(me, true); }
    if (this.pressed['x'] || this.pressed['shift'] || this.pressed['shoot']) { if (b.owner === me) this.shoot(me, iy); else this.tackleAttempt(me, true); }
    this.handleInputPowers();
  },
  switchTo(a) { this.home.forEach(p => p.isUser = false); a.isUser = true; this.controlled = a; this.switchCd = 0.6; },
  nearestTo(list, pt) { let best = null, bd = Infinity; list.forEach(a => { const d = dist(a, pt); if (d < bd) { bd = d; best = a; } }); return best; },

  /* ---------- Movement ---------- */
  moveAthlete(a, dt) {
    if (a.stun > 0) { a.vx *= 0.8; a.vy *= 0.8; }
    a.x += a.vx * dt; a.y += a.vy * dt;
    const minX = a.isGK ? FIELD.left - 6 : FIELD.left + 4;
    a.x = clamp(a.x, minX, FIELD.right + 6 - (a.isGK ? 0 : 10));
    a.y = clamp(a.y, FIELD.top + 4, FIELD.bottom - 4);
    // simple separation so players don't stack
    this.all.forEach(o => { if (o === a) return; const d = dist(a, o); if (d < PLAYER_R * 2 && d > 0.01) { const push = (PLAYER_R * 2 - d) / 2; a.x += (a.x - o.x) / d * push; a.y += (a.y - o.y) / d * push; } });
  },
  updateBall(dt) {
    const b = this.ball;
    if (b.noPickup > 0) b.noPickup -= dt;
    if (b.owner) {
      const o = b.owner; b.x = o.x + o.fx * 20; b.y = o.y + o.fy * 20; b.vx = b.vy = 0; b.power = false;
      return;
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
    const f = Math.pow(b.power ? 0.6 : 0.45, dt); b.vx *= f; b.vy *= f;
    if (b.y < FIELD.top + BALL_R) { b.y = FIELD.top + BALL_R; b.vy = -b.vy * 0.7; }
    if (b.y > FIELD.bottom - BALL_R) { b.y = FIELD.bottom - BALL_R; b.vy = -b.vy * 0.7; }
    const inGoalMouth = b.y > FIELD.goalTop && b.y < FIELD.goalBottom;
    if (!inGoalMouth) {
      if (b.x < FIELD.left + BALL_R) { b.x = FIELD.left + BALL_R; b.vx = -b.vx * 0.7; }
      if (b.x > FIELD.right - BALL_R) { b.x = FIELD.right - BALL_R; b.vx = -b.vx * 0.7; }
    } else {
      // Goal shield (Save power) repels shots on the line
      if (b.x < FIELD.left + 4 && this.fx.shield.home > 0 && b.vx < 0) { b.vx = Math.abs(b.vx) * 0.9 + 120; b.power = false; this.say('🧤 The Save shield repels the shot!'); this.stats.saves++; Challenges.track('save'); }
      if (b.x > FIELD.right - 4 && this.fx.shield.away > 0 && b.vx > 0) { b.vx = -Math.abs(b.vx) * 0.9 - 120; b.power = false; this.say(`🧤 ${this.aiName}'s Save shield repels it!`); }
    }
  },
  checkGoal() {
    const b = this.ball;
    if (b.owner) return;
    if (b.y <= FIELD.goalTop || b.y >= FIELD.goalBottom) return;
    if (b.x < FIELD.left - 10) this.goal('away');
    else if (b.x > FIELD.right + 10) this.goal('home');
  },
  goal(team) {
    this.score[team]++;
    const b = this.ball;
    if (team === 'home') {
      const s = Store.state; s.stats.goals++; this.stats.goals++;
      Challenges.track('goal');
      if (b.power) { this.stats.powerGoals++; Challenges.track('powerGoal'); }
      const scorer = b.kicker && b.kicker.team === 'home' ? b.kicker.name : 'You';
      this.say(`⚽ GOOOAL! ${scorer} scores${b.power ? ' with a POWER SHOT' : ''}! ${this.score.home}–${this.score.away}`);
      this.banner('⚽ GOAL!');
    } else {
      this.say(`😬 ${this.aiName} scores. ${this.score.home}–${this.score.away}`);
      this.banner(`${this.aiName} scores`);
    }
    UI.updateScore();
    this.kickoff(team === 'home' ? 'away' : 'home');
  },

  /* ---------- Ball actions ---------- */
  resolvePossession(dt) {
    const b = this.ball;
    if (!b.owner) {
      if (b.noPickup > 0) return;
      const speed = Math.hypot(b.vx, b.vy);
      let candidate = null, cd = Infinity;
      this.all.forEach(a => {
        if (a.stun > 0 || a === b.kicker && a.kickCd > 0) return;
        const reach = a.isGK ? 26 : 20;
        const d = dist(a, b);
        if (d < reach && d < cd) { cd = d; candidate = a; }
      });
      if (!candidate) return;
      // Fast balls can be fumbled; goalkeepers use SAVE, outfielders CONTROL
      const skill = candidate.isGK ? candidate.stats.save : candidate.stats.control;
      const catchChance = speed < 180 ? 1 : clamp(skill * 0.9 - (speed - 180) / 700 + (b.power ? -0.25 : 0), 0.08, 1);
      if (Math.random() < catchChance) {
        const wasShot = b.kicker && b.kicker.team !== candidate.team && speed > 250;
        if (candidate.isGK && wasShot) {
          if (candidate.team === 'home') { this.stats.saves++; Challenges.track('save'); this.say(`🧤 ${candidate.name} makes the save!`); }
          else this.say(`🧤 ${this.aiName}'s keeper saves it.`);
        } else if (b.kicker && b.kicker.team === candidate.team && b.kicker !== candidate && b.passTarget) {
          if (candidate.team === 'home') { this.stats.passes++; Challenges.track('pass'); this.energy.home = Math.min(MAX_ENERGY, this.energy.home + 1); UI.updateHud(); }
        }
        this.take(candidate);
      } else {
        // fumble: deflect
        b.vx *= 0.35; b.vy = (Math.random() - 0.5) * 160; b.noPickup = 0.15;
        if (candidate.isGK && candidate.team === 'home') this.say(`${candidate.name} can't hold it!`);
      }
      return;
    }
    // Tackles on the ball carrier
    const owner = b.owner;
    this.all.forEach(a => {
      if (a.team === owner.team || a.stun > 0 || a.tackleCd > 0) return;
      if (dist(a, owner) < 30) this.tackleAttempt(a, false);
    });
  },
  take(a) {
    const b = this.ball; b.owner = a; b.kicker = null; b.power = false; b.passTarget = null;
    if (a.team === 'home' && !a.isUser && !this.simulate) this.switchTo(a);
  },
  tackleAttempt(a, manual) {
    const b = this.ball, owner = b.owner;
    if (!owner || owner.team === a.team) return;
    if (dist(a, owner) > (manual ? 40 : 30) || a.tackleCd > 0 || a.stun > 0) return;
    a.tackleCd = 0.7;
    const chance = clamp(0.5 * a.stats.tackle / owner.stats.control + (manual ? 0.1 : 0), 0.15, 0.85);
    if (Math.random() < chance) {
      owner.stun = 0.7; b.owner = null; b.noPickup = 0.05;
      b.vx = (a.x - owner.x) * 3; b.vy = (a.y - owner.y) * 3;
      this.take(a);
      if (a.team === 'home') { this.stats.tackles++; Challenges.track('tackle'); this.energy.home = Math.min(MAX_ENERGY, this.energy.home + 1); UI.updateHud(); this.say(`🛡️ ${a.name} wins the ball!`); }
      else this.say(`${this.aiName} wins it back.`);
    } else {
      a.stun = 0.5;
    }
  },
  kick(a, tx, ty, speed, opts = {}) {
    const b = this.ball; b.owner = null;
    const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1;
    b.vx = dx / d * speed; b.vy = dy / d * speed;
    b.kicker = a; a.kickCd = 0.35; b.noPickup = 0.08; b.power = !!opts.power; b.passTarget = opts.target || null;
  },
  pass(a) {
    const mates = this[a.team].filter(m => m !== a);
    let best = null, bs = -Infinity;
    mates.forEach(m => {
      const dx = m.x - a.x, dy = m.y - a.y, d = Math.hypot(dx, dy) || 1;
      const facing = (dx / d) * a.fx + (dy / d) * a.fy;
      const forward = (dx * this.dir[a.team]) / d;
      let score = facing * 2 + forward * 0.8 - d / 500;
      if (m.isGK) score -= 1.5;
      if (score > bs) { bs = score; best = m; }
    });
    if (!best) return;
    const d = dist(a, best);
    const speed = clamp(260 + d * 1.6, 280, 620) * (0.85 + a.stats.control * 0.15);
    const lead = { x: best.x + best.vx * 0.3, y: best.y + best.vy * 0.3 };
    this.kick(a, lead.x, lead.y, speed, { target: best });
    if (a.team === 'home') this.say(`${a.name} passes to ${best.name}.`);
  },
  shoot(a, aim = 0) {
    const d = this.dir[a.team];
    const gx = d > 0 ? FIELD.right + 20 : FIELD.left - 20;
    const gy = FIELD.h / 2 + clamp(aim, -1, 1) * 55 + (Math.random() - 0.5) * 30 / a.stats.power;
    const power = this.fx.powerShot[a.team];
    let speed = 520 * a.stats.power;
    if (power) { speed *= Formula.shotSpeedMult(a.team === 'home' ? Store.state.powers.shot : this.aiLevel, a.team === 'home' ? Store.state.slots.green : this.aiLevel); this.fx.powerShot[a.team] = false; UI.updateHud(); }
    this.kick(a, gx, gy, speed, { power });
    if (a.team === 'home') this.say(power ? `💥 ${a.name} unleashes a POWER SHOT!` : `${a.name} shoots!`);
    else this.say(power ? `💥 ${this.aiName} fires a power shot!` : `${this.aiName} shoots…`);
  },

  /* ---------- Powers ---------- */
  usePower(team, name) {
    if (this.over) return;
    const def = POWERS[name];
    const lv = team === 'home' ? Store.state.powers[name] : this.aiLevel;
    const slot = c => (team === 'home' ? Store.state.slots[c] : this.aiLevel);
    if (this.energy[team] < def.cost) { if (team === 'home') UI.toast(`Need ${def.cost} ⚡ energy`, 'bad'); return false; }
    if (name === 'shot' && this.fx.powerShot[team]) { if (team === 'home') UI.toast('Power shot already charged — shoot!', 'bad'); return false; }
    if (name === 'save' && this.fx.shield[team] > 0) return false;
    if (name === 'block' && this.fx.block[team] > 0) return false;
    this.energy[team] -= def.cost;
    const who = team === 'home' ? 'You' : this.aiName;
    if (name === 'shot') { this.fx.powerShot[team] = true; this.say(`🥅 ${who} charge${team === 'home' ? '' : 's'} a POWER SHOT — next shot is a cannon.`); }
    if (name === 'save') { this.fx.shield[team] = Formula.saveDuration(lv, slot('blue')); this[team].forEach(a => a.stun = 0); this.say(`🧤 ${who} raise${team === 'home' ? '' : 's'} a goal shield for ${this.fx.shield[team].toFixed(1)}s!`); }
    if (name === 'block') {
      this.fx.block[team] = Formula.blockDuration(lv, slot('red'));
      const r = Formula.blockRadius(lv), b = this.ball, enemy = team === 'home' ? this.away : this.home;
      let frozen = 0;
      enemy.forEach(a => { if (dist(a, b) < r) { a.frozen = this.fx.block[team]; frozen++; } });
      if (!b.owner && b.power && b.kicker && b.kicker.team !== team) { b.vx *= 0.2; b.vy *= 0.2; b.power = false; this.say('🛡️ BLOCK kills the power shot in flight!'); }
      this.say(`🛡️ ${who} BLOCK — ${frozen} opponent${frozen === 1 ? '' : 's'} frozen near the ball.`);
    }
    if (team === 'home') { Challenges.track(`power:${name}`); UI.updateHud(); this.banner(`${def.icon} ${def.name}!`); }
    else this.banner(`${this.aiName}: ${def.name}`);
    return true;
  },
  aiPowers(team) {
    if (team === 'away' && (this.aiPowerCd > 0 || this.aiLevel < 2 && Math.random() < 0.5)) return;
    if (team === 'home' && this.homePowerCd > 0) return;
    if (team === 'away') this.aiPowerCd = 1.5; else this.homePowerCd = 1.5;
    const b = this.ball, e = this.energy[team], enemy = team === 'home' ? 'away' : 'home';
    const d = this.dir[team];
    const ownGoalX = d > 0 ? FIELD.left : FIELD.right, theirGoalX = d > 0 ? FIELD.right : FIELD.left;
    const ownerMine = b.owner && b.owner.team === team;
    const ownerTheirs = b.owner && b.owner.team === enemy;
    if (ownerMine && e >= 3 && Math.abs(theirGoalX - b.owner.x) < 330 && Math.random() < 0.5) this.usePower(team, 'shot');
    else if (e >= 3 && this.fx.shield[team] <= 0 && ((ownerTheirs && Math.abs(ownGoalX - b.owner.x) < 260) || (this.fx.powerShot[enemy] && Math.abs(ownGoalX - b.x) < FIELD.w / 2)) && Math.random() < 0.6) this.usePower(team, 'save');
    else if (e >= 2 && this.fx.block[team] <= 0 && ownerTheirs && Math.abs(ownGoalX - b.owner.x) < 320 && Math.random() < 0.5) this.usePower(team, 'block');
  },
  setSpeed(v) { this.speed = v; UI.updateHud(); },

  /* ---------- Team AI ---------- */
  aiMove(a, dt) {
    const b = this.ball, team = a.team, d = this.dir[team], style = team === 'away' ? AI_STYLES[this.aiStyle] : AI_STYLES.tactical;
    const mates = this[team], enemies = team === 'home' ? this.away : this.home;
    const home = this.homeSpot(a);
    let target;
    if (b.owner === a) { this.aiWithBall(a, style); return; }
    const ownerIsMate = b.owner && b.owner.team === team;
    const nearestMate = this.nearestTo(mates.filter(m => !m.isGK), b);
    if (a.isGK) {
      const ownGoalX = d > 0 ? FIELD.left + 22 : FIELD.right - 22;
      const inBox = Math.abs(b.x - (d > 0 ? FIELD.left : FIELD.right)) < FIELD.boxW && b.y > FIELD.goalTop - 40 && b.y < FIELD.goalBottom + 40;
      if (!b.owner && inBox && dist(a, b) < 120) target = { x: b.x, y: b.y };
      else target = { x: ownGoalX, y: clamp(b.y, FIELD.goalTop + 20, FIELD.goalBottom - 20) };
    } else if (!b.owner) {
      // loose ball: closest outfielder chases, others shape up
      target = a === nearestMate ? { x: b.x + b.vx * 0.2, y: b.y + b.vy * 0.2 } : this.shapeSpot(a, home, b, ownerIsMate);
    } else if (ownerIsMate) {
      target = this.shapeSpot(a, home, b, true);
    } else {
      // opponent has it: nearest presses, next-nearest covers, others hold shape
      const pressers = mates.filter(m => !m.isGK).sort((p, q) => dist(p, b) - dist(q, b));
      const rank = pressers.indexOf(a);
      if (rank === 0 || (rank === 1 && style.press > 1)) target = { x: b.owner.x, y: b.owner.y };
      else if (rank === 1) target = { x: b.owner.x - 70 * d, y: b.owner.y + (a.y > b.owner.y ? 40 : -40) };
      else target = this.shapeSpot(a, home, b, false);
    }
    this.steer(a, target, team === 'away' ? 0.97 : 0.9);
    if (b.owner && b.owner.team !== team && dist(a, b.owner) < 30 && a.tackleCd <= 0) this.tackleAttempt(a, false);
  },
  shapeSpot(a, home, b, attacking) {
    const d = this.dir[a.team];
    const push = attacking ? 90 : -60;
    return { x: clamp(home.x + (b.x - FIELD.w / 2) * 0.35 + push * d, FIELD.left + 30, FIELD.right - 30), y: clamp(home.y + (b.y - FIELD.h / 2) * 0.45, FIELD.top + 30, FIELD.bottom - 30) };
  },
  steer(a, target, mult) {
    const dx = target.x - a.x, dy = target.y - a.y, dd = Math.hypot(dx, dy);
    if (dd < 4) { a.vx = a.vy = 0; return; }
    const sp = a.speed * mult;
    a.vx = dx / dd * sp; a.vy = dy / dd * sp;
    a.fx = dx / dd; a.fy = dy / dd;
  },
  aiWithBall(a, style) {
    const b = this.ball, d = this.dir[a.team], team = a.team;
    const goalX = d > 0 ? FIELD.right : FIELD.left, goalY = FIELD.h / 2;
    const enemies = team === 'home' ? this.away : this.home;
    const distGoal = Math.abs(goalX - a.x);
    if (a.isGK) { if (Math.random() < 0.15) this.pass(a); else this.steer(a, { x: a.x, y: FIELD.h / 2 }, 0.3); return; }
    const nearestEnemy = this.nearestTo(enemies, a);
    const pressure = nearestEnemy ? dist(nearestEnemy, a) : 999;
    const shootRange = 230 * style.shootRange;
    if (distGoal < shootRange && Math.abs(a.y - goalY) < 170 && Math.random() < 0.08 + a.stats.power * 0.03) {
      const aim = a.y < goalY ? 0.6 : -0.6; // aim across the keeper
      this.shoot(a, (Math.random() < 0.6 ? aim : -aim) * Math.random());
      return;
    }
    if (pressure < 55 && Math.random() < 0.06 * style.pass) {
      const mates = this[team].filter(m => m !== a && !m.isGK);
      const open = mates.filter(m => { const e = this.nearestTo(enemies, m); return !e || dist(e, m) > 55; });
      if (open.length) { this.pass(a); return; }
    }
    // Dribble toward goal, swerving around the nearest enemy
    let tx = goalX - 30 * d, ty = goalY + (a.y - goalY) * 0.3;
    if (nearestEnemy && pressure < 90) {
      const away = a.y - nearestEnemy.y;
      ty = a.y + (away >= 0 ? 90 : -90);
    }
    this.steer(a, { x: tx, y: clamp(ty, FIELD.top + 30, FIELD.bottom - 30) }, 0.92);
  },

  /* ---------- End of match ---------- */
  end() {
    this.over = true; this.running = false; cancelAnimationFrame(this.raf);
    const s = Store.state, h = this.score.home, aw = this.score.away;
    const won = h > aw, drew = h === aw;
    s.stats.played++;
    const lines = []; let tokens = 0;
    if (won) {
      s.stats.wins++; s.stats.streak++; s.stats.bestStreak = Math.max(s.stats.bestStreak, s.stats.streak);
      tokens = 40 + this.aiLevel * 10; lines.push(`Victory: +${tokens} 🪙`);
      if (aw === 0) { tokens += 20; lines.push('Clean sheet: +20 🪙'); Challenges.track('cleanSheet'); }
      if (s.stats.streak > 1) { const b = Math.min(30, s.stats.streak * 5); tokens += b; lines.push(`Win streak ×${s.stats.streak}: +${b} 🪙`); }
      Challenges.track('win');
    } else if (drew) { s.stats.draws++; s.stats.streak = 0; tokens = 20; lines.push('Draw: +20 🪙'); }
    else { s.stats.losses++; s.stats.streak = 0; tokens = 10; lines.push('Consolation: +10 🪙'); }
    if (h) { tokens += h * 5; lines.push(`${h} goal${h > 1 ? 's' : ''}: +${h * 5} 🪙`); }
    s.tokens += tokens;
    Store.save(); UI.refreshHud(true);
    this.say(`Full time: ${h}–${aw}.`);
    this.render();
    UI.resultModal(won, drew, lines, this.score, this.stats, this.aiName);
  },

  /* ---------- Rendering ---------- */
  render() {
    const c = this.canvas, ctx = this.ctx; if (!c || !ctx) return;
    const F = FIELD;
    ctx.clearRect(0, 0, F.w, F.h);
    // grass
    ctx.fillStyle = '#1f7a3f'; ctx.fillRect(0, 0, F.w, F.h);
    for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#237f43' : '#1c7239'; ctx.fillRect(F.left + i * (F.right - F.left) / 10, F.top, (F.right - F.left) / 10, F.bottom - F.top); }
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
    ctx.strokeRect(F.left, F.top, F.right - F.left, F.bottom - F.top);
    ctx.beginPath(); ctx.moveTo(F.w / 2, F.top); ctx.lineTo(F.w / 2, F.bottom); ctx.stroke();
    ctx.beginPath(); ctx.arc(F.w / 2, F.h / 2, 70, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(F.left, F.h / 2 - F.boxH / 2, F.boxW, F.boxH);
    ctx.strokeRect(F.right - F.boxW, F.h / 2 - F.boxH / 2, F.boxW, F.boxH);
    ctx.strokeRect(F.left, F.h / 2 - 90, 60, 180); ctx.strokeRect(F.right - 60, F.h / 2 - 90, 60, 180);
    // goals
    const drawGoal = (x, shield, side) => {
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x, F.goalTop, F.goalDepth * side, F.goalBottom - F.goalTop);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x, F.goalTop, F.goalDepth * side, F.goalBottom - F.goalTop);
      if (shield > 0) { ctx.fillStyle = `rgba(80,160,255,${0.35 + 0.2 * Math.sin(performance.now() / 120)})`; ctx.fillRect(x - 10 * side, F.goalTop - 10, 22 * side, F.goalBottom - F.goalTop + 20); }
    };
    drawGoal(F.left, this.fx.shield.home, -1); drawGoal(F.right, this.fx.shield.away, 1);
    // block aura
    ['home', 'away'].forEach(t => { if (this.fx.block[t] > 0) { ctx.beginPath(); ctx.arc(this.ball.x, this.ball.y, Formula.blockRadius(t === 'home' ? Store.state.powers.block : this.aiLevel), 0, Math.PI * 2); ctx.strokeStyle = t === 'home' ? 'rgba(255,90,90,0.8)' : 'rgba(255,200,60,0.8)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); } });
    // players
    const colorOf = { blue: '#2f6fed', green: '#22a85a', yellow: '#e9b926', red: '#e03b3b', black: '#2a3140' };
    this.all.forEach(a => {
      ctx.beginPath(); ctx.ellipse(a.x, a.y + 10, 13, 6, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
      if (a.isUser) { ctx.beginPath(); ctx.arc(a.x, a.y, PLAYER_R + 7, 0, Math.PI * 2); ctx.strokeStyle = '#f5c542'; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.beginPath(); ctx.arc(a.x, a.y, PLAYER_R, 0, Math.PI * 2);
      ctx.fillStyle = colorOf[a.color]; if (a.frozen > 0) ctx.fillStyle = '#8fb8ff'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = a.team === 'home' ? '#ffffff' : '#111'; ctx.stroke();
      if (a.stun > 0) { ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✦', a.x, a.y - 20); }
      ctx.fillStyle = a.color === 'yellow' ? '#1a1200' : '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(a.label, a.x, a.y + 1);
      // facing tick
      ctx.beginPath(); ctx.moveTo(a.x + a.fx * PLAYER_R, a.y + a.fy * PLAYER_R); ctx.lineTo(a.x + a.fx * (PLAYER_R + 6), a.y + a.fy * (PLAYER_R + 6)); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    });
    // power shot charge indicator
    ['home', 'away'].forEach(t => { if (this.fx.powerShot[t]) { const list = this[t]; list.forEach(a => { if (this.ball.owner === a) { ctx.beginPath(); ctx.arc(a.x, a.y, PLAYER_R + 12, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,120,40,0.9)'; ctx.lineWidth = 3; ctx.stroke(); } }); } });
    // ball
    const b = this.ball;
    ctx.beginPath(); ctx.ellipse(b.x, b.y + 6, 7, 3, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    if (b.power) { ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R + 6, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,120,40,0.45)'; ctx.fill(); }
    ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5; ctx.stroke();
    // clock & score overlay
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(F.w / 2 - 90, 4, 180, 30);
    ctx.fillStyle = '#f5c542'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`YOU ${this.score.home} – ${this.score.away} ${this.aiName.split(' ')[0].toUpperCase()}   ${Math.min(90, Math.floor(this.time))}'`, F.w / 2, 19);
    if (this.paused) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, F.w, F.h); ctx.fillStyle = '#fff'; ctx.font = 'bold 40px sans-serif'; ctx.fillText('PAUSED', F.w / 2, F.h / 2); }
  },

  /* ---------- Canvas binding & input ---------- */
  bind(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    canvas.width = FIELD.w; canvas.height = FIELD.h;
    // touch joystick on the pitch
    let origin = null;
    canvas.addEventListener('touchstart', e => { const t = e.touches[0]; origin = { x: t.clientX, y: t.clientY }; this.touch = { x: 0, y: 0 }; e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove', e => { if (!origin) return; const t = e.touches[0]; const dx = t.clientX - origin.x, dy = t.clientY - origin.y; const len = Math.hypot(dx, dy) || 1; const m = Math.min(1, len / 40); this.touch = { x: dx / len * m, y: dy / len * m }; e.preventDefault(); }, { passive: false });
    const endT = () => { origin = null; this.touch = null; };
    canvas.addEventListener('touchend', endT); canvas.addEventListener('touchcancel', endT);
  },
  keyDown(e) {
    if (!this.running) return;
    const k = e.key.toLowerCase();
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'shift', 'x', 'q', 'e', 'r', 'c', 'p', 'w', 'a', 's', 'd'].includes(k)) e.preventDefault();
    if (!this.keys[k]) this.pressed[k] = true;
    this.keys[k] = true;
    if (k === 'p') this.pause(!this.paused);
    if (k === '1') this.setSpeed(1);
    if (k === '2') this.setSpeed(2);
  },
  keyUp(e) { this.keys[e.key.toLowerCase()] = false; },
  virtual(action) { this.pressed[action] = true; },
};

/* ============================================================
   UI
   ============================================================ */
const UI = {
  screen: 'home',
  init() {
    document.getElementById('nav').addEventListener('click', e => { const b = e.target.closest('.nav-btn'); if (b) this.show(b.dataset.screen); });
    document.getElementById('app').addEventListener('click', e => { const el = e.target.closest('[data-action]'); if (el) this.handleAction(el); });
    document.getElementById('modal-root').addEventListener('click', e => { const el = e.target.closest('[data-action]'); if (el) this.handleAction(el); });
    window.addEventListener('keydown', e => Game.keyDown(e));
    window.addEventListener('keyup', e => Game.keyUp(e));
    window.addEventListener('blur', () => Game.pause(true));
    this.refreshHud();
    this.show('home');
  },
  show(name) {
    if (name !== 'arena' && Game.running) Game.pause(true);
    this.screen = name;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === `screen-${name}`));
    this.render(name);
  },
  render(name) {
    const map = { home: this.renderHome, arena: this.renderArena, lineup: this.renderLineup, gacha: this.renderGacha, inventory: this.renderInventory, powers: this.renderPowers, challenges: this.renderChallenges };
    if (map[name]) map[name].call(this);
  },
  refreshHud(bump = false) {
    const s = Store.state;
    const t = document.querySelector('#hud-tokens b'), sh = document.querySelector('#hud-shards b');
    t.textContent = s.tokens; sh.textContent = s.shards;
    if (bump) [t, sh].forEach(el => { el.parentElement.classList.remove('bump'); void el.offsetWidth; el.parentElement.classList.add('bump'); });
  },
  toast(msg, cls = '') {
    const el = document.createElement('div'); el.className = `toast ${cls}`; el.textContent = msg;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => el.remove(), 2900);
  },
  modal(html, wide = false) { const r = document.getElementById('modal-root'); r.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" data-m3pop>${html}</div>`; r.classList.remove('hidden'); },
  closeModal() { const r = document.getElementById('modal-root'); r.classList.add('hidden'); r.innerHTML = ''; },

  cardHtml(card, cls = '', attrs = '') {
    const p = POS[card.color];
    return `<div class="card c-${card.color} ${cls}" ${attrs} title="${esc(card.name)}">
      <span class="card-corner">${card.label}</span>
      <div class="card-center">${card.label}</div>
      <span class="card-pos">${p.icon} ${p.short}</span>
      <span class="card-corner br">${card.label}</span>
    </div>`;
  },
  stars(lv) { return `<span class="stars">${'★'.repeat(lv)}<span class="off">${'★'.repeat(MAX_LEVEL - lv)}</span></span>`; },
  statline(st) { return `<div class="statline">${Object.entries(Stats.label(st)).map(([k, v]) => `<span>${k} <b>${Stats.pct(v)}</b></span>`).join('')}</div>`; },

  handleAction(el) {
    const a = el.dataset.action, v = el.dataset.value;
    switch (a) {
      case 'go': this.closeModal(); this.show(v); break;
      case 'start-match': this.closeModal(); this.show('arena'); this.startMatch(v === 'sim'); break;
      case 'speed': Game.setSpeed(Number(v)); break;
      case 'resume': Game.pause(false); break;
      case 'power': Game.usePower('home', v); break;
      case 'virtual': Game.virtual(v); break;
      case 'close-modal': this.closeModal(); break;
      case 'pull': this.doPull(Number(v)); break;
      case 'filter': this.invFilter = v; this.renderInventory(); break;
      case 'upgrade-card': Upgrades.upgradeCard(v); break;
      case 'upgrade-slot': Upgrades.upgradeSlot(v); break;
      case 'upgrade-power': Upgrades.upgradePower(v); break;
      case 'claim': Challenges.claim(v); break;
      case 'pick-slot': this.slotPicker(v); break;
      case 'choose-card': Lineup.set(el.dataset.slot, v); this.closeModal(); this.renderLineup(); this.toast('Lineup updated', 'gold'); break;
      case 'auto-lineup': Lineup.autoFill(); this.renderLineup(); this.toast('Best XI picked automatically', 'gold'); break;
      case 'forfeit': if (Game.running) { Game.score.away = Math.max(Game.score.away, Game.score.home + 1); Game.end(); } break;
      case 'reset-save': if (confirm('Reset all progress? This cannot be undone.')) { Store.reset(); this.refreshHud(true); this.show('home'); this.toast('Save reset'); } break;
    }
  },

  /* ================= HOME ================= */
  renderHome() {
    const s = Store.state, opp = Game.nextOpponent();
    const owned = Object.keys(s.cards).length;
    document.getElementById('screen-home').innerHTML = `
      <div class="grid grid-2">
        <div class="panel">
          <h1>⚽ Pitch Legends</h1>
          <p class="sub">Collect player cards, build your 5-a-side team, and play fast arcade football on the pitch. Card color = position. Upgrade cards, positions and powers to dominate.</p>
          <div class="row" style="margin-bottom:14px">
            <div class="panel" style="flex:1;text-align:center"><div class="stat-big gold">${s.stats.wins}</div><div class="muted">Wins</div></div>
            <div class="panel" style="flex:1;text-align:center"><div class="stat-big">${s.stats.draws}</div><div class="muted">Draws</div></div>
            <div class="panel" style="flex:1;text-align:center"><div class="stat-big">${s.stats.losses}</div><div class="muted">Losses</div></div>
            <div class="panel" style="flex:1;text-align:center"><div class="stat-big">${owned}<span class="muted" style="font-size:0.9rem">/${CATALOG.length}</span></div><div class="muted">Cards</div></div>
          </div>
          <div class="opp-card" style="display:grid;width:100%">
            <div class="muted" style="font-size:0.8rem">NEXT OPPONENT</div>
            <div style="font-weight:800;font-size:1.1rem">${AI_STYLES[opp.style].icon} ${esc(opp.name)} <span class="tag">Lv ${opp.level}</span></div>
            <div class="muted" style="font-size:0.85rem">Opponent level rises every 3 wins. Win reward: ${40 + opp.level * 10}+ 🪙, +5 per goal.</div>
          </div>
          <button class="btn primary block" data-action="start-match" style="font-size:1.1rem;padding:14px">🏟️ Play Match</button>
          <div class="row" style="margin-top:10px"><button class="btn sm green" data-action="start-match" data-value="sim">📺 Simulate match</button><button class="btn sm" data-action="go" data-value="lineup">📋 Set lineup</button><button class="btn sm" data-action="go" data-value="gacha">🎁 Gacha</button></div>
        </div>
        <div class="panel">
          <h2>Positions on the pitch</h2>
          <div class="legend">
            ${Object.entries(POS).map(([c, p]) => `<div class="legend-item"><div class="dot ${c}">${p.icon}</div><div><b>${p.name}</b><small>${p.effect}</small></div></div>`).join('')}
          </div>
          <h2 style="margin-top:18px">How to play</h2>
          <ul class="muted" style="margin:0;padding-left:18px;font-size:0.9rem;line-height:1.7">
            <li><kbd>WASD</kbd> / arrows move · <kbd>Space</kbd> pass (or tackle) · <kbd>X</kbd> / <kbd>Shift</kbd> shoot · <kbd>C</kbd> switch player · <kbd>P</kbd> pause</li>
            <li><b class="gold">Powers</b>: <kbd>Q</kbd> Shot · <kbd>E</kbd> Save · <kbd>R</kbd> Block. Energy regenerates and is earned by passes and tackles.</li>
            <li>Hold up/down while shooting to aim for the corners. 90 seconds per match.</li>
            <li>On touch screens: drag on the pitch to move, use the buttons under it.</li>
          </ul>
          <div class="row space" style="margin-top:16px"><span></span><button class="btn sm danger" data-action="reset-save">Reset save</button></div>
        </div>
      </div>`;
  },

  /* ================= MATCH ================= */
  renderArena() {
    const root = document.getElementById('screen-arena');
    if (!Game.running && !Game.over) {
      const opp = Game.nextOpponent();
      root.innerHTML = `<div class="panel pre-match" data-m3pop>
        <h1>🏟️ Match day</h1>
        <p class="sub">5-a-side, 90 seconds. Your lineup: ${SLOT_ORDER.map(k => { const id = Store.state.lineup[k]; return id ? esc(CATALOG_BY_ID[id].name) : '—'; }).join(' · ')}</p>
        <div class="opp-card"><div class="muted" style="font-size:0.8rem">NEXT OPPONENT</div><div style="font-weight:800;font-size:1.2rem">${AI_STYLES[opp.style].icon} ${esc(opp.name)}</div><div class="muted">Level ${opp.level} · ${AI_STYLES[opp.style].label}</div></div>
        <div class="row" style="justify-content:center"><button class="btn primary" data-action="start-match" style="font-size:1.1rem;padding:14px 32px">🎮 Kick off!</button><button class="btn green" data-action="start-match" data-value="sim" style="font-size:1.1rem;padding:14px 24px">📺 Simulate</button><button class="btn" data-action="go" data-value="lineup">📋 Lineup</button></div>
        <p class="muted" style="margin-top:10px;font-size:0.85rem">Simulate: your lineup plays by itself against the AI — sit back and watch, but you still control the Shot / Save / Block powers.</p>
      </div>`;
      return;
    }
    if (!document.getElementById('pitch')) this.buildArena();
    this.updateScore(); this.updateHud(); this.updateCommentary();
  },
  startMatch(simulate = false) {
    Game.simulate = simulate;
    this.buildArena();
    Game.start({ simulate });
    this.updateScore(); this.updateHud(); this.updateCommentary();
  },
  buildArena() {
    const root = document.getElementById('screen-arena');
    const s = Store.state;
    root.innerHTML = `
      <div class="match-wrap">
        <div class="scoreboard">
          <div class="team">🙂 Your team ${Game.simulate ? '<span class="tag" style="color:var(--ok)">📺 SIM</span>' : ''}</div>
          <div style="text-align:center"><div class="score" id="sb-score">0 – 0</div><div class="clock" id="sb-clock">0'</div></div>
          <div class="team away" id="sb-away"></div>
        </div>
        <div class="pitch-wrap">
          <canvas id="pitch"></canvas>
          <div class="pitch-overlay hidden" id="pitch-overlay"></div>
        </div>
        <div class="hud">
          <div class="energy-wrap"><span class="muted" style="font-size:0.8rem">ENERGY</span><div class="energy" id="energy"></div><span class="muted" style="font-size:0.75rem" id="energy-num"></span></div>
          <div class="row"><button class="btn sm" data-action="speed" data-value="1" id="btn-sp1">1×</button><button class="btn sm" data-action="speed" data-value="2" id="btn-sp2">2×</button><button class="btn sm" data-action="resume" id="btn-resume" style="display:none">▶ Resume</button><button class="btn sm danger" data-action="forfeit">Forfeit</button></div>
        </div>
        <div class="powers-bar">${['shot', 'save', 'block'].map(k => { const d = POWERS[k]; return `<button class="power-btn ${d.cls}" data-action="power" data-value="${k}" id="pw-${k}"><span class="key">${d.key}</span><b>${d.icon} ${d.name} <span class="muted">Lv ${s.powers[k]}</span></b><small id="pw-${k}-desc"></small><span class="cost">⚡ ${d.cost} energy</span></button>`; }).join('')}</div>
        <div class="touch-bar" ${Game.simulate ? 'style="display:none"' : ''}>
          <button class="touch-btn" data-action="virtual" data-value="pass">Pass / Tackle</button>
          <button class="touch-btn" data-action="virtual" data-value="shoot">Shoot</button>
          <button class="touch-btn" data-action="virtual" data-value="c">Switch</button>
          <button class="touch-btn" data-action="virtual" data-value="p">Pause</button>
        </div>
        <div class="controls-help">${Game.simulate ? '<span>📺 Simulation — your team plays itself</span>' : '<span><kbd>WASD</kbd>/arrows move</span>'}${Game.simulate ? '' : '<span><kbd>Space</kbd> pass · tackle</span><span><kbd>X</kbd>/<kbd>Shift</kbd> shoot (hold ↑↓ to aim)</span><span><kbd>C</kbd> switch</span>'}<span><kbd>Q</kbd> <kbd>E</kbd> <kbd>R</kbd> powers</span><span><kbd>P</kbd> pause</span><span><kbd>1</kbd>/<kbd>2</kbd> speed</span></div>
        <div class="commentary" id="commentary"></div>
      </div>`;
    Game.bind(document.getElementById('pitch'));
    document.getElementById('sb-away').innerHTML = `${esc(Game.aiName || 'Opponent')}`;
  },
  updateScore() {
    const sc = document.getElementById('sb-score'); if (!sc) return;
    sc.textContent = `${Game.score.home} – ${Game.score.away}`;
    document.getElementById('sb-away').innerHTML = `${AI_STYLES[Game.aiStyle].icon} ${esc(Game.aiName)} <span class="tag">Lv ${Game.aiLevel}</span>`;
  },
  updateHud() {
    const en = document.getElementById('energy'); if (!en) return;
    const e = Game.energy.home, s = Store.state;
    en.innerHTML = Array.from({ length: MAX_ENERGY }, (_, i) => `<i class="${i < e ? 'on' : ''}"></i>`).join('');
    document.getElementById('energy-num').textContent = `${e}/${MAX_ENERGY}`;
    const desc = {
      shot: Game.fx.powerShot.home ? 'CHARGED — shoot now!' : `Next shot ×${Formula.shotSpeedMult(s.powers.shot, s.slots.green).toFixed(2)} speed`,
      save: Game.fx.shield.home > 0 ? `Shield active ${Game.fx.shield.home.toFixed(1)}s` : `Goal shield ${Formula.saveDuration(s.powers.save, s.slots.blue).toFixed(1)}s`,
      block: Game.fx.block.home > 0 ? `Blocking ${Game.fx.block.home.toFixed(1)}s` : `Freeze ${Formula.blockDuration(s.powers.block, s.slots.red).toFixed(1)}s in ${Formula.blockRadius(s.powers.block)}px`,
    };
    ['shot', 'save', 'block'].forEach(k => {
      const b = document.getElementById(`pw-${k}`); if (!b) return;
      const active = (k === 'shot' && Game.fx.powerShot.home) || (k === 'save' && Game.fx.shield.home > 0) || (k === 'block' && Game.fx.block.home > 0);
      b.disabled = !Game.running || Game.over || e < POWERS[k].cost || active;
      b.classList.toggle('active-power', active);
      document.getElementById(`pw-${k}-desc`).textContent = desc[k];
    });
    const res = document.getElementById('btn-resume'); if (res) res.style.display = Game.paused ? '' : 'none';
    [1, 2].forEach(v => { const b = document.getElementById(`btn-sp${v}`); if (b) b.classList.toggle('primary', Game.speed === v); });
  },
  updateCommentary() {
    const el = document.getElementById('commentary'); if (!el) return;
    el.innerHTML = Game.log.map(l => `<div>${esc(l)}</div>`).join('');
    const clock = document.getElementById('sb-clock'); if (clock) clock.textContent = `${Math.min(90, Math.floor(Game.time))}'`;
    this.updateHud();
  },
  banner(text) {
    const wrap = document.querySelector('.pitch-wrap'); if (!wrap) return;
    const el = document.createElement('div'); el.className = 'banner'; el.textContent = text; wrap.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  },
  resultModal(won, drew, lines, score, stats, aiName) {
    const title = won ? '🏆 Victory!' : drew ? '🤝 Draw' : '💀 Defeat';
    this.modal(`<h2 class="result-title ${won ? 'win' : drew ? '' : 'lose'}">${title}</h2>
      <div class="score" style="display:inline-block;margin:6px 0">${score.home} – ${score.away}</div>
      <p class="muted">vs ${esc(aiName)} · ${stats.goals} goals · ${stats.saves} saves · ${stats.tackles} tackles · ${stats.passes} passes</p>
      ${lines.map(l => `<div class="reward-line">${l}</div>`).join('')}
      <div class="row" style="justify-content:center;margin-top:18px">
        <button class="btn primary" data-action="start-match">🎮 Play again</button>
        <button class="btn green" data-action="start-match" data-value="sim">📺 Simulate</button>
        <button class="btn" data-action="go" data-value="gacha">🎁 Gacha</button>
        <button class="btn" data-action="go" data-value="home">Home</button>
      </div>`);
  },

  /* ================= LINEUP ================= */
  renderLineup() {
    const s = Store.state;
    document.getElementById('screen-lineup').innerHTML = `
      <div class="row space"><div><h1>📋 Lineup</h1><p class="sub">Five on the pitch. Each slot takes its own color — Legends (black) fit anywhere, and the free role takes anyone.</p></div><button class="btn" data-action="auto-lineup">✨ Auto best XI</button></div>
      <div class="lineup-grid">
        ${SLOT_ORDER.map(k => { const sd = SLOT_DEF[k], id = s.lineup[k], d = id ? CATALOG_BY_ID[id] : null; return `
          <div class="lineup-slot ${sd.color}">
            <div class="slot-title">${sd.icon} ${sd.title}</div>
            ${d ? this.cardHtml(d, 'sm') : '<div class="card sm locked"></div>'}
            <div class="nm">${d ? esc(d.name) : 'Empty'} ${d ? `<span class="muted">Lv ${s.cards[d.id].level}</span>` : ''}</div>
            ${d ? this.statline(Stats.forOwned(d.id)) : ''}
            <button class="btn sm" data-action="pick-slot" data-value="${k}">Change</button>
          </div>`; }).join('')}
      </div>
      <div class="panel" style="margin-top:14px"><h2>Stats explained</h2><p class="muted" style="margin:0;font-size:0.88rem">SPD running speed · POW shot speed & accuracy · CTL passing, dribbling and holding off tackles · TKL winning the ball · SAV goalkeeper catches. Shown as % above a basic player. Card level and position-slot level both add to every stat.</p></div>`;
  },
  slotPicker(slot) {
    const s = Store.state, list = Lineup.eligible(slot).sort((a, b) => Stats.tier(b, s.cards[b.id].level, s.slots[b.color]) - Stats.tier(a, s.cards[a.id].level, s.slots[a.color]));
    const used = SLOT_ORDER.filter(k => k !== slot).map(k => s.lineup[k]);
    this.modal(`<h2>${SLOT_DEF[slot].icon} Pick your ${SLOT_DEF[slot].title}</h2>
      <div class="picker-grid">${list.map(d => `<div class="picker-item ${s.lineup[slot] === d.id ? 'selected' : ''}" data-action="choose-card" data-slot="${slot}" data-value="${d.id}">${this.cardHtml(d, 'sm')}<div class="nm">${esc(d.name)}</div><div class="tier">Lv ${s.cards[d.id].level} · tier ${Stats.tier(d, s.cards[d.id].level, s.slots[d.color]).toFixed(1)}${used.includes(d.id) ? ' · in use' : ''}</div></div>`).join('') || '<p class="muted">No eligible cards — pull some in the Gacha.</p>'}</div>
      <div class="row" style="justify-content:center;margin-top:14px"><button class="btn" data-action="close-modal">Cancel</button></div>`, true);
  },

  /* ================= GACHA ================= */
  renderGacha(results) {
    const s = Store.state;
    document.getElementById('screen-gacha').innerHTML = `
      <div class="gacha-banner">
        <h1>🎁 Transfer Window</h1>
        <p class="sub" style="margin-bottom:6px">Spend tokens to sign random players. Duplicates turn into 💎 shards for upgrades.</p>
        <div class="rates"><span class="tag common">Common (#0–#9) 70%</span><span class="tag rare">Rare (Dribbler / Playmaker / Enforcer) 24%</span><span class="tag epic">Epic (Legend / Superstar) 6%</span></div>
        <div class="row" style="justify-content:center">
          <button class="btn primary" data-action="pull" data-value="1" ${s.tokens < Gacha.COST1 ? 'disabled' : ''}>Pull ×1 — ${Gacha.COST1} 🪙</button>
          <button class="btn primary" data-action="pull" data-value="10" ${s.tokens < Gacha.COST10 ? 'disabled' : ''}>Pull ×10 — ${Gacha.COST10} 🪙 <small>(save 10)</small></button>
        </div>
        <div class="muted" style="margin-top:8px;font-size:0.85rem">Duplicate shards: common 1 · rare 3 · epic 6</div>
      </div>
      <div class="gacha-results" id="gacha-results"></div>`;
    if (results) this.revealPulls(results);
  },
  doPull(n) { const results = Gacha.pull(n); if (results) this.renderGacha(results); },
  revealPulls(results) {
    const wrap = document.getElementById('gacha-results');
    results.forEach((r, i) => {
      const el = document.createElement('div'); el.className = 'flip-wrap';
      el.innerHTML = `<div class="flip"><div class="flip-inner">
          <div class="flip-face back"><div class="card back"></div></div>
          <div class="flip-face front">${this.cardHtml(r.def)}</div>
        </div></div>
        <div class="flip-meta"><div><span class="tag ${r.def.rarity}">${r.def.rarity}</span></div><div style="font-weight:700">${esc(r.def.name)}</div>
        <div>${r.isNew ? '<span class="new-badge">NEW!</span>' : `<span class="dup-badge">Dup → +${r.shards} 💎</span>`}</div></div>`;
      wrap.appendChild(el);
      setTimeout(() => { el.classList.add('show'); el.querySelector('.flip').classList.add('show'); }, 250 + i * 220);
    });
  },

  /* ================= INVENTORY ================= */
  invFilter: 'all',
  renderInventory() {
    const s = Store.state, f = this.invFilter;
    const list = CATALOG.filter(d => f === 'all' ? true : f === 'owned' ? !!s.cards[d.id] : d.color === f);
    const slotBonus = {
      green: lv => `Attackers +${((lv - 1) * 1.2).toFixed(1)} tier · Shot power ×${Formula.shotSpeedMult(s.powers.shot, lv).toFixed(2)}`,
      red: lv => `Defenders +${((lv - 1) * 1.2).toFixed(1)} tier · Block lasts ${Formula.blockDuration(s.powers.block, lv).toFixed(1)}s`,
      blue: lv => `Goalkeepers +${((lv - 1) * 1.2).toFixed(1)} tier · Save shield ${Formula.saveDuration(s.powers.save, lv).toFixed(1)}s`,
      yellow: lv => `Midfielders +${((lv - 1) * 1.2).toFixed(1)} tier`,
      black: lv => `Legends +${((lv - 1) * 1.2).toFixed(1)} tier`,
    };
    document.getElementById('screen-inventory').innerHTML = `
      <h1>🃏 Your Squad</h1>
      <p class="sub">${Object.keys(s.cards).length} / ${CATALOG.length} players collected. Upgrade a card with 💎 shards to raise its stats (max Lv ${MAX_LEVEL}).</p>
      <div class="panel" style="margin-bottom:16px">
        <h2>Position slots</h2>
        <p class="sub">Upgrade a position with 🪙 tokens to boost <b>every</b> player of that color — and the power it feeds.</p>
        <div class="slots">
          ${Object.entries(POS).map(([c, p]) => { const lv = s.slots[c]; const max = lv >= MAX_LEVEL; return `
            <div class="slot ${c}">
              <div class="row space"><b>${p.icon} ${p.name}</b>${this.stars(lv)}</div>
              <div class="muted" style="font-size:0.8rem">${slotBonus[c](lv)}</div>
              <button class="btn sm ${max ? '' : 'primary'}" data-action="upgrade-slot" data-value="${c}" ${max || s.tokens < Upgrades.slotCost(lv) ? 'disabled' : ''}>${max ? 'MAX' : `Upgrade — ${Upgrades.slotCost(lv)} 🪙`}</button>
            </div>`; }).join('')}
        </div>
      </div>
      <div class="filters">
        ${[['all', 'All'], ['owned', 'Owned'], ['blue', '🧤 GK'], ['green', '⚽ ATT'], ['yellow', '🎯 MID'], ['red', '🛡️ DEF'], ['black', '🌟 Legend']].map(([k, l]) => `<button class="filter-btn ${f === k ? 'active' : ''}" data-action="filter" data-value="${k}">${l}</button>`).join('')}
      </div>
      <div class="inv-grid">
        ${list.map(d => { const o = s.cards[d.id]; if (!o) return `<div class="inv-item"><div class="cardwrap">${this.cardHtml(d, 'sm locked')}</div><div class="nm muted">${esc(d.name)}</div><span class="tag ${d.rarity}">${d.rarity}</span></div>`;
          const max = o.level >= MAX_LEVEL, cost = Upgrades.cardCost(o.level);
          return `<div class="inv-item"><div class="cardwrap">${this.cardHtml(d, 'sm')}<span class="cnt">×${o.count}</span></div>
            <div class="nm">${esc(d.name)}</div>${this.stars(o.level)}${this.statline(Stats.forOwned(d.id))}
            <button class="btn sm ${max ? '' : 'primary'}" data-action="upgrade-card" data-value="${d.id}" ${max || s.shards < cost ? 'disabled' : ''}>${max ? 'MAX' : `${cost} 💎`}</button></div>`; }).join('')}
      </div>`;
  },

  /* ================= POWERS ================= */
  renderPowers() {
    const s = Store.state;
    const statLines = (k, lv) => {
      if (k === 'shot') return [['Shot speed', `×${Formula.shotSpeedMult(lv, s.slots.green).toFixed(2)}`, `×${Formula.shotSpeedMult(lv + 1, s.slots.green).toFixed(2)}`]];
      if (k === 'save') return [['Shield time', `${Formula.saveDuration(lv, s.slots.blue).toFixed(1)}s`, `${Formula.saveDuration(lv + 1, s.slots.blue).toFixed(1)}s`]];
      return [['Freeze time', `${Formula.blockDuration(lv, s.slots.red).toFixed(1)}s`, `${Formula.blockDuration(lv + 1, s.slots.red).toFixed(1)}s`], ['Radius', `${Formula.blockRadius(lv)}px`, `${Formula.blockRadius(lv + 1)}px`]];
    };
    document.getElementById('screen-powers').innerHTML = `
      <h1>⚡ Active Powers</h1>
      <p class="sub">Trigger them mid-match with <kbd>Q</kbd> <kbd>E</kbd> <kbd>R</kbd> or the buttons under the pitch. Energy refills over time and with every completed pass or won tackle.</p>
      <div class="grid grid-3">
        ${Object.entries(POWERS).map(([k, d]) => { const lv = s.powers[k], max = lv >= MAX_LEVEL, cost = Upgrades.powerCost(lv); return `
          <div class="power-card ${d.cls}">
            <div class="row space"><span class="icon">${d.icon}</span>${this.stars(lv)}</div>
            <h2>${d.name} <span class="muted" style="font-size:0.9rem">Lv ${lv}</span></h2>
            <div class="muted" style="font-size:0.85rem">${d.blurb}</div>
            <div class="kv"><span>Energy cost</span><b>⚡ ${d.cost}</b></div>
            ${statLines(k, lv).map(([n, now, next]) => `<div class="kv"><span>${n}</span><span><b>${now}</b>${max ? '' : ` <span class="next">→ ${next}</span>`}</span></div>`).join('')}
            <button class="btn ${max ? '' : 'primary'} block" data-action="upgrade-power" data-value="${k}" ${max || s.tokens < cost.tokens || s.shards < cost.shards ? 'disabled' : ''}>${max ? 'MAX LEVEL' : `Upgrade — ${cost.tokens} 🪙 + ${cost.shards} 💎`}</button>
          </div>`; }).join('')}
      </div>`;
  },

  /* ================= CHALLENGES ================= */
  renderChallenges() {
    const s = Store.state;
    document.getElementById('screen-challenges').innerHTML = `
      <h1>🏆 Challenges</h1>
      <p class="sub">Complete objectives to earn tokens. A claimed challenge is replaced by a new one.</p>
      <div class="grid">
        ${s.challenges.map(c => { const d = Challenges.def(c.id); return `
          <div class="challenge ${c.done ? 'done' : ''}">
            <div><b>${d.text}</b><div class="muted" style="font-size:0.8rem">${c.progress} / ${d.target}</div>
              <div class="bar"><i style="width:${(c.progress / d.target) * 100}%"></i></div></div>
            <button class="btn ${c.done ? 'primary' : ''}" data-action="claim" data-value="${c.id}" ${c.done ? '' : 'disabled'}>${c.done ? 'Claim' : 'Reward'} +${d.reward} 🪙</button>
          </div>`; }).join('')}
      </div>
      <div class="panel" style="margin-top:16px"><h2>Career</h2>
        <div class="row"><span class="pill">Matches <b>${s.stats.played}</b></span><span class="pill">Wins <b>${s.stats.wins}</b></span><span class="pill">Goals <b>${s.stats.goals}</b></span><span class="pill">Best streak <b>${s.stats.bestStreak}</b></span><span class="pill">Gacha pulls <b>${s.stats.pulls}</b></span></div>
      </div>`;
  },
};

/* ---------------- Boot ---------------- */
Store.load();
UI.init();
window.PitchLegends = { Store, Game, Gacha, Upgrades, Challenges, Lineup, Stats, UI, CATALOG, FIELD };
