---
name: query-executor
description: Execute the query script to retrieve Coding Plan usage for ZHIPU_EN_ZAI, ZHIPU_CN, MINIMAX_CN, MINIMAX_EN platforms. The timeRange argument is optional - if provided, use one of these EXACT formats: "7" (7 days), "30m" (30 minutes), "6h" (6 hours), "7d" (7 days), "2w" (2 weeks), "3M" (3 months), "1y" (1 year). Do NOT include brackets or quotes - just pass the raw value like: 7, 30m, 6h, 7d, 2w, 3M, 1y. If no time range needed, omit the argument entirely.
argument-hint: "[timeRange]"
---

# Query Executor Skill

Execute the query script and return the result.

## Critical Constraint

**Run the script exactly once** — regardless of success or failure, execute it once and return the outcome.

## Execution

### How to Pass Time Range Argument

**IMPORTANT**: The timeRange is passed as a command-line argument WITHOUT brackets or quotes.

**Correct examples:**

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs 7
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs 30m
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs 6h
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs 2w
```

**Incorrect (DO NOT do this):**

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs [timeRange]  # WRONG
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs "7"          # WRONG
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs [7]          # WRONG
```

### No Time Range (Default 24-hour window)

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs
```

### Time Range Formats (ZHIPU platforms only)

| Argument | Meaning         | Example Usage       |
| -------- | --------------- | ------------------- |
| `7`      | Last 7 days     | `.../query.mjs 7`   |
| `30m`    | Last 30 minutes | `.../query.mjs 30m` |
| `6h`     | Last 6 hours    | `.../query.mjs 6h`  |
| `7d`     | Last 7 days     | `.../query.mjs 7d`  |
| `2w`     | Last 2 weeks    | `.../query.mjs 2w`  |
| `3M`     | Last 3 months   | `.../query.mjs 3M`  |
| `1y`     | Last 1 year     | `.../query.mjs 1y`  |

**Note**: MiniMax platforms do not support custom time ranges - omit the argument for MiniMax.

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
