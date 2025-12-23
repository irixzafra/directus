#!/bin/bash

# ============================================================
# Business OS - Tenant Provisioning Script
# ============================================================
# Este script crea un entorno completo para un nuevo cliente/tenant
# Incluye: Supabase DB + Railway (Directus + Frontend + Redis)
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Banner
echo ""
echo "============================================================"
echo "  🚀 Business OS - Tenant Provisioning"
echo "============================================================"
echo ""

# Check required CLIs
check_requirements() {
    log_info "Verificando requisitos..."

    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI no instalado. Ejecuta: brew install supabase/tap/supabase"
        exit 1
    fi

    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI no instalado. Ejecuta: brew install railway"
        exit 1
    fi

    # Check if logged in
    if ! supabase projects list &> /dev/null; then
        log_error "No estas logueado en Supabase. Ejecuta: supabase login"
        exit 1
    fi

    if ! railway whoami &> /dev/null; then
        log_error "No estas logueado en Railway. Ejecuta: railway login"
        exit 1
    fi

    log_success "Requisitos verificados"
}

# Get tenant info
get_tenant_info() {
    echo ""
    read -p "📛 Nombre del tenant (ej: acme-corp): " TENANT_NAME
    read -p "📧 Email admin del tenant: " TENANT_EMAIL
    read -p "🌍 Region [eu-central-1]: " TENANT_REGION
    TENANT_REGION=${TENANT_REGION:-eu-central-1}

    # Generate secure password
    DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 20)
    ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9!@#' | head -c 16)
    SECRET_KEY=$(openssl rand -hex 32)

    # Sanitize tenant name
    TENANT_SLUG=$(echo "$TENANT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')

    echo ""
    log_info "Configuracion del tenant:"
    echo "  - Nombre: $TENANT_NAME"
    echo "  - Slug: $TENANT_SLUG"
    echo "  - Email: $TENANT_EMAIL"
    echo "  - Region: $TENANT_REGION"
    echo ""
    read -p "¿Continuar? (y/n): " CONFIRM
    if [[ $CONFIRM != "y" ]]; then
        log_warn "Cancelado por el usuario"
        exit 0
    fi
}

