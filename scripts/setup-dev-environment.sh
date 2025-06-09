#!/bin/bash

# FLCD Platform - Development Environment Setup Script
# The Anthropic Way: Intelligent, Thorough, and Reliable
# 
# This script ensures consistent development environments across all machines
# by managing dependencies, validating requirements, and setting up the project

set -euo pipefail  # Exit on any error, undefined vars, or pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="FLCD Platform"
MIN_NODE_VERSION="18.0.0"
MIN_NPM_VERSION="8.0.0"
POSTGRES_VERSION="14"
REQUIRED_JAVA_VERSION="11"

# Directories
BACKEND_DIR="flcd-backend"
FRONTEND_DIR="flcd-frontend"
SCRIPTS_DIR="scripts"

# Log file for debugging
LOG_FILE="setup-$(date +%Y%m%d-%H%M%S).log"

# Function definitions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                     FLCD Platform Setup                     ║"
    echo "║                    The Anthropic Way                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
    log "STEP: $1"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    log "SUCCESS: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log "WARNING: $1"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    log "ERROR: $1"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
    log "INFO: $1"
}

# Version comparison function
version_compare() {
    local version1=$1
    local operator=$2
    local version2=$3
    
    # Remove 'v' prefix if present
    version1=${version1#v}
    version2=${version2#v}
    
    # Use sort -V for version comparison
    case $operator in
        ">=")
            [ "$(printf '%s\n' "$version2" "$version1" | sort -V | head -n1)" = "$version2" ]
            ;;
        ">")
            [ "$(printf '%s\n' "$version2" "$version1" | sort -V | head -n1)" = "$version2" ] && [ "$version1" != "$version2" ]
            ;;
        "=")
            [ "$version1" = "$version2" ]
            ;;
    esac
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Install packages based on OS
install_package() {
    local package=$1
    local os=$(detect_os)
    
    case $os in
        "macos")
            if command_exists brew; then
                brew install "$package"
            else
                print_error "Homebrew not found. Please install Homebrew first."
                exit 1
            fi
            ;;
        "linux")
            if command_exists apt-get; then
                sudo apt-get update && sudo apt-get install -y "$package"
            elif command_exists yum; then
                sudo yum install -y "$package"
            elif command_exists pacman; then
                sudo pacman -S --noconfirm "$package"
            else
                print_error "No supported package manager found"
                exit 1
            fi
            ;;
        *)
            print_error "Unsupported operating system: $os"
            exit 1
            ;;
    esac
}

# Check and install Node.js
check_nodejs() {
    print_step "Checking Node.js installation"
    
    if command_exists node; then
        local node_version=$(node --version | sed 's/v//')
        if version_compare "$node_version" ">=" "$MIN_NODE_VERSION"; then
            print_success "Node.js $node_version is installed (required: >= $MIN_NODE_VERSION)"
        else
            print_warning "Node.js $node_version is outdated (required: >= $MIN_NODE_VERSION)"
            print_info "Please update Node.js manually or use a version manager like nvm"
            read -p "Continue with current version? [y/N]: " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        print_error "Node.js not found"
        print_info "Installing Node.js..."
        
        local os=$(detect_os)
        case $os in
            "macos")
                install_package "node"
                ;;
            "linux")
                # Install Node.js via NodeSource repository for latest version
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                install_package "nodejs"
                ;;
        esac
    fi
}

# Check and install npm
check_npm() {
    print_step "Checking npm installation"
    
    if command_exists npm; then
        local npm_version=$(npm --version)
        if version_compare "$npm_version" ">=" "$MIN_NPM_VERSION"; then
            print_success "npm $npm_version is installed (required: >= $MIN_NPM_VERSION)"
        else
            print_warning "npm $npm_version is outdated (required: >= $MIN_NPM_VERSION)"
            print_info "Updating npm..."
            npm install -g npm@latest
        fi
    else
        print_error "npm not found (should come with Node.js)"
        exit 1
    fi
}

