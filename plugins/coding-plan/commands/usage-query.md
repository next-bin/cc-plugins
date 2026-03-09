---
description: Query Coding Plan usage statistics and quota for your account
allowed-tools: ["Bash", "Read", "Skill"]
---

# Usage Query Command

Invoke the `@coding-plan:usage-query` agent to retrieve usage information for the current account.

## Execution

The agent will:

1. Call the query-executor skill to run the usage query script
2. Return the usage statistics and quota information
3. Display results in the appropriate language (Chinese for CN platforms, English for others)

## Critical Constraint

**Run the query exactly once** — regardless of success or failure, execute a single query and return the result immediately.
