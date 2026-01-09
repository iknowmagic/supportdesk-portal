#!/bin/zsh

# Support Desk Portal Development Environment Startup Script
# This script starts all required services in parallel with proper logging

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables from .env
if [[ -f .env ]]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Default port values (from config.toml)
SUPABASE_API_PORT=${SUPABASE_API_PORT:-64321}
SUPABASE_DB_PORT=${SUPABASE_DB_PORT:-64322}
SUPABASE_STUDIO_PORT=${SUPABASE_STUDIO_PORT:-64323}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Trap Ctrl+C and cleanup properly
cleanup() {
    echo "\n${BLUE}🛑 Shutting down services...${NC}"
    
    # Kill all child processes
    pkill -P $$ 2>/dev/null || true
    
    # Kill Vercel specifically (in case it's stubborn)
    pkill -f "vercel dev" 2>/dev/null || true
    
    echo "${GREEN}✓ Development environment stopped${NC}"
    exit 0
}

trap cleanup INT TERM

echo "${GREEN}🚀 Starting Support Desk Portal Development Environment${NC}\n"

# Create tmp directory for logs if it doesn't exist
mkdir -p ./tmp

# Kill any existing processes
echo "${BLUE}🧹 Checking for existing processes...${NC}"

# Kill Vercel dev processes (will free up frontend port)
if pgrep -f "vercel dev" > /dev/null; then
    echo "${YELLOW}⚠️  Stopping existing Vercel dev processes...${NC}"
    pkill -f "vercel dev" 2>/dev/null || true
    sleep 1
fi

# Start Supabase if not running
if lsof -ti:$SUPABASE_API_PORT > /dev/null 2>&1; then
    echo "${GREEN}✓ Supabase is already running (port $SUPABASE_API_PORT)${NC}"
else
    echo "${BLUE}📦 Starting Supabase local instance...${NC}"
    pnpx supabase start
    echo "${GREEN}✓ Supabase started${NC}\n"
fi

echo "${GREEN}🎬 Starting development server...${NC}\n"
echo "${BLUE}Available at:${NC}"
echo "  - Frontend: http://127.0.0.1:$FRONTEND_PORT"
echo "  - Supabase API: http://127.0.0.1:$SUPABASE_API_PORT"
echo "  - Supabase Studio: http://127.0.0.1:$SUPABASE_STUDIO_PORT"
echo "\n${YELLOW}Press Ctrl+C to stop${NC}\n"

# Start Vercel dev
vercel dev --listen $FRONTEND_PORT
