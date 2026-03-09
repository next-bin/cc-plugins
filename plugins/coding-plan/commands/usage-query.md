---
description: Query Coding Plan usage statistics and quota for your account. Supports time range for ZHIPU platforms (e.g., /usage-query 7d for last 7 days)
allowed-tools: ["Bash", "Read", "Skill"]
---

# Usage Query Command

Invoke the `@coding-plan:usage-query` agent to retrieve usage information for the current account.

## Usage

```
/usage-query [timeRange]
```

## Time Range Parameter (ZHIPU platforms only)

| Format | Description | Example |
| ------ | ----------- | ------- |
| `<number>m` | Last N minutes | `30m` = last 30 minutes |
| `<number>h` | Last N hours | `6h` = last 6 hours |
| `<number>d` | Last N days | `7d` = last 7 days |
| `<number>w` | Last N weeks | `2w` = last 2 weeks |
| `<number>M` | Last N months | `3M` = last 3 months |
| `<number>y` | Last N years | `1y` = last 1 year |

## Execution

The agent will:

1. Parse the time range argument (if provided)
2. Call the query-executor skill to run the usage query script
3. Return the usage statistics and quota information
4. Display results in the appropriate language (Chinese for CN platforms, English for others)

## Critical Constraint

**Run the query exactly once** — regardless of success or failure, execute a single query and return the result immediately.
