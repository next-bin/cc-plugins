#!/usr/bin/env node

/**
 * Coding Plan Query Script
 * Supports multiple platforms: ZHIPU_EN_ZAI, ZHIPU_CN, MINIMAX_CN, MINIMAX_EN
 *
 * Usage:
 *   node query.mjs
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

function getTimeWindow() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, now.getHours(), 0, 0, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 59, 59, 999);
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

async function queryUsage(config) {
  const { baseDomain } = config;
  const { startTime, endTime } = getTimeWindow();
  const queryParams = `?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;

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
      // Convert UTC to local time (API returns UTC timestamps in milliseconds)
      const startTime = formatDateTime(new Date(model.start_time));
      const endTime = formatDateTime(new Date(model.end_time));
      // remains_time is in milliseconds
      const remainsMs = model.remains_time;
      const remainsMinutes = Math.floor(remainsMs / 60000);
      const remainsSeconds = Math.floor((remainsMs % 60000) / 1000);
      // current_interval_usage_count is remaining quota, not used
      const usedCount = model.current_interval_total_count - model.current_interval_usage_count;

      console.log(`Model: ${model.model_name}`);
      console.log(`  Time Window: ${startTime} ~ ${endTime}`);
      console.log(`  Quota: ${usedCount}/${model.current_interval_total_count} (remaining: ${model.current_interval_usage_count})`);
      console.log(`  Remaining Time: ${remainsMinutes}m ${remainsSeconds}s`);
      console.log('');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// ==================== Main ====================

async function main() {
  validateEnv();
  const config = getPlatformConfig();

  console.log(`Platform: ${config.platform}`);
  console.log('');

  if (config.platform === 'MINIMAX_CN' || config.platform === 'MINIMAX_EN') {
    await queryMiniMax(config);
  } else {
    await queryUsage(config);
  }
}

main().catch((error) => {
  console.error('Request failed:', error.message);
  process.exit(1);
});
