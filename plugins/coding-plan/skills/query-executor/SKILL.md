---
name: query-executor
description: Execute usage query scripts to retrieve account information. Supports multiple query types (usage, history). Only use when invoked by usage-query agent.
allowed-tools: Bash, Read
---

# Query Executor Skill

Execute the query script and return the result.

## Critical constraint

**Run the script exactly once** — regardless of success or failure, execute it once and return the outcome.

## Execution

### Run the query

Use Node.js to execute the script with optional `--type` parameter:

```bash
node scripts/query.mjs --type=usage
```

Supported query types:

- `usage` (default) - Query usage statistics (model usage, tool usage, quota limit)
- `history` - Query history (placeholder for future)

> If your working directory is elsewhere, `cd` into the plugin root first or use an absolute path:
> `node /absolute/path/to/coding-plan/skills/query-executor/scripts/query.mjs --type=usage`

### Return the result

After execution, return the result to the caller:

- **Success**: display the usage payload (JSON)
- **Failure**: show the error details and likely cause
