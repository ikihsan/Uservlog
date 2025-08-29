#!/bin/bash
# Start script for Render
echo "Starting the API server..."
cd api || exit 1
node index.js
