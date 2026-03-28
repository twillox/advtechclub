const LEVEL_THRESHOLDS = [
  { level: 4, minXp: 700 },
  { level: 3, minXp: 300 },
  { level: 2, minXp: 100 },
  { level: 1, minXp: 0 },
];

function computeLevelFromXp(xp) {
  const value = Number(xp) || 0;
  for (const t of LEVEL_THRESHOLDS) {
    if (value >= t.minXp) return t.level;
  }
  return 1;
}

module.exports = { computeLevelFromXp, LEVEL_THRESHOLDS };

