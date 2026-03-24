#!/bin/sh
set -e

# Run Prisma migrations
npx prisma db push --skip-generate

# Start the app
exec node server.js
