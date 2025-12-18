#!/bin/bash

# NaviGo Agents Integration Test Runner
# This script runs all agent integration tests

echo "=========================================="
echo "NaviGo Agents Integration Test Runner"
echo "=========================================="
echo ""

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo "⚠️  pytest not found. Installing..."
    pip install pytest pytest-cov pytest-mock
fi

# Check if we're in the project root
if [ ! -f "tests/test_agents_integration.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Run tests
echo "🚀 Running tests..."
echo ""

pytest tests/test_agents_integration.py -v --tb=short

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    exit 0
else
    echo ""
    echo "❌ Some tests failed. Check output above."
    exit 1
fi

