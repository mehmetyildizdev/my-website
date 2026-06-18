#!/bin/bash
set -e

# ==============================================================================
# Database Initialization Script (Bash / CLI-Native)
# ==============================================================================
# Purpose:
#   Provides a quick shell-native script to initialize the database schema 
#   sequentially from scratch on a clean PostgreSQL instance. Useful if you
#   want to run migrations directly using the command line (psql).
#
# Requirements:
#   - PostgreSQL command-line client (`psql`) installed locally.
#
# Usage:
#   ./scripts/db/init-db.sh [DATABASE_URL]
# ==============================================================================

echo "Running 00_extensions.sql..."
psql -f scripts/db/00_extensions.sql

echo "Running 01_schema.sql..."
psql -f scripts/db/01_schema.sql

echo "Running 02_indexes.sql..."
psql -f scripts/db/02_indexes.sql

echo "Running 03_views.sql..."
psql -f scripts/db/03_views.sql

echo "Running 04_data_patches.sql..."
psql -f scripts/db/04_data_patches.sql

echo "Database initialization complete!"
