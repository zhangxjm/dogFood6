#!/bin/bash

echo "Stopping Edge Computing Platform services..."
cd "$(dirname "$0")"
docker compose down
echo "Services stopped."
