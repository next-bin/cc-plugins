---
name: query-executor
description: This skill should be used when the usage-query agent needs to run the actual usage query. Execute the query script to retrieve account information for ZHIPU_EN_ZAI, ZHIPU_CN, MINIMAX_CN, MINIMAX_EN platforms. Supports optional time range parameter for ZHIPU platforms.
---

# Query Executor Skill

Execute the query script and return the result.

## Critical Constraint

**Run the script exactly once** — regardless of success or failure, execute it once and return the outcome.

## Execution

### Run the query

Use Node.js to execute the script from the plugin root:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs [timeRange]
```

Or if working directory is already the skill folder:

```bash
node scripts/query.mjs [timeRange]
```

### Time Range Parameter (ZHIPU platforms only)

Optional time range argument for querying specific time periods:

| Format | Description | Example |
| ------ | ----------- | ------- |
| `<number>m` | Last N minutes | `30m` = last 30 minutes |
| `<number>h` | Last N hours | `6h` = last 6 hours |
| `<number>d` | Last N days | `7d` = last 7 days |
| `<number>w` | Last N weeks | `2w` = last 2 weeks |
| `<number>M` | Last N months | `3M` = last 3 months |
| `<number>y` | Last N years | `1y` = last 1 year |

If no time range is specified, the default is a 24-hour window (yesterday same hour to now).

**Note**: MiniMax platforms do not support custom time ranges and will ignore this parameter.

### Return the result

After execution, return the result to the caller:

- **Success**: Display the usage payload including platform, time range, model usage, tool usage, and quota information
- **Failure**: Show the error details and likely cause (missing environment variables, network issues, etc.)

## Supported Platforms

| Platform     | Base URL Pattern                         |
| ------------ | ---------------------------------------- |
| ZHIPU_EN_ZAI | `https://api.z.ai/api/anthropic`         |
| ZHIPU_CN     | `https://open.bigmodel.cn/api/anthropic` |
| MINIMAX_CN   | `https://api.minimax.chat/api/anthropic` |
| MINIMAX_EN   | `https://api.minimax.io/anthropic`       |

## Environment Variables

The script requires these environment variables to be set:

- `ANTHROPIC_AUTH_TOKEN`: Authentication token
- `ANTHROPIC_BASE_URL`: API base URL (determines platform)
