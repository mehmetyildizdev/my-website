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
#   ./scripts/screen/db/init-db.sh [DATABASE_URL]
# ==============================================================================

echo "Running 00_extensions.sql..."
psql -f scripts/screen/db/00_extensions.sql

echo "Running 01_schema.sql..."
psql -f scripts/screen/db/01_schema.sql

echo "Running 02_indexes.sql..."
psql -f scripts/screen/db/02_indexes.sql

echo "Running 03_data_patches.sql..."
psql -f scripts/screen/db/03_data_patches.sql

echo "Running 04_actor_stats.sql..."
psql -f scripts/screen/db/04_actor_stats.sql

echo "Running 05_actor_metrics.sql..."
psql -f scripts/screen/db/05_actor_metrics.sql

echo "Running 06_my_ranking_formula.sql..."
psql -f scripts/screen/db/06_my_ranking_formula.sql

echo "Running 07_top_rated_formula.sql..."
psql -f scripts/screen/db/07_top_rated_formula.sql

echo "Running 08_chart_metrics.sql..."
psql -f scripts/screen/db/08_chart_metrics.sql

echo "Database initialization complete!"
