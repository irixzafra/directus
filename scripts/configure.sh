#!/bin/bash
# Script para configurar Business OS

BASE_URL="http://localhost:8055"

# Login y obtener token
echo "Obteniendo token de acceso..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"irixzafra@gmail.com","password":"BusinessOS2024!"}')

TOKEN=$(echo $AUTH_RESPONSE | jq -r '.data.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Error: No se pudo obtener el token"
  echo $AUTH_RESPONSE
  exit 1
fi

echo "Token obtenido correctamente"

# Configurar proyecto (white-label)
echo "Configurando white-label..."
curl -s -X PATCH "$BASE_URL/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Business OS",
    "project_descriptor": "Tu plataforma de negocio",
    "project_color": "#6366f1",
    "default_language": "es-ES"
  }' | jq '.data.project_name'

echo ""
echo "Configuracion completada!"
echo "Accede a: http://localhost:8055"
echo "Usuario: irixzafra@gmail.com"
echo "Password: BusinessOS2024!"
