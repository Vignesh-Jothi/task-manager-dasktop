#!/bin/bash

# Tasktronaut - Setup Script
# This script helps you set up and run the Tasktronaut application

set -e

echo "╔════════════════════════════════════════════════════╗"
echo "║   Tasktronaut - Local-First Task Management     ║"
echo "║   Production-Ready Desktop Application           ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo "🔍 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check npm
echo "🔍 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "   This may take a few minutes..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Create sample data directory structure (optional)
echo "📁 Setting up sample data (optional)..."
read -p "   Would you like to copy sample data? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Get user data directory based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        USER_DATA="$HOME/Library/Application Support/tasktronaut"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        USER_DATA="$HOME/.config/tasktronaut"
    else
        echo "⚠️  Sample data setup not supported on this OS. Skipping..."
        USER_DATA=""
    fi

    if [ -n "$USER_DATA" ]; then
        mkdir -p "$USER_DATA"
        
        if [ -d "sample-data" ]; then
            echo "   Copying sample data to $USER_DATA..."
            cp -r sample-data/* "$USER_DATA/" 2>/dev/null || true
            echo "✅ Sample data copied"
        else
            echo "⚠️  Sample data directory not found. Skipping..."
        fi
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║   Setup Complete! 🎉                              ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "📍 Your data will be stored at:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   ~/Library/Application Support/tasktronaut/"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "   ~/.config/tasktronaut/"
else
    echo "   %APPDATA%/tasktronaut/ (Windows)"
fi
echo ""
echo "🚀 To start the application:"
echo "   npm start"
echo ""
echo "🔧 Other commands:"
echo "   npm run dev      - Development mode with hot reload"
echo "   npm run package  - Package as desktop app"
echo ""
echo "📚 Documentation:"
echo "   README.md        - Complete documentation"
echo "   QUICKSTART.md    - Quick start guide"
echo "   ARCHITECTURE.md  - Technical architecture"
echo ""
read -p "Would you like to start the application now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting Tasktronaut..."
    echo ""
    npm start
else
    echo ""
    echo "👋 Run 'npm start' when you're ready!"
    echo ""
fi
