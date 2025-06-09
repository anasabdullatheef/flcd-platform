#!/bin/bash

echo "🧪 Testing FLCD Platform APIs"
echo "=================================="

# Start backend server in background
cd /Users/aami/Documents/hashinclude/flcd-platform/flcd-backend
npm run dev &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

echo ""
echo "1️⃣ Testing Health Check:"
curl -s http://localhost:3000/health | jq . || echo "Health check failed"

echo ""
echo ""
echo "2️⃣ Testing Admin Login:"
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flcd.com","password":"admin123"}')

echo "$TOKEN_RESPONSE" | jq . || echo "Login failed"

# Extract token
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.accessToken' 2>/dev/null)

if [ "$ACCESS_TOKEN" != "null" ] && [ "$ACCESS_TOKEN" != "" ]; then
    echo ""
    echo "3️⃣ Testing Get Users (with auth):"
    curl -s -X GET http://localhost:3000/api/users \
      -H "Authorization: Bearer $ACCESS_TOKEN" | jq . || echo "Get users failed"

    echo ""
    echo "4️⃣ Testing Get Roles:"
    curl -s -X GET http://localhost:3000/api/users/roles \
      -H "Authorization: Bearer $ACCESS_TOKEN" | jq . || echo "Get roles failed"
else
    echo "❌ Could not get access token, skipping authenticated tests"
fi

echo ""
echo "5️⃣ Testing Rider Registration (Send OTP):"
curl -s -X POST http://localhost:3000/api/auth/register/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","firstName":"Test","lastName":"Rider"}' | jq . || echo "Send OTP failed"

echo ""
echo ""
echo "🏁 Test completed! Check the responses above."
echo "💡 Use these credentials to test:"
echo "   Admin: admin@flcd.com / admin123"
echo "   API Base URL: http://localhost:3000"

# Clean up
kill $SERVER_PID 2>/dev/null