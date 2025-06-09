# FLCD Platform Development Scripts
*The Anthropic Way: Intelligent, Thorough, and Reliable*

This directory contains development scripts designed to ensure consistent environments and dependency management across all developer machines.

## Quick Start

```bash
# Set up development environment (one-time setup)
./scripts/setup-dev-environment.sh

# Validate your environment
./scripts/validate-environment.sh

# Create dependency snapshot for team synchronization
./scripts/dependency-lockdown.sh create-snapshot

# Start development servers
./dev-commands.sh start_all
```

## Scripts Overview

### 🚀 setup-dev-environment.sh
**Main environment setup script** - Sets up the entire development environment with dependency validation, PostgreSQL checks, and project initialization.

**Features:**
- ✅ System dependency validation (Node.js, npm, PostgreSQL, Java)
- ✅ Automatic package installation based on OS (macOS/Linux)
- ✅ Project structure validation
- ✅ Backend and frontend dependency installation
- ✅ Environment file creation from templates
- ✅ Health checks and validation
- ✅ Generated helper scripts (dev-commands.sh, validate-environment.sh)
- ✅ Comprehensive logging
- ✅ Cross-platform support (macOS, Ubuntu, other Linux distros)

**Usage:**
```bash
./scripts/setup-dev-environment.sh
```

### 🔒 dependency-lockdown.sh
**Dependency management and synchronization** - Prevents "works on my machine" issues by creating snapshots and validating dependency consistency across team members.

**Features:**
- ✅ Create dependency snapshots with versions and lock file hashes
- ✅ Validate current setup against team snapshots
- ✅ Security vulnerability auditing
- ✅ Outdated package detection
- ✅ Clean installation capabilities
- ✅ Comprehensive dependency reporting
- ✅ Cross-developer comparison

**Commands:**
```bash
# Create a snapshot of current dependencies
./scripts/dependency-lockdown.sh create-snapshot

# Validate against existing snapshot
./scripts/dependency-lockdown.sh validate

# Run security audit
./scripts/dependency-lockdown.sh security-audit

# Check for outdated packages
./scripts/dependency-lockdown.sh check-outdated

# Clean install all dependencies
./scripts/dependency-lockdown.sh clean-install

# Generate comprehensive report
./scripts/dependency-lockdown.sh generate-report

# Compare with another team member's snapshot
./scripts/dependency-lockdown.sh compare path/to/their-snapshot.json
```

## Generated Files

After running the setup script, you'll have these additional helper files:

### 📋 dev-commands.sh
Common development commands for daily workflow:
- `start_backend` - Start backend development server
- `start_frontend` - Start frontend development server  
- `start_all` - Start both servers concurrently
- `migrate_db` - Run database migrations
- `seed_db` - Seed database with initial data
- `run_tests` - Run all tests
- `show_help` - Show available commands

### ✅ validate-environment.sh
Quick environment validation script:
- Checks for required commands (node, npm, psql, git)
- Validates project structure
- Verifies package.json files exist
- Provides pass/fail status

## Dependency Snapshot System

The dependency lockdown system creates detailed snapshots including:

```json
{
  "snapshot_version": "1.0.0",
  "created_at": "2025-06-09T12:25:40.123Z",
  "system_info": {
    "os": "Darwin",
    "arch": "arm64", 
    "hostname": "dev-machine",
    "user": "developer"
  },
  "backend": {
    "node_version": "v18.18.0",
    "npm_version": "9.8.1",
    "lockfile_hash": "sha256hash...",
    "installed_packages": { /* detailed versions */ }
  },
  "frontend": { /* similar structure */ }
}
```

## Team Workflow

### For New Developers
1. Clone the repository
2. Run `./scripts/setup-dev-environment.sh`
3. Get latest dependency snapshot from team lead
4. Run `./scripts/dependency-lockdown.sh validate`

### For Team Leads
1. After major dependency updates, run `./scripts/dependency-lockdown.sh create-snapshot`
2. Share the snapshot file (`.dependency-lockdown/dependency-snapshot.json`) with team
3. Team members validate against this snapshot

### For Daily Development
1. Use `./dev-commands.sh` for common tasks
2. Run `./validate-environment.sh` if experiencing issues
3. Use `./scripts/dependency-lockdown.sh security-audit` regularly

## Troubleshooting

### Common Issues

**"Command not found" errors:**
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x *.sh
```

**Java version warnings:**
```bash
# macOS
brew install openjdk@11

# Ubuntu
sudo apt install openjdk-11-jdk
```

**PostgreSQL connection issues:**
```bash
# macOS
brew services restart postgresql@15

# Ubuntu  
sudo systemctl restart postgresql
```

**Lock file conflicts:**
```bash
# Clean and reinstall
./scripts/dependency-lockdown.sh clean-install
```

## Logs and Debugging

All scripts generate detailed logs:
- Setup logs: `setup-YYYYMMDD-HHMMSS.log`
- Dependency reports: `.dependency-lockdown/dependency-report-*.md`
- Snapshots: `.dependency-lockdown/dependency-snapshot.json`

## The Anthropic Way

These scripts embody Anthropic's principles:
- **Intelligent**: Smart dependency detection and OS-specific handling
- **Thorough**: Comprehensive validation and error checking
- **Reliable**: Consistent results across different machines and environments
- **User-friendly**: Clear output with colors, progress indicators, and helpful messages
- **Team-oriented**: Built for collaboration with snapshot sharing and validation

## Support

If you encounter issues:
1. Check the generated log files
2. Run `./validate-environment.sh` for quick diagnosis
3. Compare your setup with team snapshots
4. Generate a report with `./scripts/dependency-lockdown.sh generate-report`

---

## GitHub Project Automation

### Quick Setup
Run this single command to create the complete GitHub Project setup:

```bash
./scripts/setup-github-project.sh
```

### What it does:
1. ✅ Refreshes GitHub CLI with project permissions
2. ✅ Creates "FLCD Platform Development" project
3. ✅ Adds all 7 existing issues to the project
4. ✅ Provides next steps for manual configuration

### Manual Alternative
If the script doesn't work, follow the detailed instructions in:
- `GITHUB_PROJECTS_SETUP.md`

### Requirements
- GitHub CLI (`gh`) installed
- Repository access permissions
- Project creation permissions on GitHub

### Troubleshooting

**Permission Issues:**
```bash
gh auth refresh -h github.com -s project,read:project
```

**Missing Dependencies:**
```bash
# Install jq for JSON parsing
brew install jq  # macOS
sudo apt install jq  # Ubuntu
```

**Manual Project Creation:**
Visit: https://github.com/anasabdullatheef/flcd-platform/projects