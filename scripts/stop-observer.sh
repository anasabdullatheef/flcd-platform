#!/bin/bash

# Stop FLCD Development Observer

echo "🛑 Stopping FLCD Development Observer..."

# Check if PID file exists
if [ -f ".observer.pid" ]; then
    OBSERVER_PID=$(cat .observer.pid)
    
    # Check if process is running
    if ps -p $OBSERVER_PID > /dev/null; then
        echo "🔍 Found observer process: $OBSERVER_PID"
        
        # Stop the process
        kill $OBSERVER_PID
        sleep 2
        
        # Force kill if still running
        if ps -p $OBSERVER_PID > /dev/null; then
            echo "🔨 Force stopping observer..."
            kill -9 $OBSERVER_PID
        fi
        
        echo "✅ Observer stopped successfully"
    else
        echo "⚠️  Observer process not found (PID: $OBSERVER_PID)"
    fi
    
    # Remove PID file
    rm .observer.pid
else
    echo "⚠️  No observer PID file found"
fi

# Also stop any Node.js processes that might be the observer
pkill -f "dev-observer.js" 2>/dev/null && echo "🧹 Cleaned up any remaining observer processes"

echo "🏁 Observer shutdown complete"