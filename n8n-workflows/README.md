# n8n Workflows - Business OS

## Configuracion Inicial

### 1. Crear Credencial en n8n

1. Acceder a n8n: http://localhost:5678
2. Ir a **Settings > Credentials**
3. Click **Add Credential**
4. Seleccionar **Header Auth**
5. Configurar:
   - Name: `Directus API Token`
   - Name: `Authorization`
   - Value: `Bearer ff454ba11151be313d5dc4d967bbab5e788bc3419f7bd8d8c04aad575496bba0`

### 2. Importar Workflows

1. En n8n, ir a **Workflows**
2. Click **Import from File**
3. Seleccionar los archivos JSON de este directorio

### 3. Configurar Webhooks en Directus

#### Webhook: Nuevo Candidato

1. Ir a Directus: http://localhost:8055
2. Settings > Webhooks
3. Click **Create Webhook**
4. Configurar:
   - Name: `n8n - Nuevo Candidato`
   - Status: Active
   - Method: POST
   - URL: `http://n8n:5678/webhook/new-candidate`
   - Actions: Create
   - Collections: candidates

#### Webhook: Cambio de Pipeline

1. Settings > Webhooks
2. Click **Create Webhook**
3. Configurar:
   - Name: `n8n - Cambio Pipeline`
   - Status: Active
   - Method: POST
   - URL: `http://n8n:5678/webhook/pipeline-change`
   - Actions: Update
   - Collections: applications

## Workflows Incluidos

### 1. new-candidate-notification.json

**Trigger:** Cuando se crea un nuevo candidato

**Acciones:**
1. Recibe webhook de Directus
2. Obtiene detalles del candidato
3. Valida que tenga email
4. Formatea mensaje de notificacion
5. Log del resultado (extender para enviar email/Slack)

### 2. pipeline-stage-change.json

**Trigger:** Cuando se actualiza una aplicacion (cambio de etapa)

**Acciones:**
1. Recibe webhook de Directus
2. Obtiene detalles de la aplicacion con relaciones
3. Procesa el cambio de etapa
4. Si es "hired", genera mensaje de celebracion
5. Log del cambio

## Extender Workflows

### Agregar Notificaciones por Email

Agregar nodo **Send Email** despues del formateo:

```
Node: Send Email
To: {{ $json.candidate.email }}
Subject: {{ $json.subject }}
Body: {{ $json.message }}
```

### Agregar Notificaciones Slack

1. Crear credencial Slack en n8n
2. Agregar nodo **Slack** despues del formateo:

```
Node: Slack
Channel: #hiring
Message: {{ $json.message }}
```

## URLs de Referencia

| Servicio | URL Interna (Docker) | URL Local |
|----------|---------------------|-----------|
| Directus | http://directus:8055 | http://localhost:8055 |
| n8n | http://n8n:5678 | http://localhost:5678 |

## API Token Directus

```
ff454ba11151be313d5dc4d967bbab5e788bc3419f7bd8d8c04aad575496bba0
```

**IMPORTANTE:** Este token tiene permisos de Admin. En produccion, crear un token con permisos limitados.
