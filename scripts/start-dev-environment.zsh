#!/bin/zsh

# Auto Scheduler Development Environment Startup Script
# This script starts all required services in parallel with proper logging

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Trap Ctrl+C and cleanup properly
cleanup() {
    echo "\n${BLUE}🛑 Shutting down services...${NC}"
    
    # Kill all child processes
    pkill -P $$ 2>/dev/null || true
    
    # Kill Vercel specifically (in case it's stubborn)
    pkill -f "vercel dev" 2>/dev/null || true
    
    # Kill Functions specifically
    pkill -f "supabase functions serve" 2>/dev/null || true
    
    echo "${GREEN}✓ Development environment stopped${NC}"
    exit 0
}

trap cleanup INT TERM

echo "${GREEN}🚀 Starting Auto Scheduler Development Environment${NC}\n"

# Create tmp directory for logs if it doesn't exist
mkdir -p ./tmp

# Kill any existing processes
echo "${BLUE}🧹 Checking for existing processes...${NC}"

# Kill Vercel dev processes (will free up port 3001)
if pgrep -f "vercel dev" > /dev/null; then
    echo "${YELLOW}⚠️  Stopping existing Vercel dev processes...${NC}"
    pkill -f "vercel dev" 2>/dev/null || true
    sleep 1
fi

# Kill Supabase Functions processes
if pgrep -f "supabase functions serve" > /dev/null; then
    echo "${YELLOW}⚠️  Stopping existing Supabase Functions processes...${NC}"
    pkill -f "supabase functions serve" 2>/dev/null || true
    sleep 1
fi

# Start Supabase if not running
if lsof -ti:54321 > /dev/null 2>&1; then
    echo "${GREEN}✓ Supabase is already running${NC}"
else
    echo "${BLUE}📦 Starting Supabase local instance...${NC}"
    pnpx supabase start
    echo "${GREEN}✓ Supabase started${NC}\n"
fi

# Install concurrently if not already installed
if ! command -v pnpx concurrently &> /dev/null; then
    echo "${BLUE}📦 Installing concurrently...${NC}"
    pnpm add -D concurrently
    echo "${GREEN}✓ Concurrently installed${NC}\n"
fi

echo "${GREEN}🎬 Starting development servers in parallel...${NC}\n"
echo "${BLUE}Logs are being written to:${NC}"
echo "  - ./tmp/vercel.log (Frontend - Port 3001)"
echo "  - ./tmp/supabase-functions.log (Edge Functions)"
echo "\n${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Run all services in parallel with concurrently
pnpx concurrently \
  --names "VERCEL,FUNCTIONS" \
  --prefix-colors "cyan,magenta" \
  --kill-others \
  --kill-others-on-fail \
  --raw \
  "vercel dev --listen 3001 2>&1 | tee ./tmp/vercel.log" \
  "pnpx supabase functions serve auto-scheduler --no-verify-jwt 2>&1 | tee ./tmp/supabase-functions.log"
