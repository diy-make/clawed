#!/bin/bash
# Start Next.js in the background
npm start -- -p 3001 &

# Start socat to bridge vsock port 3001 to TCP port 3001
socat VSOCK-LISTEN:3001,fork TCP:127.0.0.1:3001
