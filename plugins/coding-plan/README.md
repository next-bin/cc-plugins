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
3. The skill executes the query script
4. The skill returns either the successful response or the failure reason

**Important constraint:** Run the query exactly once and return immediately whether it succeeds or fails.

## Environment Variables

| Variable               | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `ANTHROPIC_AUTH_TOKEN` | Authentication token (required)                                          |
| `ANTHROPIC_BASE_URL`   | API base URL (required) - supports ZHIPU_EN_ZAI, ZHIPU_CN, MiniMax CN/EN |

## Supported Platforms

| Platform     | Base URL Pattern                         |
| ------------ | ---------------------------------------- |
| ZHIPU_EN_ZAI | `https://api.z.ai/api/anthropic`         |
| ZHIPU_CN     | `https://open.bigmodel.cn/api/anthropic` |
| MINIMAX_CN   | `https://api.minimax.chat/api/anthropic` |
| MINIMAX_EN   | `https://api.minimax.io/anthropic`       |

## Extending the Plugin

To add new platforms:

1. Add platform detection in `getPlatformConfig()` function
2. Add a new query handler function if needed
3. Update the main function to route to your handler

## License

AGPL-3.0
