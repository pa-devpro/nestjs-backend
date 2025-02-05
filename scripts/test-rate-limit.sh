#!/bin/bash

echo "Starting rate limit test..."

# Function to make request
make_request() {
    curl -s -w "\nStatus: %{http_code}\n" \
         -H "Content-Type: application/json" \
         -o /dev/null \
         http://localhost:3001/articles/1
}

# Make requests rapidly
for i in {1..20}; do
    echo "=== Request $i ==="
    make_request &
    sleep 0.1  # Very small delay to see headers
done

wait # Wait for all requests to complete
echo "Test completed"