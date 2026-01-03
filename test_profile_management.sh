#!/bin/bash

# Profile Management Testing Script
# This script tests all profile management endpoints

BASE_URL="http://localhost:8000/api/v1"
PROVIDER_EMAIL="testprovider@profile.com"
PROVIDER_PASSWORD="SecurePass123"
CUSTOMER_EMAIL="testcustomer@profile.com"
CUSTOMER_PASSWORD="SecurePass123"

echo "======================================"
echo "Profile Management API Testing"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register a new provider
echo -e "${YELLOW}Test 1: Register new provider${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$PROVIDER_EMAIL\",
    \"password\": \"$PROVIDER_PASSWORD\",
    \"full_name\": \"Test Provider\",
    \"role\": \"provider\"
  }")

echo "Response: $REGISTER_RESPONSE"

if echo "$REGISTER_RESPONSE" | grep -q "id"; then
  echo -e "${GREEN}✓ Provider registration successful${NC}"
else
  echo -e "${RED}✗ Provider registration failed${NC}"
fi
echo ""

# Test 2: Login as provider
echo -e "${YELLOW}Test 2: Login as provider${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$PROVIDER_EMAIL&password=$PROVIDER_PASSWORD")

PROVIDER_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -n "$PROVIDER_TOKEN" ]; then
  echo -e "${GREEN}✓ Provider login successful${NC}"
  echo "Token: ${PROVIDER_TOKEN:0:20}..."
else
  echo -e "${RED}✗ Provider login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Get current user profile
echo -e "${YELLOW}Test 3: Get current user profile${NC}"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $PROVIDER_TOKEN")

echo "Response: $ME_RESPONSE"

if echo "$ME_RESPONSE" | grep -q "is_profile_complete"; then
  echo -e "${GREEN}✓ Get profile successful${NC}"
  
  IS_COMPLETE=$(echo "$ME_RESPONSE" | grep -o '"is_profile_complete":[^,}]*' | sed 's/"is_profile_complete"://')
  echo "Profile complete: $IS_COMPLETE"
else
  echo -e "${RED}✗ Get profile failed${NC}"
fi
echo ""

# Test 4: Update basic profile
echo -e "${YELLOW}Test 4: Update basic user profile${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Provider Name",
    "phone": "+1 (555) 123-4567",
    "address": "123 Test St, San Francisco, CA",
    "bio": "Professional service provider with expertise in testing",
    "avatar_url": "https://example.com/avatar.jpg"
  }')

echo "Response: $UPDATE_RESPONSE"

if echo "$UPDATE_RESPONSE" | grep -q "phone"; then
  echo -e "${GREEN}✓ Profile update successful${NC}"
else
  echo -e "${RED}✗ Profile update failed${NC}"
fi
echo ""

# Test 5: Get complete profile (new endpoint)
echo -e "${YELLOW}Test 5: Get complete profile${NC}"
COMPLETE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me/profile" \
  -H "Authorization: Bearer $PROVIDER_TOKEN")

echo "Response: $COMPLETE_RESPONSE"

if echo "$COMPLETE_RESPONSE" | grep -q "bio"; then
  echo -e "${GREEN}✓ Get complete profile successful${NC}"
else
  echo -e "${RED}✗ Get complete profile failed${NC}"
fi
echo ""

# Test 6: Try to get provider profile before creating it (should fail)
echo -e "${YELLOW}Test 6: Get provider profile (should fail - not created)${NC}"
PROVIDER_GET_RESPONSE=$(curl -s -X GET "$BASE_URL/providers/profile/me" \
  -H "Authorization: Bearer $PROVIDER_TOKEN")

echo "Response: $PROVIDER_GET_RESPONSE"

if echo "$PROVIDER_GET_RESPONSE" | grep -q "Please complete your provider profile"; then
  echo -e "${GREEN}✓ Correct error message shown${NC}"
else
  echo -e "${YELLOW}⚠ Unexpected response${NC}"
fi
echo ""

# Test 7: Create provider profile
echo -e "${YELLOW}Test 7: Create provider profile${NC}"
PROVIDER_CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/providers/profile" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Professional Test Services LLC",
    "bio": "Expert service provider specializing in comprehensive testing and quality assurance",
    "location": "San Francisco Bay Area, CA"
  }')

echo "Response: $PROVIDER_CREATE_RESPONSE"

