---
name: query-executor
description: Execute usage query scripts to retrieve account information. Supports ZHIPU_EN_ZAI, ZHIPU_CN, MINIMAX_CN, MINIMAX_EN platforms. Only use when invoked by usage-query agent.
allowed-tools: Bash, Read
---

# Query Executor Skill

Execute the query script and return the result.

## Critical constraint

**Run the script exactly once** — regardless of success or failure, execute it once and return the outcome.

## Execution

### Run the query

Use Node.js to execute the script:

```bash
node scripts/query.mjs
```

> If your working directory is elsewhere, `cd` into the plugin root first or use an absolute path:
> `node /absolute/path/to/coding-plan/skills/query-executor/scripts/query.mjs`

### Return the result

After execution, return the result to the caller:

- **Success**: display the usage payload (JSON)
- **Failure**: show the error details and likely cause
