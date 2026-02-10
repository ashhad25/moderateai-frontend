#!/bin/bash
# Save this as test_rate_limit.sh

API_URL="https://moderateai-backend.onrender.com"

echo "🔥 Testing Rate Limiting - Attempting 15 login requests..."
echo "Should be blocked after 10 attempts"
echo ""

for i in {1..15}; do
  echo "Attempt $i:"
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/admin/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"attacker@test.com","password":"wrong"}')
  
  echo "$response"
  echo "---"
  sleep 1
done

echo "✅ If you see 429 errors after attempt 10, rate limiting works!"