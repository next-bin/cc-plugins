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
/coding-plan:usage-query [timeRange]
```

## Command Overview

### /usage-query

Retrieve the usage information for the current account.

**Time Range Parameter (ZHIPU platforms only):**

| Format | Description | Example |
| ------ | ----------- | ------- |
| `<number>` | Last N days (default) | `7` = last 7 days |
| `<number>m` | Last N minutes | `30m` = last 30 minutes |
| `<number>h` | Last N hours | `6h` = last 6 hours |
| `<number>d` | Last N days | `7d` = last 7 days |
| `<number>w` | Last N weeks | `2w` = last 2 weeks |
| `<number>M` | Last N months | `3M` = last 3 months |
| `<number>y` | Last N years | `1y` = last 1 year |

**Examples:**

```
/coding-plan:usage-query          # Default 24-hour window
/coding-plan:usage-query 7        # Last 7 days
/coding-plan:usage-query 6h       # Last 6 hours
/coding-plan:usage-query 1M       # Last month
```

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

| Platform     | Base URL Pattern                         | Time Range Support |
| ------------ | ---------------------------------------- | ------------------ |
| ZHIPU_EN_ZAI | `https://api.z.ai/api/anthropic`         | ✅ Yes             |
| ZHIPU_CN     | `https://open.bigmodel.cn/api/anthropic` | ✅ Yes             |
| MINIMAX_CN   | `https://api.minimax.chat/api/anthropic` | ❌ No (uses API window) |
| MINIMAX_EN   | `https://api.minimax.io/anthropic`       | ❌ No (uses API window) |

## Extending the Plugin

To add new platforms:

1. Add platform detection in `getPlatformConfig()` function
2. Add a new query handler function if needed
3. Update the main function to route to your handler

## License

AGPL-3.0
