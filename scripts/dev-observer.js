#!/usr/bin/env node

/**
 * FLCD Development Observer
 * Watches git commits, file changes, and Claude activity to auto-update GitHub progress
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chokidar = require('chokidar');

class FLCDObserver {
    constructor() {
        this.projectRoot = process.cwd();
        this.lastCommit = null;
        this.activeIssues = new Map();
        this.fileWatchers = new Map();
        this.claudeSession = {
            active: false,
            currentTask: null,
            startTime: null,
            progressUpdates: []
        };
        
        console.log('🔍 FLCD Development Observer Starting...');
        this.initialize();
    }

    initialize() {
        this.loadActiveIssues();
        this.setupGitWatcher();
        this.setupFileWatcher();
        this.setupClaudeDetection();
        this.startPeriodicUpdates();
        
        console.log('✅ Observer initialized successfully');
        console.log('👀 Watching for development activity...');
    }

    // Load active GitHub issues and map to files
    loadActiveIssues() {
        try {
            const issues = this.getGitHubIssues();
            issues.forEach(issue => {
                this.activeIssues.set(issue.number, {
                    title: issue.title,
                    labels: issue.labels,
                    assignee: issue.assignee,
                    progress: 0,
                    lastUpdate: new Date(),
                    files: this.mapIssueToFiles(issue)
                });
            });
            console.log(`📋 Loaded ${this.activeIssues.size} active issues`);
        } catch (error) {
            console.log('⚠️  Could not load GitHub issues:', error.message);
        }
    }

    // Map GitHub issues to file patterns
    mapIssueToFiles(issue) {
        const fileMap = {
            'Authentication': ['src/routes/auth.ts', 'src/middleware/auth.ts', 'src/services/auth.ts'],
            'Rider Management': ['src/routes/riders.ts', 'src/controllers/riders.ts', 'src/models/rider.ts'],
            'Mobile App': ['flcd-mobile/**/*.kt', 'flcd-mobile/**/*.xml'],
            'Frontend': ['flcd-frontend/**/*.tsx', 'flcd-frontend/**/*.ts'],
            'Database': ['prisma/schema.prisma', 'prisma/migrations/**'],
            'Financial': ['src/routes/financial.ts', 'src/controllers/earnings.ts'],
            'Vehicle': ['src/routes/vehicles.ts', 'src/controllers/vehicles.ts'],
            'Location': ['src/services/location.ts', 'flcd-mobile/**/location/**'],
        };

        for (const [keyword, files] of Object.entries(fileMap)) {
            if (issue.title.includes(keyword)) {
                return files;
            }
        }
        return [];
    }

    // Watch for git commits and auto-update issues
    setupGitWatcher() {
        setInterval(() => {
            try {
                const latestCommit = execSync('git log -1 --format="%H|%s|%an|%ad"', { encoding: 'utf8' }).trim();
                
                if (latestCommit !== this.lastCommit) {
                    this.lastCommit = latestCommit;
                    const [hash, message, author, date] = latestCommit.split('|');
                    
                    console.log(`📝 New commit detected: ${message} by ${author}`);
                    this.processCommit(hash, message, author, date);
                }
            } catch (error) {
                // Git not available or no commits
            }
        }, 10000); // Check every 10 seconds
    }

    // Process git commit and update related issues
    processCommit(hash, message, author, date) {
        // Extract issue numbers from commit message
        const issueMatches = message.match(/#(\d+)/g) || [];
        const issueNumbers = issueMatches.map(match => parseInt(match.replace('#', '')));

        // Analyze commit for progress indicators
        const progressIndicators = this.analyzeCommitProgress(message);
        
        // Get changed files
        const changedFiles = this.getChangedFiles(hash);
        
        // Update related issues
        issueNumbers.forEach(issueNum => {
            this.updateIssueProgress(issueNum, progressIndicators, changedFiles, author);
        });

        // Auto-detect issues from changed files
        this.autoDetectIssuesFromFiles(changedFiles, progressIndicators, author);
    }

    // Analyze commit message for progress indicators
    analyzeCommitProgress(message) {
        const indicators = {
            type: 'unknown',
            completion: 0,
            keywords: []
        };

        // Determine commit type
        if (message.includes('feat:') || message.includes('add:')) {
            indicators.type = 'feature';
            indicators.completion = 25;
        } else if (message.includes('fix:') || message.includes('resolve:')) {
            indicators.type = 'bugfix';
            indicators.completion = 15;
        } else if (message.includes('complete:') || message.includes('finish:')) {
            indicators.type = 'completion';
            indicators.completion = 50;
        } else if (message.includes('wip:') || message.includes('progress:')) {
            indicators.type = 'progress';
            indicators.completion = 10;
        }

        // Extract keywords
        const keywords = ['auth', 'rider', 'mobile', 'frontend', 'database', 'api', 'ui'];
        keywords.forEach(keyword => {
            if (message.toLowerCase().includes(keyword)) {
                indicators.keywords.push(keyword);
            }
        });

        return indicators;
    }

    // Get files changed in a commit
    getChangedFiles(hash) {
        try {
            const files = execSync(`git diff-tree --no-commit-id --name-only -r ${hash}`, { encoding: 'utf8' });
            return files.trim().split('\n').filter(f => f);
        } catch (error) {
            return [];
        }
    }

    // Watch for file changes during development
    setupFileWatcher() {
        const watcher = chokidar.watch([
            'flcd-backend/src/**/*',
            'flcd-frontend/**/*',
            'flcd-mobile/**/*',
            'prisma/**/*',
            'DEVELOPER_STATUS.md',
            'FILE_LOCKS.md'
        ], {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: true
        });

        watcher.on('change', (filePath) => {
            console.log(`📁 File changed: ${filePath}`);
            this.handleFileChange(filePath);
        });

        console.log('👀 File watcher initialized');
    }

    // Handle individual file changes
    handleFileChange(filePath) {
        // Check if this is a status file update
        if (filePath.includes('DEVELOPER_STATUS.md')) {
            this.processStatusUpdate();
            return;
        }

        if (filePath.includes('FILE_LOCKS.md')) {
            this.processFileLockUpdate();
            return;
        }

        // Find related issues for this file
        const relatedIssues = this.findIssuesForFile(filePath);
        relatedIssues.forEach(issueNum => {
            this.recordFileActivity(issueNum, filePath);
        });
    }

    // Detect Claude usage and track sessions
    setupClaudeDetection() {
        // Watch for Claude-specific patterns
        setInterval(() => {
            this.detectClaudeActivity();
        }, 30000); // Check every 30 seconds
    }

    // Detect if Claude is being used
    detectClaudeActivity() {
        try {
            // Check for Claude Code process
            const processes = execSync('ps aux | grep -i claude || true', { encoding: 'utf8' });
            const claudeActive = processes.includes('claude') && !processes.includes('grep');
            
            if (claudeActive && !this.claudeSession.active) {
                this.startClaudeSession();
            } else if (!claudeActive && this.claudeSession.active) {
                this.endClaudeSession();
            }

            // Check for typical Claude development patterns
            this.checkClaudePatterns();
        } catch (error) {
            // Process checking failed
        }
    }

    // Start tracking Claude session
    startClaudeSession() {
        this.claudeSession = {
            active: true,
            startTime: new Date(),
            progressUpdates: []
        };
        console.log('🤖 Claude session detected - starting enhanced tracking');
        this.updateDeveloperStatus('Claude session active');
    }

    // End Claude session tracking
    endClaudeSession() {
        console.log('🤖 Claude session ended');
        this.claudeSession.active = false;
        this.summarizeClaudeSession();
    }

    // Check for Claude development patterns
    checkClaudePatterns() {
        // Look for rapid file changes (typical of Claude development)
        const recentCommits = this.getRecentCommits(5);
        const claudePatterns = recentCommits.filter(commit => 
            commit.includes('feat:') || 
            commit.includes('implement') ||
            commit.includes('add') ||
            commit.includes('create')
        );

        if (claudePatterns.length >= 2) {
            this.claudeSession.currentTask = this.detectCurrentTask(claudePatterns);
        }
    }

    // Auto-update GitHub issues based on activity
    updateIssueProgress(issueNum, progressIndicators, changedFiles, author) {
        if (!this.activeIssues.has(issueNum)) return;

        const issue = this.activeIssues.get(issueNum);
        issue.progress += progressIndicators.completion;
        issue.progress = Math.min(issue.progress, 100); // Cap at 100%
        issue.lastUpdate = new Date();

        // Create progress comment on GitHub
        const comment = this.generateProgressComment(progressIndicators, changedFiles, author);
        this.postGitHubComment(issueNum, comment);

        console.log(`📈 Issue #${issueNum} progress updated: ${issue.progress}%`);
    }

    // Generate automatic progress comment
    generateProgressComment(progressIndicators, changedFiles, author) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const fileList = changedFiles.slice(0, 5).map(f => `- \`${f}\``).join('\n');
        
        return `**[${timestamp}] Automatic Progress Update**

🤖 **Developer**: ${author}
📝 **Activity**: ${progressIndicators.type} (+${progressIndicators.completion}% progress)
📁 **Files Modified**:
${fileList}
${changedFiles.length > 5 ? `\n...and ${changedFiles.length - 5} more files` : ''}

🔍 **Detection**: Auto-tracked by FLCD Observer
⚡ **Next Update**: Continuous monitoring active`;
    }

    // Post comment to GitHub issue
    postGitHubComment(issueNum, comment) {
        try {
            execSync(`gh issue comment ${issueNum} --body "${comment.replace(/"/g, '\\"')}"`, { stdio: 'ignore' });
            console.log(`💬 Posted progress comment to issue #${issueNum}`);
        } catch (error) {
            console.log(`⚠️  Failed to post comment to issue #${issueNum}`);
        }
    }

    // Update DEVELOPER_STATUS.md automatically
    updateDeveloperStatus(activity) {
        try {
            const statusFile = path.join(this.projectRoot, 'DEVELOPER_STATUS.md');
            let content = fs.readFileSync(statusFile, 'utf8');
            
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
            const updateLine = `- **Last Update**: ${timestamp} GMT - ${activity}`;
            
            // Find and update the appropriate developer section
            // This is a simplified version - could be more sophisticated
            content = content.replace(
                /- \*\*Last Update\*\*: .*/g, 
                updateLine
            );
            
            fs.writeFileSync(statusFile, content);
            console.log('📊 Developer status updated automatically');
        } catch (error) {
            console.log('⚠️  Could not update developer status');
        }
    }

    // Start periodic status updates
    startPeriodicUpdates() {
        // Update GitHub progress every 5 minutes during active development
        setInterval(() => {
            if (this.claudeSession.active) {
                this.pushPeriodicUpdate();
            }
        }, 300000); // 5 minutes
    }

    // Push periodic update during active development
    pushPeriodicUpdate() {
        const activity = this.detectCurrentActivity();
        if (activity) {
            this.updateDeveloperStatus(activity);
            console.log('⏰ Periodic status update pushed');
        }
    }

    // Utility functions
    getGitHubIssues() {
        try {
            const output = execSync('gh issue list --json number,title,labels,assignees', { encoding: 'utf8' });
            return JSON.parse(output);
        } catch (error) {
            return [];
        }
    }

    getRecentCommits(count) {
        try {
            const output = execSync(`git log -${count} --format="%s"`, { encoding: 'utf8' });
            return output.trim().split('\n');
        } catch (error) {
            return [];
        }
    }

    findIssuesForFile(filePath) {
        const relatedIssues = [];
        this.activeIssues.forEach((issue, issueNum) => {
            if (issue.files.some(pattern => {
                if (pattern.includes('**')) {
                    // Simple glob pattern matching
                    const regex = pattern.replace('**', '.*').replace('*', '[^/]*');
                    return new RegExp(regex).test(filePath);
                }
                return filePath.includes(pattern);
            })) {
                relatedIssues.push(issueNum);
            }
        });
        return relatedIssues;
    }

    detectCurrentActivity() {
        // Detect what the developer is currently working on
        try {
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            if (gitStatus.trim()) {
                return 'Active development - files modified';
            }
        } catch (error) {
            // Git not available
        }
        return null;
    }

    // Handle shutdown gracefully
    shutdown() {
        console.log('🛑 FLCD Observer shutting down...');
        if (this.claudeSession.active) {
            this.endClaudeSession();
        }
        process.exit(0);
    }
}

// Start the observer
if (require.main === module) {
    const observer = new FLCDObserver();
    
    // Handle shutdown signals
    process.on('SIGINT', () => observer.shutdown());
    process.on('SIGTERM', () => observer.shutdown());
    
    console.log('🚀 FLCD Development Observer is running...');
    console.log('Press Ctrl+C to stop');
}

module.exports = FLCDObserver;