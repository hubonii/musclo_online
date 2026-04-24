const path = require('path');

// Predefined load profiles for smoke, CI, and baseline runs.
const PERF_PROFILES = {
  smoke: { durationSec: 8, connections: 8 },
  ci: { durationSec: 15, connections: 16 },
  baseline: { durationSec: 30, connections: 40 },
};

// Default pass/fail targets for each scenario summary.
const DEFAULT_THRESHOLDS = {
  p95Ms: 450,
  maxErrorRate: 0.01,
  minReqPerSec: 20,
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveProfileName = (profileName) => {
  // Resolves profile name; defaults to `smoke` when name is missing or invalid.
  if (!profileName) return 'smoke';
  return PERF_PROFILES[profileName] ? profileName : 'smoke';
};

const getRunConfig = ({ profileName, baseUrl, jsonOutputPath }) => {
  // Returns normalized runtime config consumed by perf runner.
  const resolvedProfile = resolveProfileName(profileName);
  const profile = PERF_PROFILES[resolvedProfile];

  return {
    profileName: resolvedProfile,
    baseUrl: baseUrl || process.env.PERF_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8000}`,
    jsonOutputPath: jsonOutputPath || null,
    profile,
    thresholds: {
      p95Ms: parseNumber(process.env.PERF_P95_MS, DEFAULT_THRESHOLDS.p95Ms),
      maxErrorRate: parseNumber(process.env.PERF_MAX_ERROR_RATE, DEFAULT_THRESHOLDS.maxErrorRate),
      minReqPerSec: parseNumber(process.env.PERF_MIN_REQ_PER_SEC, DEFAULT_THRESHOLDS.minReqPerSec),
    },
    credentials: {
      email: process.env.PERF_USER_EMAIL || 'perf-user@musclo.local',
      password: process.env.PERF_USER_PASSWORD || 'PerfUser123!',
      name: process.env.PERF_USER_NAME || 'Perf User',
    },
    outputDir: path.join(__dirname, 'results'),
  };
};

module.exports = {
  PERF_PROFILES,
  DEFAULT_THRESHOLDS,
  getRunConfig,
};