# Check and install PostgreSQL
check_postgresql() {
    print_step "Checking PostgreSQL installation"
    
    if command_exists psql; then
        local pg_version=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
        local pg_major=$(echo "$pg_version" | cut -d. -f1)
        
        if [ "$pg_major" -ge "$POSTGRES_VERSION" ]; then
            print_success "PostgreSQL $pg_version is installed (required: >= $POSTGRES_VERSION)"
        else
            print_warning "PostgreSQL $pg_version is outdated (required: >= $POSTGRES_VERSION)"
        fi
    else
        print_error "PostgreSQL not found"
        print_info "Installing PostgreSQL..."
        
        local os=$(detect_os)
        case $os in
            "macos")
                install_package "postgresql@15"
                echo "Starting PostgreSQL service..."
                brew services start postgresql@15
                ;;
            "linux")
                install_package "postgresql postgresql-contrib"
                sudo systemctl start postgresql
                sudo systemctl enable postgresql
                ;;
        esac
    fi
}

# Check Java (for mobile development)
check_java() {
    print_step "Checking Java installation"
    
    if command_exists java; then
        local java_version=$(java -version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
        local java_major=$(echo "$java_version" | cut -d. -f1)
        
        if [ "$java_major" -ge "$REQUIRED_JAVA_VERSION" ]; then
            print_success "Java $java_version is installed (required: >= $REQUIRED_JAVA_VERSION)"
        else
            print_warning "Java $java_version is outdated (required: >= $REQUIRED_JAVA_VERSION)"
        fi
    else
        print_warning "Java not found (required for mobile development)"
        print_info "Installing OpenJDK 11..."
        
        local os=$(detect_os)
        case $os in
            "macos")
                install_package "openjdk@11"
                ;;
            "linux")
                install_package "openjdk-11-jdk"
                ;;
        esac
    fi
}

