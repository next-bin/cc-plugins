# Coding Plan Plugin

Query quota and usage statistics for Coding Plan.

## Prerequisites

- This plugin is designed to work specifically with the Coding Plan in Claude Code.
- This plugin requires Node.js 22 or higher to be installed in your environment.

## Installation

Install from the cc-plugins marketplace:

```shell
claude plugin install coding-plan@cc-plugins
```

## Usage

In Claude Code, run:

```
/coding-plan:usage-query
```

## Command Overview

### /usage-query

Retrieve the usage information for the current account.

**Execution flow:**

1. Command `/usage-query` triggers `@coding-plan:usage-query`
2. The agent invokes `@coding-plan:query-executor`
3. The skill executes the query script with `--type=usage`
4. The skill returns either the successful response or the failure reason

**Important constraint:** Run the query exactly once and return immediately whether it succeeds or fails.

## Environment Variables

| Variable               | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `ANTHROPIC_AUTH_TOKEN` | Authentication token (required)                   |
| `ANTHROPIC_BASE_URL`   | API base URL (required) - supports Z.ai and ZHIPU |

## Supported Platforms

| Platform | Base URL Pattern                         |
| -------- | ---------------------------------------- |
| Z.ai     | `https://api.z.ai/api/anthropic`         |
| ZHIPU    | `https://open.bigmodel.cn/api/anthropic` |

## Extending the Plugin

To add new query types:

1. Add a new handler function in `skills/query-executor/scripts/query.mjs`
2. Register it in the `queryHandlers` object
3. Create a new command and agent if needed

## License

AGPL-3.0
