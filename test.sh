#!/bin/bash

# Test Script for Merry Go Round Chamaa

echo "🧪 Running Tests..."

echo ""
echo "📊 Backend Tests"
cd backend
npm test -- --coverage
cd ..

echo ""
echo "📱 Frontend Tests"
cd frontend
npm test -- --coverage --watchAll=false
cd ..

echo ""
echo "✅ All tests completed!"
