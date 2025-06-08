#!/bin/bash

# FLCD Development Observer Startup Script
# Starts the automated development tracking system

echo "🚀 Starting FLCD Development Observer..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    echo "Please install Node.js first: https://nodejs.org/"
    exit 1
fi

# Install required dependencies
echo "📦 Installing dependencies..."
npm install chokidar --save-dev 2>/dev/null || echo "⚠️  Could not install chokidar - file watching may be limited"

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI not found - some features will be limited"
    echo "Install with: brew install gh (macOS) or https://cli.github.com/"
fi

# Create observer log file
OBSERVER_LOG="observer.log"
echo "📝 Logging to: $OBSERVER_LOG"

# Start the observer in background
echo "🔍 Starting development observer..."
nohup node scripts/dev-observer.js > $OBSERVER_LOG 2>&1 &
OBSERVER_PID=$!

# Store PID for later
echo $OBSERVER_PID > .observer.pid
echo "✅ Observer started with PID: $OBSERVER_PID"

# Initialize Claude hooks
echo "🤖 Setting up Claude integration hooks..."
node scripts/claude-hooks.js

# Show status
echo ""
echo "🎯 FLCD Development Observer is now running!"
echo "===========================================" 
echo "📊 Real-time tracking active for:"
echo "  • Git commits and progress updates"
echo "  • File changes during development"
echo "  • Claude usage detection"
echo "  • Automatic GitHub issue updates"
echo ""
echo "📝 Log file: $OBSERVER_LOG"
echo "🛑 Stop observer: ./scripts/stop-observer.sh"
echo "📈 View status: tail -f $OBSERVER_LOG"
echo ""
echo "🤖 When using Claude, progress will be automatically tracked!"

# Check if observer is running
sleep 2
if ps -p $OBSERVER_PID > /dev/null; then
    echo "✅ Observer is running successfully"
else
    echo "❌ Observer failed to start - check $OBSERVER_LOG for errors"
    exit 1
fi