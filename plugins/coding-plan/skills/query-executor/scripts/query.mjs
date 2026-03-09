#!/usr/bin/env node

/**
 * Coding Plan Query Script
 * Supports multiple platforms: ZHIPU_EN_ZAI, ZHIPU_CN, MINIMAX_CN, MINIMAX_EN
 *
 * Usage:
 *   node query.mjs [timeRange]
 *
 * Time Range Options:
 *   - No argument: Default 24-hour window (yesterday same hour to now)
 *   - <number>: Last N days (e.g., 7 = last 7 days, default unit is days)
 *   - <number>m: Last N minutes (e.g., 30m = last 30 minutes)
 *   - <number>h: Last N hours (e.g., 6h = last 6 hours)
 *   - <number>d: Last N days (e.g., 7d = last 7 days)
 *   - <number>w: Last N weeks (e.g., 2w = last 2 weeks)
 *   - <number>M: Last N months (e.g., 3M = last 3 months)
 *   - <number>y: Last N years (e.g., 1y = last 1 year)
 */

import https from 'https';

// Read environment variables
const baseUrl = process.env.ANTHROPIC_BASE_URL || '';
const authToken = process.env.ANTHROPIC_AUTH_TOKEN || '';

// ==================== Common Utils ====================

function validateEnv() {
  if (!authToken) {
    console.error('Error: ANTHROPIC_AUTH_TOKEN is not set');
    console.error('');
    console.error('Set the environment variable and retry:');
    console.error('  export ANTHROPIC_AUTH_TOKEN="your-token-here"');
    process.exit(1);
  }

  if (!baseUrl) {
    console.error('Error: ANTHROPIC_BASE_URL is not set');
    console.error('');
    console.error('Set the environment variable and retry:');
    console.error('  export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"');
    console.error('  or');
    console.error('  export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"');
    console.error('  or');
    console.error('  export ANTHROPIC_BASE_URL="https://api.minimax.chat/api/anthropic"');
    console.error('  or');
    console.error('  export ANTHROPIC_BASE_URL="https://api.minimax.io/anthropic"');
    process.exit(1);
  }
}

