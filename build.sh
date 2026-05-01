#!/bin/bash
set -e

# Copy backend config to root for Render to find
cp backend/pyproject.toml .

# Install dependencies for backend
cd backend
poetry install --no-root