# Validate project structure
validate_project_structure() {
    print_step "Validating project structure"
    
    local required_dirs=("$BACKEND_DIR" "$FRONTEND_DIR" "$SCRIPTS_DIR")
    local missing_dirs=()
    
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            missing_dirs+=("$dir")
        fi
    done
    
    if [ ${#missing_dirs[@]} -eq 0 ]; then
        print_success "Project structure is valid"
    else
        print_error "Missing directories: ${missing_dirs[*]}"
        print_info "Please ensure you're running this script from the project root"
        exit 1
    fi
}

# Setup backend dependencies
setup_backend() {
    print_step "Setting up backend dependencies"
    
    cd "$BACKEND_DIR"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $BACKEND_DIR"
        exit 1
    fi
    
    print_info "Installing backend dependencies..."
    npm ci --silent
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_info "Creating .env from .env.example"
            cp .env.example .env
            print_warning "Please configure your .env file with proper values"
        else
            print_warning ".env file not found. Please create one with required environment variables"
        fi
    fi
    
    print_success "Backend dependencies installed"
    cd ..
}

# Setup frontend dependencies
setup_frontend() {
    print_step "Setting up frontend dependencies"
    
    cd "$FRONTEND_DIR"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $FRONTEND_DIR"
        exit 1
    fi
    
    print_info "Installing frontend dependencies..."
    npm ci --silent
    
    print_success "Frontend dependencies installed"
    cd ..
}

# Run health checks
run_health_checks() {
    print_step "Running health checks"
    
    # Check backend package.json scripts
    local backend_scripts=$(jq -r '.scripts | keys[]' "$BACKEND_DIR/package.json" 2>/dev/null || echo "")
    if echo "$backend_scripts" | grep -q "dev\|start"; then
        print_success "Backend scripts configured"
    else
        print_warning "Backend scripts may not be properly configured"
    fi
    
    # Check frontend package.json scripts
    local frontend_scripts=$(jq -r '.scripts | keys[]' "$FRONTEND_DIR/package.json" 2>/dev/null || echo "")
    if echo "$frontend_scripts" | grep -q "dev\|build"; then
        print_success "Frontend scripts configured"
    else
        print_warning "Frontend scripts may not be properly configured"
    fi
    
    # Check for lock files consistency
    if [ -f "$BACKEND_DIR/package-lock.json" ]; then
        print_success "Backend lock file exists"
    else
        print_warning "Backend package-lock.json not found"
    fi
    
    if [ -f "$FRONTEND_DIR/package-lock.json" ]; then
        print_success "Frontend lock file exists"
    else
        print_warning "Frontend package-lock.json not found"
    fi
}

# Generate development commands
generate_dev_commands() {
    print_step "Generating development commands"
    
    cat > "dev-commands.sh" << 'EOF'
#!/bin/bash
# FLCD Platform Development Commands
# Generated by setup-dev-environment.sh

# Start backend development server
start_backend() {
    echo "Starting backend server..."
    cd flcd-backend && npm run dev
}

# Start frontend development server
start_frontend() {
    echo "Starting frontend server..."
    cd flcd-frontend && npm run dev
}

# Start both servers concurrently
start_all() {
    echo "Starting all development servers..."
    (cd flcd-backend && npm run dev) &
    (cd flcd-frontend && npm run dev) &
    wait
}

# Run database migrations
migrate_db() {
    echo "Running database migrations..."
    cd flcd-backend && npm run prisma:migrate
}

# Seed database
seed_db() {
    echo "Seeding database..."
    cd flcd-backend && npm run seed
}

# Run tests
run_tests() {
    echo "Running tests..."
    cd flcd-backend && npm test
    cd ../flcd-frontend && npm run lint
}

# Show usage
show_help() {
    echo "FLCD Platform Development Commands:"
    echo "  start_backend    - Start backend development server"
    echo "  start_frontend   - Start frontend development server"
    echo "  start_all        - Start all development servers"
    echo "  migrate_db       - Run database migrations"
    echo "  seed_db          - Seed database with initial data"
    echo "  run_tests        - Run all tests"
    echo "  show_help        - Show this help message"
}

# If script is called directly, show help
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    show_help
fi
EOF

    chmod +x dev-commands.sh
    print_success "Development commands generated in dev-commands.sh"
}

# Create environment validation script
create_env_validator() {
    print_step "Creating environment validator"
    
    cat > "validate-environment.sh" << 'EOF'
#!/bin/bash
# Environment Validation Script for FLCD Platform
# Checks if all dependencies are properly installed and configured

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

check_version() {
    local cmd=$1
    local min_version=$2
    local current_version=$($cmd --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)
    
    if [ -n "$current_version" ]; then
        echo -e "${GREEN}✓${NC} $cmd version: $current_version"
    else
        echo -e "${YELLOW}?${NC} $cmd version: unknown"
    fi
}

echo "FLCD Platform Environment Validation"
echo "====================================="

# Check required commands
REQUIRED_COMMANDS=("node" "npm" "psql" "git")
ALL_GOOD=true

for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if ! check_command "$cmd"; then
        ALL_GOOD=false
    fi
done

# Check versions
check_version "node" "18.0.0"
check_version "npm" "8.0.0"

# Check project structure
echo ""
echo "Project Structure:"
for dir in "flcd-backend" "flcd-frontend"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir directory exists"
    else
        echo -e "${RED}✗${NC} $dir directory missing"
        ALL_GOOD=false
    fi
done

# Check package files
echo ""
echo "Package Files:"
for file in "flcd-backend/package.json" "flcd-frontend/package.json"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
        ALL_GOOD=false
    fi
done

echo ""
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}Environment validation passed!${NC}"
    exit 0
else
    echo -e "${RED}Environment validation failed. Please fix the issues above.${NC}"
    exit 1
fi
EOF

    chmod +x validate-environment.sh
    print_success "Environment validator created"
}

# Main execution
main() {
    print_header
    
    log "Starting FLCD Platform setup at $(date)"
    log "Running on $(uname -a)"
    
    # Validate we're in the right directory
    validate_project_structure
    
    # Check system dependencies
    check_nodejs
    check_npm
    check_postgresql
    check_java
    
    # Setup project dependencies
    setup_backend
    setup_frontend
    
    # Run health checks
    run_health_checks
    
    # Generate helper scripts
    generate_dev_commands
    create_env_validator
    
    echo ""
    print_success "Setup completed successfully!"
    print_info "Log file saved as: $LOG_FILE"
    
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "1. Configure your .env files with proper database credentials"
    echo "2. Run database migrations: cd flcd-backend && npm run prisma:migrate"
    echo "3. Seed the database: cd flcd-backend && npm run seed"
    echo "4. Start development servers: ./dev-commands.sh start_all"
    echo ""
    echo -e "${BLUE}Available commands:${NC}"
    echo "• ./validate-environment.sh - Validate your setup"
    echo "• ./dev-commands.sh - Common development tasks"
    echo ""
    print_success "Happy coding! 🚀"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi