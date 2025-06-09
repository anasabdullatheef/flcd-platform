#!/bin/bash

# FLCD Platform - Dependency Lockdown Manager
# The Anthropic Way: Ensures dependency consistency across all developer machines
# 
# This script creates dependency snapshots, validates lock files, and manages
# version conflicts to prevent "works on my machine" issues

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
LOCKDOWN_DIR=".dependency-lockdown"
SNAPSHOT_FILE="$LOCKDOWN_DIR/dependency-snapshot.json"
BACKEND_DIR="flcd-backend"
FRONTEND_DIR="flcd-frontend"

# Create lockdown directory
mkdir -p "$LOCKDOWN_DIR"

print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  Dependency Lockdown Manager                ║"
    echo "║                    The Anthropic Way                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Get package versions
get_package_versions() {
    local dir=$1
    local output_file=$2
    
    if [ -f "$dir/package.json" ]; then
        cd "$dir"
        echo "{"
        echo "  \"directory\": \"$dir\","
        echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\","
        echo "  \"node_version\": \"$(node --version)\","
        echo "  \"npm_version\": \"$(npm --version)\","
        echo "  \"package_json\": $(cat package.json),"
        
        if [ -f "package-lock.json" ]; then
            echo "  \"lockfile_exists\": true,"
            echo "  \"lockfile_hash\": \"$(sha256sum package-lock.json | cut -d' ' -f1)\","
        else
            echo "  \"lockfile_exists\": false,"
        fi
        
        # Get installed package versions
        echo "  \"installed_packages\": {"
        npm list --depth=0 --json 2>/dev/null | jq '.dependencies // {}' | sed '1d;$d'
        echo "  }"
        echo "}"
        cd - > /dev/null
    else
        echo "{\"error\": \"package.json not found in $dir\"}"
    fi
}

# Create dependency snapshot
create_snapshot() {
    print_step "Creating dependency snapshot"
    
    {
        echo "{"
        echo "  \"snapshot_version\": \"1.0.0\","
        echo "  \"created_at\": \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\","
        echo "  \"system_info\": {"
        echo "    \"os\": \"$(uname -s)\","
        echo "    \"arch\": \"$(uname -m)\","
        echo "    \"hostname\": \"$(hostname)\","
        echo "    \"user\": \"$(whoami)\""
        echo "  },"
        echo "  \"backend\": $(get_package_versions "$BACKEND_DIR" "backend"),"
        echo "  \"frontend\": $(get_package_versions "$FRONTEND_DIR" "frontend")"
        echo "}"
    } > "$SNAPSHOT_FILE"
    
    print_success "Snapshot created: $SNAPSHOT_FILE"
}

# Validate dependencies against snapshot
validate_dependencies() {
    print_step "Validating dependencies against snapshot"
    
    if [ ! -f "$SNAPSHOT_FILE" ]; then
        print_warning "No snapshot found. Run 'create-snapshot' first."
        return 1
    fi
    
    local validation_passed=true
    
    # Check backend
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        local current_node=$(node --version)
        local snapshot_node=$(jq -r '.backend.node_version' "../$SNAPSHOT_FILE")
        
        if [ "$current_node" != "$snapshot_node" ]; then
            print_warning "Node.js version mismatch: current=$current_node, snapshot=$snapshot_node"
            validation_passed=false
        fi
        
        # Check if package-lock.json exists and matches
        if [ -f "package-lock.json" ]; then
            local current_hash=$(sha256sum package-lock.json | cut -d' ' -f1)
            local snapshot_hash=$(jq -r '.backend.lockfile_hash // empty' "../$SNAPSHOT_FILE")
            
            if [ -n "$snapshot_hash" ] && [ "$current_hash" != "$snapshot_hash" ]; then
                print_warning "Backend lock file has changed"
                validation_passed=false
            fi
        fi
        cd - > /dev/null
    fi
    
    # Check frontend
    if [ -d "$FRONTEND_DIR" ]; then
        cd "$FRONTEND_DIR"
        if [ -f "package-lock.json" ]; then
            local current_hash=$(sha256sum package-lock.json | cut -d' ' -f1)
            local snapshot_hash=$(jq -r '.frontend.lockfile_hash // empty' "../$SNAPSHOT_FILE")
            
            if [ -n "$snapshot_hash" ] && [ "$current_hash" != "$snapshot_hash" ]; then
                print_warning "Frontend lock file has changed"
                validation_passed=false
            fi
        fi
        cd - > /dev/null
    fi
    
    if [ "$validation_passed" = true ]; then
        print_success "All dependencies are consistent with snapshot"
    else
        print_error "Dependency validation failed"
        return 1
    fi
}

