#!/usr/bin/env bash
set -e
docker compose -f infra/docker-compose.yml up -d
# run migrations
psql "$DATABASE_URL" -f infra/migrations/001_init.sql
