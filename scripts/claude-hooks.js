#!/usr/bin/env node

/**
 * Claude Integration Hooks
 * Automatically detects Claude usage and reports progress to GitHub
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ClaudeHooks {
    constructor() {
        this.hookFile = path.join(process.cwd(), '.claude-session');
        this.projectRoot = process.cwd();
        this.currentIssue = null;
        this.sessionStart = null;
        this.progressLog = [];
        
        this.initialize();
    }

    initialize() {
        console.log('🤖 Claude Hooks initialized');
        
        // Create session tracking file
        this.createSessionFile();
        
        // Set up automatic hooks
        this.setupGitHooks();
        this.setupClaudeDetection();
        
        console.log('✅ Claude integration ready');
    }

    // Create session tracking file
    createSessionFile() {
        const sessionData = {
            active: true,
            startTime: new Date().toISOString(),
            currentTask: null,
            issueNumber: null,
            progressUpdates: []
        };
        
        fs.writeFileSync(this.hookFile, JSON.stringify(sessionData, null, 2));
        console.log('📝 Claude session file created');
    }

    // Set up Git hooks to detect Claude commits
    setupGitHooks() {
        const gitHooksDir = path.join(this.projectRoot, '.git', 'hooks');
        
        if (!fs.existsSync(gitHooksDir)) {
            console.log('⚠️  Git hooks directory not found');
            return;
        }

        // Create post-commit hook
        const postCommitHook = `#!/bin/sh
# Auto-generated Claude hook
node ${__filename} post-commit "$@"
`;

        const hookPath = path.join(gitHooksDir, 'post-commit');
        fs.writeFileSync(hookPath, postCommitHook);
        fs.chmodSync(hookPath, 0o755);
        
        console.log('🔗 Git post-commit hook installed');
    }

    // Handle post-commit events
    handlePostCommit() {
        try {
            const commitMessage = execSync('git log -1 --format="%s"', { encoding: 'utf8' }).trim();
            const commitFiles = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf8' }).trim().split('\n');
            
            console.log(`📝 Post-commit: ${commitMessage}`);
            
            // Analyze commit for Claude patterns
            const claudePattern = this.detectClaudeCommit(commitMessage, commitFiles);
            
            if (claudePattern) {
                this.reportClaudeProgress(commitMessage, commitFiles, claudePattern);
            }
        } catch (error) {
            console.log('⚠️  Error in post-commit hook:', error.message);
        }
    }

    // Detect if commit was made by Claude
    detectClaudeCommit(message, files) {
        const claudeIndicators = {
            isClaudeCommit: false,
            confidence: 0,
            patterns: [],
            issueNumber: null,
            progressType: 'unknown'
        };

        // Check for Claude-specific patterns
        const claudePatterns = [
            'feat:', 'fix:', 'add:', 'implement', 'create', 'update',
            'refactor:', 'optimize:', 'enhance:', 'complete:'
        ];

        const claudeKeywords = claudePatterns.filter(pattern => 
            message.toLowerCase().includes(pattern.toLowerCase())
        );

        if (claudeKeywords.length > 0) {
            claudeIndicators.isClaudeCommit = true;
            claudeIndicators.confidence += 30;
            claudeIndicators.patterns = claudeKeywords;
        }

        // Check for multiple files (typical of Claude bulk operations)
        if (files.length > 3) {
            claudeIndicators.confidence += 20;
        }

        // Check for issue references
        const issueMatch = message.match(/#(\d+)/);
        if (issueMatch) {
            claudeIndicators.issueNumber = parseInt(issueMatch[1]);
            claudeIndicators.confidence += 25;
        }

        // Determine progress type
        if (message.includes('complete') || message.includes('finish')) {
            claudeIndicators.progressType = 'completion';
            claudeIndicators.confidence += 15;
        } else if (message.includes('feat:') || message.includes('add:')) {
            claudeIndicators.progressType = 'feature';
            claudeIndicators.confidence += 10;
        } else if (message.includes('fix:')) {
            claudeIndicators.progressType = 'bugfix';
            claudeIndicators.confidence += 10;
        }

        // Consider it a Claude commit if confidence > 50
        claudeIndicators.isClaudeCommit = claudeIndicators.confidence > 50;

        return claudeIndicators.isClaudeCommit ? claudeIndicators : null;
    }

    // Report Claude progress to GitHub
    reportClaudeProgress(commitMessage, files, pattern) {
        console.log('🤖 Claude activity detected - reporting progress...');
        
        // Update session file
        this.updateSessionFile(commitMessage, pattern);
        
        // Auto-update GitHub issue if detected
        if (pattern.issueNumber) {
            this.updateGitHubIssue(pattern.issueNumber, commitMessage, files, pattern);
        } else {
            // Try to auto-detect issue from files
            const detectedIssue = this.autoDetectIssue(files);
            if (detectedIssue) {
                this.updateGitHubIssue(detectedIssue, commitMessage, files, pattern);
            }
        }
        
        // Update developer status
        this.updateDeveloperStatus(pattern.progressType, commitMessage);
    }

    // Update Claude session file
    updateSessionFile(commitMessage, pattern) {
        try {
            const sessionData = JSON.parse(fs.readFileSync(this.hookFile, 'utf8'));
            
            sessionData.progressUpdates.push({
                timestamp: new Date().toISOString(),
                commit: commitMessage,
                progressType: pattern.progressType,
                confidence: pattern.confidence,
                issueNumber: pattern.issueNumber
            });
            
            // Keep only last 10 updates
            if (sessionData.progressUpdates.length > 10) {
                sessionData.progressUpdates = sessionData.progressUpdates.slice(-10);
            }
            
            fs.writeFileSync(this.hookFile, JSON.stringify(sessionData, null, 2));
        } catch (error) {
            console.log('⚠️  Could not update session file');
        }
    }

    // Update GitHub issue with Claude progress
    updateGitHubIssue(issueNumber, commitMessage, files, pattern) {
        try {
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
            const fileList = files.slice(0, 5).map(f => `- \`${f}\``).join('\n');
            
            const progressComment = `**[${timestamp}] 🤖 Claude Development Update**

**Commit**: ${commitMessage}
**Progress Type**: ${pattern.progressType} (confidence: ${pattern.confidence}%)
**Files Modified**:
${fileList}
${files.length > 5 ? `\n...and ${files.length - 5} more files` : ''}

**Detected Patterns**: ${pattern.patterns.join(', ')}
⚡ **Auto-tracked by Claude Hooks**`;

            execSync(`gh issue comment ${issueNumber} --body "${progressComment.replace(/"/g, '\\"')}"`, { stdio: 'ignore' });
            console.log(`💬 Auto-updated issue #${issueNumber} with Claude progress`);
            
            // Also update issue progress estimate
            this.updateIssueProgress(issueNumber, pattern.progressType);
            
        } catch (error) {
            console.log(`⚠️  Failed to update issue #${issueNumber}:`, error.message);
        }
    }

    // Update issue progress based on activity type
    updateIssueProgress(issueNumber, progressType) {
        const progressMap = {
            'feature': 25,
            'bugfix': 15,
            'completion': 50,
            'unknown': 10
        };

        const progressIncrease = progressMap[progressType] || 10;
        
        // Add progress label or comment
        try {
            const progressComment = `**📈 Progress Update**: +${progressIncrease}% (${progressType})`;
            execSync(`gh issue comment ${issueNumber} --body "${progressComment}"`, { stdio: 'ignore' });
        } catch (error) {
            // Silent fail for progress updates
        }
    }

    // Auto-detect issue from modified files
    autoDetectIssue(files) {
        const fileToIssueMap = {
            'auth': 1,
            'rider': 2, 
            'mobile': 3,
            'frontend': 7,
            'financial': 8,
            'vehicle': 6,
            'location': 5
        };

        for (const file of files) {
            for (const [keyword, issueNum] of Object.entries(fileToIssueMap)) {
                if (file.toLowerCase().includes(keyword)) {
                    return issueNum;
                }
            }
        }
        return null;
    }

    // Update developer status file
    updateDeveloperStatus(progressType, commitMessage) {
        try {
            const statusFile = path.join(this.projectRoot, 'DEVELOPER_STATUS.md');
            const content = fs.readFileSync(statusFile, 'utf8');
            
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
            const statusLine = `- **Last Update**: ${timestamp} GMT - 🤖 Claude: ${progressType} (${commitMessage.substring(0, 50)}...)`;
            
            const updatedContent = content.replace(
                /- \*\*Last Update\*\*: .*/g,
                statusLine
            );
            
            fs.writeFileSync(statusFile, updatedContent);
            console.log('📊 Developer status auto-updated');
        } catch (error) {
            console.log('⚠️  Could not update developer status');
        }
    }

    // Setup continuous Claude detection
    setupClaudeDetection() {
        // Watch for changes that indicate Claude is active
        setInterval(() => {
            this.checkClaudeActivity();
        }, 60000); // Check every minute
    }

    // Check if Claude is currently active
    checkClaudeActivity() {
        try {
            // Check for recent git activity
            const recentActivity = execSync('git log --since="5 minutes ago" --format="%s"', { encoding: 'utf8' });
            
            if (recentActivity.trim()) {
                this.markClaudeActive();
            }
        } catch (error) {
            // No recent activity
        }
    }

    // Mark Claude as currently active
    markClaudeActive() {
        try {
            const sessionData = JSON.parse(fs.readFileSync(this.hookFile, 'utf8'));
            sessionData.lastActivity = new Date().toISOString();
            fs.writeFileSync(this.hookFile, JSON.stringify(sessionData, null, 2));
        } catch (error) {
            // Silent fail
        }
    }

    // Get session summary
    getSessionSummary() {
        try {
            const sessionData = JSON.parse(fs.readFileSync(this.hookFile, 'utf8'));
            return {
                duration: Date.now() - new Date(sessionData.startTime).getTime(),
                updates: sessionData.progressUpdates.length,
                lastActivity: sessionData.lastActivity
            };
        } catch (error) {
            return null;
        }
    }
}

// Handle command line usage
if (require.main === module) {
    const hooks = new ClaudeHooks();
    
    const command = process.argv[2];
    
    if (command === 'post-commit') {
        hooks.handlePostCommit();
    } else if (command === 'summary') {
        const summary = hooks.getSessionSummary();
        if (summary) {
            console.log('📊 Claude Session Summary:');
            console.log(`⏱️  Duration: ${Math.round(summary.duration / 60000)} minutes`);
            console.log(`📝 Updates: ${summary.updates}`);
            console.log(`🕒 Last Activity: ${summary.lastActivity}`);
        }
    } else {
        console.log('🤖 Claude Hooks running in background...');
    }
}

module.exports = ClaudeHooks;