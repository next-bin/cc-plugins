---
name: query-executor
description: This skill should be used when the usage-query agent needs to run the actual usage query. Execute the query script to retrieve account information for ZHIPU_EN_ZAI, ZHIPU_CN, MINIMAX_CN, MINIMAX_EN platforms.
---

# Query Executor Skill

Execute the query script and return the result.

## Critical Constraint

**Run the script exactly once** — regardless of success or failure, execute it once and return the outcome.

## Execution

### Run the query

Use Node.js to execute the script from the plugin root:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/query-executor/scripts/query.mjs
```

Or if working directory is already the skill folder:

```bash
node scripts/query.mjs
```

### Return the result

After execution, return the result to the caller:

- **Success**: Display the usage payload including platform, model usage, tool usage, and quota information
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
