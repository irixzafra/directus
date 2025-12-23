#!/bin/bash

# ============================================================
# Business OS - Quick Deploy (Current Project)
# ============================================================
# Despliega el proyecto actual a Railway + Supabase
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo ""
echo "🚀 Business OS - Quick Deploy"
echo "=============================="
echo ""

# Load Supabase config if exists
if [[ -f "$PROJECT_DIR/.env.supabase" ]]; then
    source "$PROJECT_DIR/.env.supabase"
    log "Configuracion Supabase cargada"
fi

# Check Railway project
log "Verificando proyecto Railway..."
RAILWAY_STATUS=$(railway status 2>&1) || true
echo "$RAILWAY_STATUS"

# Deploy via GitHub
log "Conectando repositorio GitHub..."
railway link 2>&1 || warn "Proyecto ya linkeado"

# Deploy from GitHub
log "Desplegando desde GitHub..."
railway up --detach 2>&1 || warn "Deploy iniciado o requiere configuracion"

echo ""
echo "============================================================"
echo "  📋 Configuracion Manual Requerida"
echo "============================================================"
echo ""
echo "  1. Abre: https://railway.app/dashboard"
echo ""
echo "  2. En el proyecto BusinessOS, agrega:"
echo "     - Redis (Database > Redis)"
echo "     - Directus (Docker Image: directus/directus:latest)"
echo "     - Frontend (GitHub Repo: irixzafra/directus, Root: /frontend)"
echo ""
echo "  3. Configura variables de Directus:"
echo "     SECRET=$(openssl rand -hex 32)"
echo "     DB_CLIENT=pg"
echo "     DB_CONNECTION_STRING=${DATABASE_URL:-[ver .env.supabase]}"
echo "     ADMIN_EMAIL=irixzafra@gmail.com"
echo "     ADMIN_PASSWORD=BusinessOS2024!"
echo "     PUBLIC_URL=https://[tu-url].up.railway.app"
echo "     CACHE_ENABLED=true"
echo "     CACHE_STORE=redis"
echo "     REDIS=\${{Redis.REDIS_URL}}"
echo ""
echo "  4. Configura variables de Frontend:"
echo "     NEXT_PUBLIC_DIRECTUS_URL=https://[directus-url].up.railway.app"
echo ""
echo "============================================================"