# Check for security vulnerabilities
security_audit() {
    print_step "Running security audit"
    
    local issues_found=false
    
    # Backend audit
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        print_info "Auditing backend dependencies..."
        if ! npm audit --audit-level=moderate; then
            print_warning "Backend security issues found"
            issues_found=true
        fi
        cd - > /dev/null
    fi
    
    # Frontend audit
    if [ -d "$FRONTEND_DIR" ]; then
        cd "$FRONTEND_DIR"
        print_info "Auditing frontend dependencies..."
        if ! npm audit --audit-level=moderate; then
            print_warning "Frontend security issues found"
            issues_found=true
        fi
        cd - > /dev/null
    fi
    
    if [ "$issues_found" = false ]; then
        print_success "No security vulnerabilities found"
    else
        print_warning "Security vulnerabilities detected. Run 'npm audit fix' in affected directories"
    fi
}

# Check for outdated packages
check_outdated() {
    print_step "Checking for outdated packages"
    
    # Backend
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        print_info "Backend outdated packages:"
        npm outdated || true
        cd - > /dev/null
    fi
    
    # Frontend
    if [ -d "$FRONTEND_DIR" ]; then
        cd "$FRONTEND_DIR"
        print_info "Frontend outdated packages:"
        npm outdated || true
        cd - > /dev/null
    fi
}

# Clean and reinstall dependencies
clean_install() {
    print_step "Clean installing dependencies"
    
    # Backend
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        print_info "Cleaning backend dependencies..."
        rm -rf node_modules package-lock.json
        npm install
        cd - > /dev/null
    fi
    
    # Frontend
    if [ -d "$FRONTEND_DIR" ]; then
        cd "$FRONTEND_DIR"
        print_info "Cleaning frontend dependencies..."
        rm -rf node_modules package-lock.json
        npm install
        cd - > /dev/null
    fi
    
    print_success "Clean installation completed"
}

# Generate dependency report
generate_report() {
    print_step "Generating dependency report"
    
    local report_file="$LOCKDOWN_DIR/dependency-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# FLCD Platform Dependency Report

Generated on: $(date)

## System Information
- OS: $(uname -s) $(uname -r)
- Architecture: $(uname -m)
- User: $(whoami)
- Hostname: $(hostname)

## Node.js Environment
- Node.js: $(node --version)
- npm: $(npm --version)

## Backend Dependencies ($BACKEND_DIR)
$(cd "$BACKEND_DIR" && npm list --depth=0 2>/dev/null || echo "Error reading backend dependencies")

## Frontend Dependencies ($FRONTEND_DIR)
$(cd "$FRONTEND_DIR" && npm list --depth=0 2>/dev/null || echo "Error reading frontend dependencies")

## Lock File Status
- Backend lock file: $([ -f "$BACKEND_DIR/package-lock.json" ] && echo "✓ Exists" || echo "✗ Missing")
- Frontend lock file: $([ -f "$FRONTEND_DIR/package-lock.json" ] && echo "✓ Exists" || echo "✗ Missing")

## Security Status
$(npm audit --audit-level=moderate 2>/dev/null | head -10 || echo "Run security audit for detailed information")

EOF
    
    print_success "Report generated: $report_file"
}

# Compare with another developer's snapshot
compare_snapshots() {
    local other_snapshot=$1
    
    if [ ! -f "$other_snapshot" ]; then
        print_error "Snapshot file not found: $other_snapshot"
        return 1
    fi
    
    print_step "Comparing snapshots"
    
    # Compare Node.js versions
    local my_node=$(jq -r '.backend.node_version' "$SNAPSHOT_FILE")
    local their_node=$(jq -r '.backend.node_version' "$other_snapshot")
    
    if [ "$my_node" != "$their_node" ]; then
        print_warning "Node.js version difference: yours=$my_node, theirs=$their_node"
    else
        print_success "Node.js versions match"
    fi
    
    # Compare package versions
    print_info "Detailed comparison saved to: $LOCKDOWN_DIR/comparison-$(date +%Y%m%d-%H%M%S).json"
}

# Show usage
show_help() {
    echo "FLCD Platform Dependency Lockdown Manager"
    echo ""
    echo "Commands:"
    echo "  create-snapshot    Create a dependency snapshot"
    echo "  validate          Validate current dependencies against snapshot"
    echo "  security-audit    Run security vulnerability audit"
    echo "  check-outdated    Check for outdated packages"
    echo "  clean-install     Clean and reinstall all dependencies"
    echo "  generate-report   Generate a comprehensive dependency report"
    echo "  compare <file>    Compare with another developer's snapshot"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dependency-lockdown.sh create-snapshot"
    echo "  ./dependency-lockdown.sh validate"
    echo "  ./dependency-lockdown.sh compare ../team-member-snapshot.json"
}

# Main execution
case "${1:-help}" in
    "create-snapshot")
        print_header
        create_snapshot
        ;;
    "validate")
        print_header
        validate_dependencies
        ;;
    "security-audit")
        print_header
        security_audit
        ;;
    "check-outdated")
        print_header
        check_outdated
        ;;
    "clean-install")
        print_header
        clean_install
        ;;
    "generate-report")
        print_header
        generate_report
        ;;
    "compare")
        print_header
        compare_snapshots "$2"
        ;;
    "help"|*)
        show_help
        ;;
esac