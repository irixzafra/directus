#!/bin/bash
# ===========================================
# Business OS - Directus Setup Script
# Configura colecciones, relaciones y permisos
# ===========================================

set -e

BASE_URL="http://localhost:8055"
EMAIL="irixzafra@gmail.com"
PASSWORD="BusinessOS2024!"

echo "=========================================="
echo "  Business OS - Directus Setup"
echo "=========================================="

# 1. Login y obtener token
echo ""
echo "[1/6] Obteniendo token de acceso..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error: No se pudo obtener el token"
  echo $AUTH_RESPONSE
  exit 1
fi

echo "   Token obtenido correctamente"

# 2. Configurar proyecto (white-label)
echo ""
echo "[2/6] Configurando white-label..."
curl -s -X PATCH "$BASE_URL/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Business OS",
    "project_descriptor": "Tu plataforma de negocio",
    "project_color": "#6366f1",
    "default_language": "es-ES"
  }' > /dev/null

echo "   White-label configurado"

# 3. Crear roles adicionales
echo ""
echo "[3/6] Creando roles..."

# Obtener el ID del rol Administrator
ADMIN_ROLE_ID=$(curl -s "$BASE_URL/roles" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "   Rol Administrator: $ADMIN_ROLE_ID"

# Crear rol Manager
MANAGER_ROLE=$(curl -s -X POST "$BASE_URL/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager",
    "icon": "supervisor_account",
    "description": "Puede gestionar datos pero no configuracion del sistema"
  }')
MANAGER_ROLE_ID=$(echo $MANAGER_ROLE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "   Rol Manager creado: $MANAGER_ROLE_ID"

# Crear rol User
USER_ROLE=$(curl -s -X POST "$BASE_URL/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User",
    "icon": "person",
    "description": "Usuario basico con acceso de lectura y edicion limitada"
  }')
USER_ROLE_ID=$(echo $USER_ROLE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "   Rol User creado: $USER_ROLE_ID"

# Crear rol Recruiter
RECRUITER_ROLE=$(curl -s -X POST "$BASE_URL/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Recruiter",
    "icon": "work",
    "description": "Acceso completo a ATS, lectura en CRM"
  }')
RECRUITER_ROLE_ID=$(echo $RECRUITER_ROLE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "   Rol Recruiter creado: $RECRUITER_ROLE_ID"

# 4. Configurar relaciones entre colecciones
echo ""
echo "[4/6] Configurando relaciones..."

# applications -> candidates (M2O)
curl -s -X PATCH "$BASE_URL/fields/applications/candidate_id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "interface": "select-dropdown-m2o",
      "display": "related-values",
      "display_options": {
        "template": "{{first_name}} {{last_name}}"
      },
      "options": {
        "template": "{{first_name}} {{last_name}} ({{email}})"
      }
    },
    "schema": {
      "foreign_key_table": "candidates"
    }
  }' > /dev/null 2>&1
echo "   applications -> candidates"

# applications -> job_offers (M2O)
curl -s -X PATCH "$BASE_URL/fields/applications/job_offer_id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "interface": "select-dropdown-m2o",
      "display": "related-values",
      "display_options": {
        "template": "{{title}}"
      }
    },
    "schema": {
      "foreign_key_table": "job_offers"
    }
  }' > /dev/null 2>&1
echo "   applications -> job_offers"

# applications -> pipeline_stages (M2O)
curl -s -X PATCH "$BASE_URL/fields/applications/pipeline_stage_id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "interface": "select-dropdown-m2o",
      "display": "related-values",
      "display_options": {
        "template": "{{name}}"
      }
    },
    "schema": {
      "foreign_key_table": "pipeline_stages"
    }
  }' > /dev/null 2>&1
echo "   applications -> pipeline_stages"

# contacts -> companies (M2O)
curl -s -X PATCH "$BASE_URL/fields/contacts/company_id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "interface": "select-dropdown-m2o",
      "display": "related-values",
      "display_options": {
        "template": "{{name}}"
      }
    },
    "schema": {
      "foreign_key_table": "companies"
    }
  }' > /dev/null 2>&1
echo "   contacts -> companies"

# opportunities -> companies (M2O)
curl -s -X PATCH "$BASE_URL/fields/opportunities/company_id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "interface": "select-dropdown-m2o",
      "display": "related-values",
      "display_options": {
        "template": "{{name}}"
      }
    },
    "schema": {
      "foreign_key_table": "companies"
    }
  }' > /dev/null 2>&1
echo "   opportunities -> companies"

# opportunities -> contacts (M2O)
curl -s -X PATCH "$BASE_URL/fields/opportunities/contact_id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "interface": "select-dropdown-m2o",
      "display": "related-values",
      "display_options": {
        "template": "{{first_name}} {{last_name}}"
      }
    },
    "schema": {
      "foreign_key_table": "contacts"
    }
  }' > /dev/null 2>&1
echo "   opportunities -> contacts"

# interviews -> applications (M2O)
curl -s -X PATCH "$BASE_URL/fields/interviews/application_id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meta": {
      "interface": "select-dropdown-m2o",
      "display": "related-values"
    },
    "schema": {
      "foreign_key_table": "applications"
    }
  }' > /dev/null 2>&1
echo "   interviews -> applications"

# 5. Crear API Token para n8n
echo ""
echo "[5/6] Creando API Token para n8n..."
N8N_TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/users/me/tfa/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" 2>/dev/null || echo "skip")

# Generar token estatico
STATIC_TOKEN=$(openssl rand -hex 32)
curl -s -X PATCH "$BASE_URL/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$STATIC_TOKEN\"}" > /dev/null 2>&1

echo "   API Token generado para n8n"
echo "   Token: $STATIC_TOKEN"
echo "   (Guardalo para configurar n8n)"

# 6. Resumen
echo ""
echo "[6/6] Setup completado!"
echo ""
echo "=========================================="
echo "  RESUMEN"
echo "=========================================="
echo ""
echo "Roles creados:"
echo "  - Administrator (default)"
echo "  - Manager: $MANAGER_ROLE_ID"
echo "  - User: $USER_ROLE_ID"
echo "  - Recruiter: $RECRUITER_ROLE_ID"
echo ""
echo "Relaciones configuradas:"
echo "  - applications -> candidates, job_offers, pipeline_stages"
echo "  - contacts -> companies"
echo "  - opportunities -> companies, contacts"
echo "  - interviews -> applications"
echo ""
echo "API Token para n8n: $STATIC_TOKEN"
echo ""
echo "Accede a Directus: http://localhost:8055"
echo "=========================================="
