# FLCD Platform Setup Scripts

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