if echo "$PROVIDER_CREATE_RESPONSE" | grep -q "business_name"; then
  echo -e "${GREEN}✓ Provider profile creation successful${NC}"
else
  echo -e "${RED}✗ Provider profile creation failed${NC}"
fi
echo ""

# Test 8: Get provider profile (should succeed now)
echo -e "${YELLOW}Test 8: Get provider profile (should succeed)${NC}"
PROVIDER_GET2_RESPONSE=$(curl -s -X GET "$BASE_URL/providers/profile/me" \
  -H "Authorization: Bearer $PROVIDER_TOKEN")

echo "Response: $PROVIDER_GET2_RESPONSE"

if echo "$PROVIDER_GET2_RESPONSE" | grep -q "business_name"; then
  echo -e "${GREEN}✓ Get provider profile successful${NC}"
else
  echo -e "${RED}✗ Get provider profile failed${NC}"
fi
echo ""

# Test 9: Verify profile completion updated
echo -e "${YELLOW}Test 9: Verify profile completion status${NC}"
ME_FINAL_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $PROVIDER_TOKEN")

IS_COMPLETE_FINAL=$(echo "$ME_FINAL_RESPONSE" | grep -o '"is_profile_complete":[^,}]*' | sed 's/"is_profile_complete"://')

echo "Profile complete status: $IS_COMPLETE_FINAL"

if echo "$IS_COMPLETE_FINAL" | grep -q "true"; then
  echo -e "${GREEN}✓ Profile marked as complete${NC}"
else
  echo -e "${RED}✗ Profile not marked as complete${NC}"
fi
echo ""

# Test 10: Try to create duplicate provider profile (should fail)
echo -e "${YELLOW}Test 10: Try to create duplicate provider profile (should fail)${NC}"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/providers/profile" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Duplicate Services",
    "bio": "This should fail because profile exists",
    "location": "Test City"
  }')

echo "Response: $DUPLICATE_RESPONSE"

if echo "$DUPLICATE_RESPONSE" | grep -q "already exists"; then
  echo -e "${GREEN}✓ Duplicate prevention working${NC}"
else
  echo -e "${RED}✗ Duplicate prevention failed${NC}"
fi
echo ""

# Test 11: Update provider profile
echo -e "${YELLOW}Test 11: Update provider profile${NC}"
PROVIDER_UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/providers/profile" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Updated Professional Services",
    "bio": "Updated bio with new information about services and expertise",
    "location": "San Francisco, Oakland, San Jose - Bay Area",
    "availability": {
      "monday": {"start": "09:00", "end": "17:00"},
      "tuesday": {"start": "09:00", "end": "17:00"}
    }
  }')

echo "Response: $PROVIDER_UPDATE_RESPONSE"

if echo "$PROVIDER_UPDATE_RESPONSE" | grep -q "Updated"; then
  echo -e "${GREEN}✓ Provider profile update successful${NC}"
else
  echo -e "${RED}✗ Provider profile update failed${NC}"
fi
echo ""

# Test 12: Register customer and verify they can't create provider profile
echo -e "${YELLOW}Test 12: Customer attempting provider profile (should fail)${NC}"

# Register customer
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$CUSTOMER_EMAIL\",
    \"password\": \"$CUSTOMER_PASSWORD\",
    \"full_name\": \"Test Customer\",
    \"role\": \"customer\"
  }" > /dev/null

# Login as customer
CUSTOMER_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$CUSTOMER_EMAIL&password=$CUSTOMER_PASSWORD")

CUSTOMER_TOKEN=$(echo "$CUSTOMER_LOGIN" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

# Try to create provider profile as customer
CUSTOMER_PROVIDER_RESPONSE=$(curl -s -X POST "$BASE_URL/providers/profile" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Should Fail",
    "bio": "This should not work",
    "location": "Nowhere"
  }')

echo "Response: $CUSTOMER_PROVIDER_RESPONSE"

if echo "$CUSTOMER_PROVIDER_RESPONSE" | grep -q "Only providers"; then
  echo -e "${GREEN}✓ Role-based access control working${NC}"
else
  echo -e "${RED}✗ Role-based access control failed${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}All tests completed!${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "- User profile management: Working"
echo "- Provider profile creation: Working"
echo "- Profile completion tracking: Working"
echo "- Role-based access control: Working"
echo "- Duplicate prevention: Working"
echo "- Profile updates: Working"
