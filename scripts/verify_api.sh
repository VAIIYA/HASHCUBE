#!/bin/bash

# Port might be different if dev server is running, assuming 3000
BASE_URL="http://localhost:3000/api"

echo "Step 1: Creating a new thread..."
THREAD_RES=$(curl -s -X POST "$BASE_URL/submit" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Thread", "type": "ipfs", "value": "QmTest123", "description": "This is a test thread"}')

THREAD_ID=$(echo $THREAD_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$THREAD_ID" ]; then
  echo "Failed to create thread"
  echo "$THREAD_RES"
  exit 1
fi

echo "Created thread with ID: $THREAD_ID"

echo "Step 2: Posting a reply..."
REPLY_RES=$(curl -s -X POST "$BASE_URL/submit" \
  -H "Content-Type: application/json" \
  -d "{\"parentId\": \"$THREAD_ID\", \"description\": \"This is a test reply\"}")

echo "Reply response: $REPLY_RES"

echo "Step 3: Fetching thread detail..."
DETAIL_RES=$(curl -s "$BASE_URL/threads/$THREAD_ID")
echo "Thread detail: $DETAIL_RES"

echo "Step 4: Fetching all threads (catalog)..."
CATALOG_RES=$(curl -s "$BASE_URL/threads")
echo "Catalog (partial): $(echo $CATALOG_RES | cut -c1-100)..."

echo "Verification complete."
