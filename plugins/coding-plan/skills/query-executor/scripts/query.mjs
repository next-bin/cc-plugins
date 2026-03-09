#!/usr/bin/env node

/**
 * Coding Plan Query Script
 * Supports multiple query types via --type parameter
 *
 * Usage:
 *   node query.mjs --type=usage     # Query usage statistics (default)
 *   node query.mjs --type=history   # Query history (placeholder for future)
 */

import https from 'https';

// Parse command line arguments
const args = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type='));
const queryType = typeArg ? typeArg.split('=')[1] : 'usage';

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
    process.exit(1);
  }
}

function getPlatformConfig() {
  const parsedBaseUrl = new URL(baseUrl);
  const baseDomain = `${parsedBaseUrl.protocol}//${parsedBaseUrl.host}`;

  if (baseUrl.includes('api.z.ai')) {
    return { platform: 'ZAI', baseDomain };
  } else if (baseUrl.includes('open.bigmodel.cn') || baseUrl.includes('dev.bigmodel.cn')) {
    return { platform: 'ZHIPU', baseDomain };
  }

  console.error('Error: Unrecognized ANTHROPIC_BASE_URL:', baseUrl);
  console.error('');
  console.error('Supported values:');
  console.error('  - https://api.z.ai/api/anthropic');
  console.error('  - https://open.bigmodel.cn/api/anthropic');
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
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + (options.queryParams || ''),
      method: 'GET',
      headers: {
        'Authorization': authToken,
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

// Placeholder for future query types
async function queryHistory(config) {
  console.log('History query not implemented yet.');
  console.log('This is a placeholder for future functionality.');
}

// ==================== Main ====================

const queryHandlers = {
  usage: queryUsage,
  history: queryHistory
};

async function main() {
  validateEnv();
  const config = getPlatformConfig();

  console.log(`Platform: ${config.platform}`);
  console.log(`Query Type: ${queryType}`);
  console.log('');

  const handler = queryHandlers[queryType];
  if (!handler) {
    console.error(`Error: Unknown query type "${queryType}"`);
    console.error('Supported types:', Object.keys(queryHandlers).join(', '));
    process.exit(1);
  }

  await handler(config);
}

main().catch((error) => {
  console.error('Request failed:', error.message);
  process.exit(1);
});
