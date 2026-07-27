#!/bin/bash

# ==============================================================================
# Database Backup Script for Neon PostgreSQL (Auto-Bootstrapping Version)
# ==============================================================================
# Purpose:
#   Downloads a local backup of the remote Neon database.
#   Saves the backup file under the 'backups' directory with a timestamp.
#   Automatically handles PostgreSQL client/server major version mismatches.
#
# Requirements:
#   - PostgreSQL client tool `pg_dump` installed (or curl/dpkg-deb to bootstrap).
#   - .env.local file containing NEON_DATABASE_URL in the project root.
#
# Usage:
#   ./scripts/backup-db.sh [DATABASE_URL]
# ==============================================================================

# Ensure the script exits if any command fails
set -e

# Resolve the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 1. Determine connection URL
DB_URL="$1"

if [ -z "$DB_URL" ]; then
  # Try to read from .env.local
  ENV_FILE="$PROJECT_ROOT/.env.local"
  if [ -f "$ENV_FILE" ]; then
    # Extract NEON_DATABASE_URL and strip surrounding single or double quotes
    DB_URL=$(grep -E "^NEON_DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2- | sed -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//')
  fi
fi

if [ -z "$DB_URL" ]; then
  echo "Error: Database connection URL not specified."
  echo "Please either pass it as an argument or set NEON_DATABASE_URL in .env.local:"
  echo "  $0 \"postgresql://user:password@host/dbname\""
  exit 1
fi

# Redact password for logging
REDACTED_URL=$(echo "$DB_URL" | sed -E 's/([^:]+:\/\/[^:]+:)[^@]+(@.*)/\1****\2/')

# 2. Check if default pg_dump is installed
DEFAULT_PG_DUMP="pg_dump"
if ! command -v pg_dump &> /dev/null; then
  echo "Warning: Default pg_dump client tool is not installed."
  DEFAULT_PG_DUMP=""
fi

# 3. Create backups directory if it doesn't exist
BACKUPS_DIR="$PROJECT_ROOT/backups"
mkdir -p "$BACKUPS_DIR"

# 4. Generate timestamped file name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUPS_DIR/neondb_backup_$TIMESTAMP.sql"

# Function to download and extract a matching pg_dump version
get_matching_pg_dump() {
  local major_ver="$1"
  local bin_dir="$PROJECT_ROOT/scripts/bin"
  local target_bin="$bin_dir/pg_dump-$major_ver"
  
  if [ -f "$target_bin" ]; then
    echo "$target_bin"
    return 0
  fi
  
  echo "------------------------------------------------------------" >&2
  echo "Installing matching pg_dump version $major_ver in user space..." >&2
  mkdir -p "$bin_dir"
  
  # Determine OS version
  local os_id=$(grep "^ID=" /etc/os-release | cut -d= -f2 | tr -d '"')
  local os_ver=$(grep "^VERSION_ID=" /etc/os-release | cut -d= -f2 | tr -d '"')
  
  # Default to pgdg22.04 if not found
  local suffix="pgdg22.04"
  if [ "$os_id" = "ubuntu" ]; then
    suffix="pgdg$os_ver"
  elif [ "$os_id" = "debian" ]; then
    local codename=$(grep "^VERSION_CODENAME=" /etc/os-release | cut -d= -f2 | tr -d '"')
    suffix="pgdg$codename"
  fi

  local suffix_esc=$(echo "$suffix" | sed 's/\./\\./g')
  local repo_url="http://apt.postgresql.org/pub/repos/apt/pool/main/p/postgresql-$major_ver/"
  
  # List files and find the right deb (e.g. pgdg22.04+1_amd64.deb or similar)
  local deb_name=$(curl -s "$repo_url" | grep -oE "postgresql-client-${major_ver}_[^_]+\.${suffix_esc}[^_]*_amd64\.deb" | tail -n 1)
  
  if [ -z "$deb_name" ]; then
    # Fallback to any amd64 deb for this pg version if specific OS version isn't matched
    deb_name=$(curl -s "$repo_url" | grep -oE "postgresql-client-${major_ver}_[^_]+_amd64\.deb" | tail -n 1)
  fi
  
  if [ -z "$deb_name" ]; then
    echo "Error: Could not find package for pg_dump version $major_ver on PostgreSQL apt repository." >&2
    return 1
  fi
  
  local temp_dir=$(mktemp -d)
  local deb_path="$temp_dir/client.deb"
  
  echo "Downloading $deb_name..." >&2
  curl -s -o "$deb_path" "${repo_url}${deb_name}"
  
  echo "Extracting..." >&2
  dpkg-deb -x "$deb_path" "$temp_dir/extracted"
  
  # Move pg_dump to scripts/bin
  local extracted_bin=$(find "$temp_dir/extracted" -name pg_dump -type f | head -n 1)
  if [ -n "$extracted_bin" ] && [ -f "$extracted_bin" ]; then
    mv "$extracted_bin" "$target_bin"
    chmod +x "$target_bin"
    echo "$target_bin"
  else
    echo "Error: pg_dump not found in extracted package." >&2
    rm -rf "$temp_dir"
    return 1
  fi
  
  rm -rf "$temp_dir"
  echo "pg_dump version $major_ver successfully set up." >&2
  echo "------------------------------------------------------------" >&2
  return 0
}

echo "Connecting to remote database: $REDACTED_URL"
echo "Starting database backup..."

# Use system CA certs to verify SSL connection to Neon DB
export PGSSLROOTCERT=/etc/ssl/certs/ca-certificates.crt

ERROR_LOG=$(mktemp)
SUCCESS=0

# Try using default pg_dump first (if it exists)
if [ -n "$DEFAULT_PG_DUMP" ]; then
  if pg_dump "$DB_URL" -F p -b -v -f "$BACKUP_FILE" 2> "$ERROR_LOG"; then
    SUCCESS=1
  fi
fi

if [ "$SUCCESS" -eq 0 ]; then
  # Check if failure was due to version mismatch
  if grep -q "server version mismatch" "$ERROR_LOG" || [ -z "$DEFAULT_PG_DUMP" ]; then
    # Extract server major version
    # E.g., from "server version: 18.4" or similar
    SERVER_VER=""
    if [ -n "$DEFAULT_PG_DUMP" ]; then
      SERVER_VER=$(grep -oE "server version: [0-9]+" "$ERROR_LOG" | head -n 1 | awk '{print $3}')
    fi
    
    # If we couldn't parse the version (e.g. default pg_dump didn't exist to report it),
    # query the database version directly.
    if [ -z "$SERVER_VER" ]; then
      echo "Querying database for major version..."
      # Use node script to query PG version to avoid version checking issues of psql
      SERVER_VER=$(DB_URL="$DB_URL" node -e "
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DB_URL, ssl: { rejectUnauthorized: true } });
        pool.query('SHOW server_version').then(r => {
          const match = r.rows[0].server_version.match(/^\d+/);
          console.log(match ? match[0] : '18');
          pool.end();
        }).catch(e => {
          console.error(e);
          pool.end();
          process.exit(1);
        });
      ")
    fi
    
    echo "Detected server version: PostgreSQL $SERVER_VER"
    
    # Download matching pg_dump
    if MATCHING_DUMP=$(get_matching_pg_dump "$SERVER_VER"); then
      echo "Re-running backup using pg_dump version $SERVER_VER..."
      if "$MATCHING_DUMP" "$DB_URL" -F p -b -v -f "$BACKUP_FILE" 2> "$ERROR_LOG"; then
        SUCCESS=1
      else
        cat "$ERROR_LOG"
      fi
    else
      echo "Could not download a matching pg_dump version."
    fi
  else
    # Show normal pg_dump connection or other errors
    cat "$ERROR_LOG"
  fi
fi

rm -f "$ERROR_LOG"

if [ "$SUCCESS" -eq 1 ]; then
  # Gzip the backup to save disk space
  gzip -f "$BACKUP_FILE"
  GZIPPED_FILE="${BACKUP_FILE}.gz"

  echo "Backup completed successfully!"
  echo "Saved to: $GZIPPED_FILE"
  echo "File size: $(du -sh "$GZIPPED_FILE" | cut -f1)"
else
  echo "Error: Database backup failed."
  exit 1
fi