function getPlatformConfig() {
  const parsedBaseUrl = new URL(baseUrl);
  const baseDomain = `${parsedBaseUrl.protocol}//${parsedBaseUrl.host}`;

  if (baseUrl.includes('api.z.ai')) {
    return { platform: 'ZHIPU_EN_ZAI', baseDomain };
  } else if (baseUrl.includes('open.bigmodel.cn') || baseUrl.includes('dev.bigmodel.cn')) {
    return { platform: 'ZHIPU_CN', baseDomain };
  } else if (baseUrl.includes('minimaxi.com') || baseUrl.includes('api.minimax.chat')) {
    return { platform: 'MINIMAX_CN', apiDomain: 'https://www.minimaxi.com' };
  } else if (baseUrl.includes('api.minimax.io')) {
    return { platform: 'MINIMAX_EN', apiDomain: 'https://api.minimax.io' };
  }

  console.error('Error: Unrecognized ANTHROPIC_BASE_URL:', baseUrl);
  console.error('');
  console.error('Supported values:');
  console.error('  - https://api.z.ai/api/anthropic');
  console.error('  - https://open.bigmodel.cn/api/anthropic');
  console.error('  - https://api.minimax.chat/api/anthropic (MiniMax CN)');
  console.error('  - https://api.minimax.io/anthropic (MiniMax EN)');
  process.exit(1);
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDateTimeUTC(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Parse time range argument
 * Supported formats: 30m, 6h, 7d, 2w, 3M, 1y
 * Default unit: days (e.g., "7" means "7d")
 */
function parseTimeRange(arg) {
  if (!arg) return null;

  // If just a number, default to days
  if (/^\d+$/.test(arg)) {
    return { value: parseInt(arg, 10), unit: 'd' };
  }

  const match = arg.match(/^(\d+)([mhdwMy])$/);
  if (!match) {
    console.error(`Invalid time range format: ${arg}`);
    console.error('Supported formats: <number>m (minutes), <number>h (hours), <number>d (days)');
    console.error('                   <number>w (weeks), <number>M (months), <number>y (years)');
    console.error('                   <number> (defaults to days, e.g., 7 = 7d)');
    process.exit(1);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  return { value, unit };
}

/**
 * Calculate time window based on time range
 * @param {object|null} timeRange - Parsed time range {value, unit} or null for default
 */
function getTimeWindow(timeRange) {
  const now = new Date();
  let startDate;

  if (!timeRange) {
    // Default: 24-hour window (yesterday same hour to now)
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, now.getHours(), 0, 0, 0);
  } else {
    const { value, unit } = timeRange;
    startDate = new Date(now);

    switch (unit) {
      case 'm': // minutes
        startDate = new Date(now.getTime() - value * 60 * 1000);
        break;
      case 'h': // hours
        startDate = new Date(now.getTime() - value * 60 * 60 * 1000);
        break;
      case 'd': // days
        startDate = new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
        break;
      case 'w': // weeks
        startDate = new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'M': // months
        startDate = new Date(now.getFullYear(), now.getMonth() - value, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
        break;
      case 'y': // years
        startDate = new Date(now.getFullYear() - value, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
        break;
    }
  }

  const endDate = now;

  return {
    startTime: formatDateTime(startDate),
    endTime: formatDateTime(endDate)
  };
}

function httpRequest(apiUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(apiUrl);
    const authorization = options.useBearerToken ? `Bearer ${authToken}` : authToken;
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + (options.queryParams || ''),
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Accept-Language': 'en-US,en',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}\n${data}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// ==================== Query Handlers ====================

async function queryUsage(config, timeRange) {
  const { baseDomain } = config;
  const { startTime, endTime } = getTimeWindow(timeRange);
  const queryParams = `?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

  // Display time range info
  console.log(`Time Range: ${startTime} ~ ${endTime}`);
  console.log('');

  const endpoints = [
    { url: `${baseDomain}/api/monitor/usage/model-usage`, label: 'Model usage', useParams: true },
    { url: `${baseDomain}/api/monitor/usage/tool-usage`, label: 'Tool usage', useParams: true },
    { url: `${baseDomain}/api/monitor/usage/quota/limit`, label: 'Quota limit', useParams: false }
  ];

  for (const endpoint of endpoints) {
    try {
      const result = await httpRequest(endpoint.url, {
        queryParams: endpoint.useParams ? queryParams : ''
      });

      console.log(`${endpoint.label} data:`);
      console.log('');

      let outputData = result.data || result;
      if (endpoint.label === 'Quota limit' && result.data) {
        outputData = processQuotaLimit(result.data);
      }
      console.log(JSON.stringify(outputData, null, 2));
      console.log('');
    } catch (error) {
      console.error(`[${endpoint.label}] Error: ${error.message}`);
    }
  }
}

function processQuotaLimit(data) {
  if (!data || !data.limits) return data;

  data.limits = data.limits.map(item => {
    if (item.type === 'TOKENS_LIMIT') {
      return {
        type: 'Token usage(5 Hour)',
        percentage: item.percentage
      };
    }
    if (item.type === 'TIME_LIMIT') {
      return {
        type: 'MCP usage(1 Month)',
        percentage: item.percentage,
        currentUsage: item.currentValue,
        total: item.usage,
        usageDetails: item.usageDetails
      };
    }
    return item;
  });
  return data;
}

// ==================== MiniMax Query Handler ====================

async function queryMiniMax(config) {
  const apiUrl = `${config.apiDomain}/v1/api/openplatform/coding_plan/remains`;

  try {
    const result = await httpRequest(apiUrl, { useBearerToken: true });

    if (result.base_resp && result.base_resp.status_code !== 0) {
      console.error(`Error: ${result.base_resp.status_msg}`);
      return;
    }

    if (!result.model_remains || result.model_remains.length === 0) {
      console.log('No model usage data available.');
      return;
    }

    console.log('Model usage data:');
    console.log('');

    for (const model of result.model_remains) {
      // Window time (start_time and end_time are UTC timestamps in milliseconds)
      const startDate = new Date(model.start_time);
      const endDate = new Date(model.end_time);
      const startTimeLocal = formatDateTime(startDate);
      const endTimeLocal = formatDateTime(endDate);
      const endTimeUTC = formatDateTimeUTC(endDate);
      // Remaining time until reset (remains_time is in milliseconds)
      const remainsMs = model.remains_time;
      const hours = Math.floor(remainsMs / 3600000);
      const minutes = Math.floor((remainsMs % 3600000) / 60000);
      const seconds = Math.floor((remainsMs % 60000) / 1000);
      const remainsStr = hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`;
      // Quota info (current_interval_usage_count is remaining, not used)
      const remainingCount = model.current_interval_usage_count;
      const totalCount = model.current_interval_total_count;
      const usedCount = totalCount - remainingCount;
      const usagePercentage = ((usedCount / totalCount) * 100).toFixed(1);

      console.log(`Model: ${model.model_name}`);
      console.log(`  Time Window: ${startTimeLocal} ~ ${endTimeLocal} (Local)`);
      console.log(`  Quota: ${usedCount}/${totalCount} used (${usagePercentage}%), remaining: ${remainingCount}`);
      console.log(`  Reset at: ${endTimeLocal} (Local) / ${endTimeUTC} (UTC)`);
      console.log(`  Time until reset: ${remainsStr} (${remainsMs} ms)`);
      console.log('');
    }

    console.log('Note: All models share the same quota. remains_time is in milliseconds.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// ==================== Main ====================

async function main() {
  validateEnv();
  const config = getPlatformConfig();

  // Parse command line argument for time range
  const timeRangeArg = process.argv[2];
  const timeRange = parseTimeRange(timeRangeArg);

  console.log(`Platform: ${config.platform}`);

  if (config.platform === 'MINIMAX_CN' || config.platform === 'MINIMAX_EN') {
    // MiniMax API doesn't support custom time range, uses API-provided window
    if (timeRange) {
      console.log('Note: MiniMax platform uses API-provided time window, time range argument is ignored.');
      console.log('');
    }
    await queryMiniMax(config);
  } else {
    // ZHIPU platforms support custom time range
    await queryUsage(config, timeRange);
  }
}

main().catch((error) => {
  console.error('Request failed:', error.message);
  process.exit(1);
});
