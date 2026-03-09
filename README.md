# CC-Plugins Marketplace

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A collection of plugins to enhance coding productivity and provide Coding Plan related services for Claude Code.

## Available Plugins

| Plugin          | Description                                      |
| --------------- | ------------------------------------------------ |
| **coding-plan** | Query quota and usage statistics for Coding Plan |

## Prerequisites

- [Node.js](https://nodejs.org/) 22 or higher
- [Claude Code CLI](https://claude.ai/code) version 2.1.71 or later

## Quick Start

> Install the marketplace within Claude Code to access the plugins.

### 1. Install the Marketplace

```shell
claude plugin marketplace add next-bin/cc-plugins
```

### 2. Install Plugins from the Marketplace

```shell
claude plugin install coding-plan@cc-plugins
```

## Using the Plugins

1. Navigate to your project and start Claude Code:

```bash
claude
```

2. Use the installed plugins with the following commands:

```bash
/coding-plan:usage-query
```

## Plugin Details

### coding-plan

Query quota and usage statistics for Coding Plan.

**Features:**

- Model usage statistics
- Tool usage statistics
- Quota limit monitoring

**Requirements:**

- Node.js environment
- Valid `ANTHROPIC_AUTH_TOKEN` environment variable
- Valid `ANTHROPIC_BASE_URL` environment variable (supports Z.ai and ZHIPU platforms)

## Development

### Test Plugins Locally

Use the `--plugin-dir` flag to test plugins during development:

```bash
claude --plugin-dir ./plugins/coding-plan
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Links

- [Claude Code Documentation](https://code.claude.com/docs)
- [Claude Code Plugins Guide](https://code.claude.com/docs/en/plugins)