# Create Supabase project
create_supabase_project() {
    log_info "Creando proyecto Supabase: $TENANT_SLUG..."

    # Get org ID (use first org)
    ORG_ID=$(supabase orgs list --output json 2>/dev/null | jq -r '.[0].id // empty')

    if [[ -z "$ORG_ID" ]]; then
        log_error "No se encontro organizacion en Supabase"
        exit 1
    fi

    # Create project
    SUPABASE_OUTPUT=$(supabase projects create "$TENANT_SLUG" \
        --org-id "$ORG_ID" \
        --db-password "$DB_PASSWORD" \
        --region "$TENANT_REGION" \
        --output json 2>&1) || true

    # Extract project ref
    SUPABASE_REF=$(echo "$SUPABASE_OUTPUT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [[ -z "$SUPABASE_REF" ]]; then
        # Try to get from projects list
        sleep 5
        SUPABASE_REF=$(supabase projects list --output json 2>/dev/null | jq -r ".[] | select(.name==\"$TENANT_SLUG\") | .id")
    fi

    if [[ -z "$SUPABASE_REF" ]]; then
        log_error "No se pudo crear proyecto Supabase"
        exit 1
    fi

    log_success "Proyecto Supabase creado: $SUPABASE_REF"

    # Wait for project to be ready
    log_info "Esperando que el proyecto este listo (30s)..."
    sleep 30

    # Build connection string
    SUPABASE_URL="https://${SUPABASE_REF}.supabase.co"
    DB_CONNECTION="postgresql://postgres.${SUPABASE_REF}:${DB_PASSWORD}@aws-0-${TENANT_REGION}.pooler.supabase.com:6543/postgres"
}

# Apply schema to Supabase
apply_schema() {
    log_info "Aplicando schema a Supabase..."

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    SCHEMA_FILE="$SCRIPT_DIR/../init-db/01-create-schemas.sql"

    if [[ ! -f "$SCHEMA_FILE" ]]; then
        log_error "Schema file no encontrado: $SCHEMA_FILE"
        exit 1
    fi

    # Link and push
    cd "$SCRIPT_DIR/.."
    supabase link --project-ref "$SUPABASE_REF" -p "$DB_PASSWORD" 2>/dev/null || true

    # Create migration if not exists
    mkdir -p supabase/migrations
    cp "$SCHEMA_FILE" "supabase/migrations/00000000000000_initial.sql" 2>/dev/null || true

    supabase db push -p "$DB_PASSWORD" --include-all 2>&1 || log_warn "Schema ya aplicado o error menor"

    log_success "Schema aplicado"
}

# Create Railway project
create_railway_project() {
    log_info "Creando proyecto Railway: $TENANT_SLUG..."

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR/.."

    # Create project
    railway init --name "$TENANT_SLUG" 2>&1 || true

    # Get project info
    RAILWAY_PROJECT=$(railway status --output json 2>/dev/null | jq -r '.project // empty')

    log_success "Proyecto Railway creado"
}

# Deploy services to Railway
deploy_railway_services() {
    log_info "Desplegando servicios en Railway..."

    # Add Redis
    log_info "Agregando Redis..."
    railway add -d redis -s redis 2>&1 || log_warn "Redis ya existe o requiere confirmacion manual"

    # Get Redis URL (will be available after deploy)
    REDIS_URL='${{Redis.REDIS_URL}}'

    # Create Directus service from Docker image
    log_info "Agregando Directus..."
    railway add -i directus/directus:latest -s directus 2>&1 || log_warn "Requiere confirmacion manual"

    # Create Frontend service from repo
    log_info "Agregando Frontend..."
    railway add -r "irixzafra/directus" -s frontend 2>&1 || log_warn "Requiere confirmacion manual"

    log_success "Servicios agregados (pueden requerir configuracion manual)"
}

# Generate environment variables
generate_env_vars() {
    log_info "Generando variables de entorno..."

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ENV_FILE="$SCRIPT_DIR/../tenants/${TENANT_SLUG}.env"

    mkdir -p "$SCRIPT_DIR/../tenants"

    cat > "$ENV_FILE" << EOF
# ============================================================
# Tenant: $TENANT_NAME
# Created: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# ============================================================

# Tenant Info
TENANT_NAME=$TENANT_NAME
TENANT_SLUG=$TENANT_SLUG
TENANT_EMAIL=$TENANT_EMAIL

# Supabase
SUPABASE_PROJECT_REF=$SUPABASE_REF
SUPABASE_URL=$SUPABASE_URL
DATABASE_URL=$DB_CONNECTION
DB_PASSWORD=$DB_PASSWORD

# Directus
DIRECTUS_SECRET=$SECRET_KEY
DIRECTUS_ADMIN_EMAIL=$TENANT_EMAIL
DIRECTUS_ADMIN_PASSWORD=$ADMIN_PASSWORD

# Railway URLs (actualizar despues del deploy)
DIRECTUS_URL=https://${TENANT_SLUG}-directus.up.railway.app
FRONTEND_URL=https://${TENANT_SLUG}-frontend.up.railway.app

# Redis (Railway internal)
REDIS_URL=\${{Redis.REDIS_URL}}
EOF

    log_success "Variables guardadas en: tenants/${TENANT_SLUG}.env"
}

# Generate Railway env vars for Directus
generate_railway_directus_vars() {
    cat << EOF

============================================================
📋 Variables de entorno para Directus en Railway:
============================================================

KEY=VALUE
-----
SECRET=$SECRET_KEY
DB_CLIENT=pg
DB_CONNECTION_STRING=$DB_CONNECTION
ADMIN_EMAIL=$TENANT_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
PUBLIC_URL=https://${TENANT_SLUG}-directus.up.railway.app
CACHE_ENABLED=true
CACHE_STORE=redis
REDIS_HOST=\${{Redis.REDIS_PRIVATE_HOST}}
REDIS_PORT=6379

EOF
}

# Generate Railway env vars for Frontend
generate_railway_frontend_vars() {
    cat << EOF

============================================================
📋 Variables de entorno para Frontend en Railway:
============================================================

KEY=VALUE
-----
NEXT_PUBLIC_DIRECTUS_URL=https://${TENANT_SLUG}-directus.up.railway.app

EOF
}

# Summary
print_summary() {
    echo ""
    echo "============================================================"
    echo "  ✅ Tenant Provisioning Completado"
    echo "============================================================"
    echo ""
    echo "  📛 Tenant: $TENANT_NAME ($TENANT_SLUG)"
    echo ""
    echo "  🗄️  Supabase:"
    echo "      - Project: $SUPABASE_REF"
    echo "      - URL: $SUPABASE_URL"
    echo ""
    echo "  🚂 Railway:"
    echo "      - Directus: https://${TENANT_SLUG}-directus.up.railway.app"
    echo "      - Frontend: https://${TENANT_SLUG}-frontend.up.railway.app"
    echo ""
    echo "  🔐 Admin Credentials:"
    echo "      - Email: $TENANT_EMAIL"
    echo "      - Password: $ADMIN_PASSWORD"
    echo ""
    echo "  📁 Config guardado en: tenants/${TENANT_SLUG}.env"
    echo ""
    echo "============================================================"
    echo ""
    echo "  ⚠️  SIGUIENTE PASO:"
    echo "  Abre Railway Dashboard y configura las variables de entorno"
    echo "  mostradas arriba para cada servicio."
    echo ""
    generate_railway_directus_vars
    generate_railway_frontend_vars
}

# Main
main() {
    check_requirements
    get_tenant_info
    create_supabase_project
    apply_schema
    create_railway_project
    deploy_railway_services
    generate_env_vars
    print_summary
}

# Run
main "$@"
