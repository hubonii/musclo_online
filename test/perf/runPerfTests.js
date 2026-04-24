#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const autocannon = require('autocannon');
const { getRunConfig } = require('./config');
const { buildScenarios } = require('./scenarios');

const parseArgs = (argv) => {
  // Simple manual parser for a small set of CLI flags.
  const args = { profile: undefined, baseUrl: undefined, jsonOutput: undefined, dryRun: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--profile') {
      args.profile = argv[i + 1];
      i += 1;
    } else if (arg === '--base-url') {
      args.baseUrl = argv[i + 1];
      i += 1;
    } else if (arg === '--json-output') {
      args.jsonOutput = argv[i + 1];
      i += 1;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }

  return args;
};

const getCookieHeader = (setCookieHeader) => {
  // Convert Set-Cookie header array into the token cookie pair used by later requests.
  if (!Array.isArray(setCookieHeader)) return null;
  const cookiePair = setCookieHeader.find((item) => typeof item === 'string' && item.startsWith('token='));
  return cookiePair ? cookiePair.split(';')[0] : null;
};

const loginOrRegister = async (baseUrl, credentials) => {
  // Ensure we always have a valid authenticated cookie before running protected scenarios.
  const client = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    validateStatus: () => true,
  });

  let response = await client.post('/api/login', {
    email: credentials.email,
    password: credentials.password,
  });

  if (response.status === 401) {
    // First-time run: create perf user, then retry login.
    const registerResponse = await client.post('/api/register', {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    });

    if (registerResponse.status >= 400) {
      throw new Error(`Unable to create perf user. Status: ${registerResponse.status}`);
    }

    response = await client.post('/api/login', {
      email: credentials.email,
      password: credentials.password,
    });
  }

  if (response.status >= 400) {
    throw new Error(`Unable to login perf user. Status: ${response.status}`);
  }

  const cookie = getCookieHeader(response.headers['set-cookie']);
  if (!cookie) {
    throw new Error('Auth cookie not returned from /api/login.');
  }

  return cookie;
};

const runScenario = (baseUrl, scenario, profile) => {
  return new Promise((resolve, reject) => {
    // Autocannon executes one scenario with the selected concurrency/duration profile.
    autocannon(
      {
        url: `${baseUrl}${scenario.path}`,
        method: scenario.method,
        headers: scenario.headers,
        body: scenario.body,
        duration: profile.durationSec,
        connections: profile.connections,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );
  });
};

const summarizeResult = (scenario, result) => {
  // Normalize raw autocannon output into one comparable summary record.
  const totalRequests = result.requests.total || 0;
  const non2xx = (result['1xx'] || 0) + (result['3xx'] || 0) + (result['4xx'] || 0) + (result['5xx'] || 0);
  const failedRequests = (result.errors || 0) + (result.timeouts || 0) + non2xx;

  return {
    scenario: scenario.name,
    method: scenario.method,
    path: scenario.path,
    totalRequests,
    reqPerSecAvg: result.requests.average || 0,
    p95Ms: result.latency.p95 || 0,
    errors: result.errors || 0,
    timeouts: result.timeouts || 0,
    non2xx,
    errorRate: totalRequests > 0 ? failedRequests / totalRequests : 0,
  };
};

const evaluateThresholds = (summary, thresholds) => {
  // Collects all threshold violations for one scenario summary.
  const failures = [];

  if (summary.p95Ms > thresholds.p95Ms) {
    failures.push(`p95 ${summary.p95Ms}ms > ${thresholds.p95Ms}ms`);
  }
  if (summary.errorRate > thresholds.maxErrorRate) {
    failures.push(`error rate ${(summary.errorRate * 100).toFixed(2)}% > ${(thresholds.maxErrorRate * 100).toFixed(2)}%`);
  }
  if (summary.reqPerSecAvg < thresholds.minReqPerSec) {
    failures.push(`req/s ${summary.reqPerSecAvg.toFixed(2)} < ${thresholds.minReqPerSec}`);
  }

  return failures;
};

const writeJsonReport = (filePath, report) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const runConfig = getRunConfig({
    profileName: args.profile,
    baseUrl: args.baseUrl,
    jsonOutputPath: args.jsonOutput,
  });

  if (args.dryRun) {
    // Dry-run mode prints effective config and skips load execution.
    console.log('Performance test dry run config:', JSON.stringify(runConfig, null, 2));
    return;
  }

  console.log(`Running profile "${runConfig.profileName}" against ${runConfig.baseUrl}`);

  const authCookie = await loginOrRegister(runConfig.baseUrl, runConfig.credentials);
  const scenarios = buildScenarios({ credentials: runConfig.credentials, authCookie });

  const report = {
    startedAt: new Date().toISOString(),
    profile: runConfig.profileName,
    baseUrl: runConfig.baseUrl,
    thresholds: runConfig.thresholds,
    results: [],
    failures: [],
  };

  for (const scenario of scenarios) {
    console.log(`> ${scenario.name} (${scenario.method} ${scenario.path})`);
    const raw = await runScenario(runConfig.baseUrl, scenario, runConfig.profile);
    const summary = summarizeResult(scenario, raw);
    const thresholdFailures = evaluateThresholds(summary, runConfig.thresholds);

    report.results.push(summary);
    if (thresholdFailures.length > 0) {
      report.failures.push({ scenario: scenario.name, failures: thresholdFailures });
    }

    console.log(
      `  req/s=${summary.reqPerSecAvg.toFixed(2)} p95=${summary.p95Ms}ms errors=${(summary.errorRate * 100).toFixed(2)}%`
    );
  }

  if (runConfig.jsonOutputPath) {
    writeJsonReport(runConfig.jsonOutputPath, report);
    console.log(`Report written to ${runConfig.jsonOutputPath}`);
  }

  if (report.failures.length > 0) {
    // Fail process when any scenario breaches the configured SLO thresholds.
    console.error('Performance thresholds failed:');
    for (const failure of report.failures) {
      console.error(`- ${failure.scenario}: ${failure.failures.join(', ')}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('All performance thresholds passed.');
};

main().catch((error) => {
  console.error('Performance test run failed:', error.message);
  process.exitCode = 1;
});


