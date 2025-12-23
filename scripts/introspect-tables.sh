#!/bin/bash
# ===========================================
# Introspect existing PostgreSQL tables into Directus
# ===========================================

BASE_URL="http://localhost:8055"
EMAIL="irixzafra@gmail.com"
PASSWORD="BusinessOS2024!"

echo "Obteniendo token..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error: No se pudo obtener el token"
  exit 1
fi

echo "Token OK"
echo ""

# Tables to register (existing in PostgreSQL)
TABLES=(
  "tenants:domain:core:Organizations"
  "profiles:person:core:User profiles"
  "user_tenants:group:core:User-tenant mapping"
  "pipeline_stages:view_kanban:ats:Pipeline stages"
  "job_offers:work:ats:Job offers"
  "candidates:person_search:ats:Candidates"
  "applications:description:ats:Job applications"
  "interviews:event:ats:Interviews"
  "companies:business:crm:Companies"
  "contacts:contacts:crm:Contacts"
  "opportunities:monetization_on:crm:Opportunities"
  "activities:history:crm:Activities"
  "tasks:task_alt::Tasks"
  "conversations:forum:communication:Conversations"
  "messages:message:communication:Messages"
  "workflows:account_tree:system:Workflows"
  "workflow_runs:play_circle:system:Workflow runs"
  "integrations:extension:system:Integrations"
  "ai_prompts:psychology:system:AI Prompts"
  "ai_usage_logs:analytics:system:AI Usage"
  "activity_logs:history_edu:system:Activity logs"
  "settings:tune:system:Settings"
  "feature_flags:flag:system:Feature flags"
)

for table_info in "${TABLES[@]}"; do
  IFS=':' read -r table icon group note <<< "$table_info"

  echo -n "Registrando $table... "

  # Build group JSON - null or string
  if [ -z "$group" ]; then
    GROUP_JSON="null"
  else
    GROUP_JSON="\"$group\""
  fi

  # Create collection pointing to existing table
  RESPONSE=$(curl -s -X POST "$BASE_URL/collections" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"collection\": \"$table\",
      \"meta\": {
        \"collection\": \"$table\",
        \"icon\": \"$icon\",
        \"note\": \"$note\",
        \"group\": $GROUP_JSON,
        \"hidden\": false,
        \"singleton\": false,
        \"accountability\": \"all\"
      },
      \"schema\": {
        \"name\": \"$table\"
      },
      \"fields\": []
    }")

  if echo "$RESPONSE" | grep -q '"data"'; then
    echo "OK"
  elif echo "$RESPONSE" | grep -q 'already exists'; then
    echo "ya existe"
  elif echo "$RESPONSE" | grep -q 'DUPLICATE_COLLECTION'; then
    echo "ya existe"
  else
    echo "revisar"
    echo "$RESPONSE" | head -c 200
    echo ""
  fi
done

echo ""
echo "Verificando colecciones..."
curl -s "$BASE_URL/collections" \
  -H "Authorization: Bearer $TOKEN" | \
  grep -o '"collection":"[^"]*"' | \
  grep -v 'directus_' | \
  cut -d'"' -f4 | \
  sort

echo ""
echo "Done!"
