# Opencode UI

![CI](https://github.com/marmotz-dev/opencode-ui/workflows/CI/badge.svg)

Opencode UI is a simple yet powerful desktop client for Opencode, an AI coding agent built for the terminal. It provides a user-friendly interface to interact with Opencode, offering the control and freedom to use any provider, any model, and any editor in a desktop environment.

## Prerequisites

- Opencode must be installed on your system. Visit the [Opencode repository](https://github.com/sst/opencode) for installation instructions.

## Installation

Download and install the appropriate version for your operating system:

### Linux

- **AppImage**: Download the latest AppImage from the [releases page](https://github.com/marmotz-dev/opencode-ui/releases) and run it directly.

### Windows

- Download the `.exe` installer from the [releases page](https://github.com/marmotz-dev/opencode-ui/releases) and follow the setup wizard.

### macOS

- Download the `.dmg` file from the [releases page](https://github.com/marmotz-dev/opencode-ui/releases) and drag the application to your Applications folder.

### Building from Source

To build the project from Git:

1. Clone the repository:

   ```bash
   git clone https://github.com/marmotz-dev/opencode-ui.git
   cd opencode-ui
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Build the application:

   ```bash
   bun run build
   ```

4. Run the application in development mode:
   ```bash
   bun run start
   ```

For production builds:

- Linux: `npm run electron:build:linux`
- Windows: `npm run electron:build:win`
- macOS: `npm run electron:build:mac`

Refer to `package.json` for additional scripts and details.

## Changelog

### [Unreleased]

### [0.1.0] - 2025-10-26

- First early release with basic chat interface and template selection.

## Roadmap

- [ ] Agent Selection
- [ ] Command Usage
- [ ] Tool Messages Improvement
- [ ] File Management
- [ ] Redesign
- [ ] Keyboard Shortcuts Management
- [ ] Project Management
- [ ] Configuration
  - Command Management
  - Agent Management
  - MCP Management
- [ ] i18n
