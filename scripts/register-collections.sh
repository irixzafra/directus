#!/bin/bash
# ===========================================
# Business OS - Register Collections Script
# Registra las tablas existentes como colecciones en Directus
# ===========================================

set -e

BASE_URL="http://localhost:8055"
EMAIL="irixzafra@gmail.com"
PASSWORD="BusinessOS2024!"

echo "=========================================="
echo "  Registrando Colecciones en Directus"
echo "=========================================="

# 1. Login
echo ""
echo "[1] Obteniendo token..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error: No se pudo obtener el token"
  exit 1
fi
echo "   Token OK"

# Function to register a collection
register_collection() {
  local collection=$1
  local icon=$2
  local note=$3
  local group=$4

  echo -n "   Registrando $collection... "

  local response=$(curl -s -X POST "$BASE_URL/collections" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"collection\": \"$collection\",
      \"meta\": {
        \"collection\": \"$collection\",
        \"icon\": \"$icon\",
        \"note\": \"$note\",
        \"group\": $group,
        \"hidden\": false,
        \"singleton\": false,
        \"sort_field\": null,
        \"archive_field\": null,
        \"archive_value\": null,
        \"unarchive_value\": null,
        \"archive_app_filter\": true,
        \"accountability\": \"all\"
      },
      \"schema\": {}
    }")

  if echo "$response" | grep -q '"data"'; then
    echo "OK"
  elif echo "$response" | grep -q "already exists"; then
    echo "ya existe"
  else
    echo "error"
    # echo "$response"
  fi
}

# 2. Create folder groups first
echo ""
echo "[2] Creando grupos de carpetas..."

# Core folder
curl -s -X POST "$BASE_URL/collections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "core",
    "meta": {
      "collection": "core",
      "icon": "folder",
      "note": "Core system tables",
      "hidden": false
    },
    "schema": null
  }' > /dev/null 2>&1
echo "   core folder"

# ATS folder
curl -s -X POST "$BASE_URL/collections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "ats",
    "meta": {
      "collection": "ats",
      "icon": "work",
      "note": "Applicant Tracking System",
      "hidden": false
    },
    "schema": null
  }' > /dev/null 2>&1
echo "   ats folder"

# CRM folder
curl -s -X POST "$BASE_URL/collections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "crm",
    "meta": {
      "collection": "crm",
      "icon": "handshake",
      "note": "Customer Relationship Management",
      "hidden": false
    },
    "schema": null
  }' > /dev/null 2>&1
echo "   crm folder"

# Communication folder
curl -s -X POST "$BASE_URL/collections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "communication",
    "meta": {
      "collection": "communication",
      "icon": "chat",
      "note": "Messaging and communication",
      "hidden": false
    },
    "schema": null
  }' > /dev/null 2>&1
echo "   communication folder"

# System folder
curl -s -X POST "$BASE_URL/collections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "system",
    "meta": {
      "collection": "system",
      "icon": "settings",
      "note": "System configuration",
      "hidden": false
    },
    "schema": null
  }' > /dev/null 2>&1
echo "   system folder"

# 3. Register collections
echo ""
echo "[3] Registrando colecciones..."

# Core collections
register_collection "tenants" "domain" "Organizations/Tenants" '"core"'
register_collection "profiles" "person" "User profiles" '"core"'
register_collection "user_tenants" "group" "User-Tenant relationships" '"core"'

# ATS collections
register_collection "pipeline_stages" "view_kanban" "Pipeline stages" '"ats"'
register_collection "job_offers" "work" "Job offers/positions" '"ats"'
register_collection "candidates" "person_search" "Candidate pool" '"ats"'
register_collection "applications" "description" "Job applications" '"ats"'
register_collection "interviews" "event" "Scheduled interviews" '"ats"'

# CRM collections
register_collection "companies" "business" "Companies/Accounts" '"crm"'
register_collection "contacts" "contacts" "Contacts" '"crm"'
register_collection "opportunities" "monetization_on" "Sales opportunities" '"crm"'
register_collection "activities" "history" "Activities/Timeline" '"crm"'

# Tasks
register_collection "tasks" "task_alt" "Tasks" 'null'

# Communication
register_collection "conversations" "forum" "Conversations" '"communication"'
register_collection "messages" "message" "Messages" '"communication"'

# Workflows
register_collection "workflows" "account_tree" "Automation workflows" '"system"'
register_collection "workflow_runs" "play_circle" "Workflow executions" '"system"'

# Integrations
register_collection "integrations" "extension" "External integrations" '"system"'

# AI
register_collection "ai_prompts" "psychology" "AI prompts" '"system"'
register_collection "ai_usage_logs" "analytics" "AI usage logs" '"system"'

# Audit
register_collection "activity_logs" "history_edu" "Activity audit logs" '"system"'

# Settings
register_collection "settings" "tune" "System settings" '"system"'
register_collection "feature_flags" "flag" "Feature flags" '"system"'

echo ""
echo "=========================================="
echo "  Colecciones Registradas!"
echo "=========================================="
echo ""
echo "Ahora ejecuta: ./scripts/setup-directus.sh"
echo "Para configurar relaciones y roles"
echo ""
