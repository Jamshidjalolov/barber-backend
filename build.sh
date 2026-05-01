#!/bin/bash
set -e

# Install dependencies for backend
cd backend
poetry install --no-root
cd ..
