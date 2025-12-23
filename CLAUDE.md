# Claude - Business OS Engineer

> **Rol:** Full-Stack Engineer (Frontend + Backend + Deploy)
> **Stack:** Railway + Directus + n8n + Supabase (solo DB)
> **Version:** 1.1.0
> **Actualizado:** 2025-12-23

---

## Decisiones Arquitectonicas (ADR)

### ADR-001: Sistema de Autenticacion

**Decision:** Solo Directus Auth. NO usar Supabase Auth.

**Contexto:** Tener dos sistemas de auth (Directus + Supabase) crea una "crisis de identidad" con usuarios duplicados y sincronizacion compleja.

**Consecuencias:**
- Login/registro via `@directus/sdk`
- Supabase usado SOLO como PostgreSQL "mudo"
- Si necesitamos OAuth social, usar Directus SSO

### ADR-002: Multi-Tenancy

**Decision:** Hibrido - Empezar sin `tenant_id`, escalar con instancias separadas.

**Contexto:**
- `tenant_id` en todas las tablas = complejo, riesgo de leaks
- Instancias separadas = simple, seguro, pero mas caro

**Plan:**
1. **MVP:** Sin multi-tenancy (un cliente)
2. **Primeros clientes:** Instancia separada por cliente (Railway permite clonar)
3. **Escala masiva:** Evaluar migracion a `tenant_id` + RLS

### ADR-003: Supabase vs PostgreSQL Local

**Decision:** PostgreSQL local para desarrollo, Supabase para produccion.

**Nota:** Supabase tiene extensiones especificas (pgvector, etc). Para features de IA, instalar las mismas extensiones localmente o usar Supabase CLI.

### ADR-004: n8n Queue Mode

**Decision:** Usar Queue Mode con Redis para mejor rendimiento.

**Implementacion:** Worker separado procesando en background.

---

## Mi Rol

Soy el ingeniero responsable de:

| Area | Herramientas | Responsabilidad |
|------|--------------|-----------------|
| **Frontend** | React/Next.js, Tailwind, @directus/sdk | UI, integracion API |
| **Backend** | Directus, PostgreSQL | Colecciones, permisos, flows |
| **Automatizacion** | n8n | Workflows, webhooks |
| **Base de Datos** | Supabase (solo PostgreSQL) | Schema, migraciones |
| **Deploy** | Railway | CI/CD, hosting |

---

## Stack Tecnologico

```
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS OS STACK                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LOCAL (Desarrollo)           PRODUCCION                    │
│  ────────────────────         ───────────────────           │
│                                                              │
│  ┌──────────────┐             ┌──────────────┐              │
│  │  PostgreSQL  │             │   Supabase   │              │
│  │    :5432     │     →       │  (solo DB)   │              │
│  └──────────────┘             └──────────────┘              │
│         │                            │                       │
│  ┌──────────────┐             ┌──────────────┐              │
│  │   Directus   │             │   Directus   │              │
│  │    :8055     │     →       │   Railway    │              │
│  │  (Auth+API)  │             │  (Auth+API)  │              │
│  └──────────────┘             └──────────────┘              │
│         │                            │                       │
│  ┌──────────────┐             ┌──────────────┐              │
│  │     n8n      │             │     n8n      │              │
│  │    :5678     │     →       │   Railway    │              │
│  │  + Worker    │             │  + Worker    │              │
│  └──────────────┘             └──────────────┘              │
│         │                            │                       │
│  ┌──────────────┐             ┌──────────────┐              │
│  │    Redis     │             │    Redis     │              │
│  │    :6379     │     →       │   Railway    │              │
│  └──────────────┘             └──────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**IMPORTANTE:** Supabase se usa SOLO como base de datos PostgreSQL.
NO usar `supabase-js` para Auth ni queries. Usar `@directus/sdk`.

---

## Estructura del Proyecto

```
/Users/irix/Documents/GitHub/Directus/
│
├── CLAUDE.md                 # Este archivo
├── README.md                 # Documentacion general
├── docker-compose.yml        # Servicios locales (5 containers)
├── .env                      # Variables de entorno
├── .env.example              # Template
│
├── init-db/                  # SQL de inicializacion
│   └── 01-create-schemas.sql # Schema (sin tenant_id por ahora)
│
├── uploads/                  # Archivos Directus
├── extensions/               # Extensiones custom Directus
├── snapshots/                # Schema snapshots
├── backups/                  # Backups de BD
├── scripts/                  # Scripts de configuracion
│
├── frontend/                 # (FUTURO) App Next.js
│   └── ...
│
└── n8n-workflows/            # Workflows exportados
    └── *.json
```

---

## Comandos

### Docker (Local)

```bash
# Iniciar todo (5 servicios)
docker-compose up -d

# Ver logs
docker-compose logs -f directus
docker-compose logs -f n8n

# Reiniciar
docker-compose restart directus

# Parar
docker-compose down
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker exec -it business-os-db psql -U directus -d business_os

# Backup
docker exec business-os-db pg_dump -U directus business_os > backups/backup_$(date +%Y%m%d).sql

# Ver tablas
docker exec business-os-db psql -U directus -d business_os -c "\dt"
```

### Directus CLI

```bash
# Crear usuario
docker exec business-os-directus npx directus users create --email "user@email.com" --password "pass" --role "ROLE_ID"

# Resetear password
docker exec business-os-directus npx directus users passwd --email "user@email.com" --password "newpass"

# Exportar schema
docker exec business-os-directus npx directus schema snapshot ./snapshots/snapshot.yaml
```

---

## Acceso Local

| Servicio | URL | Usuario | Password |
|----------|-----|---------|----------|
| **Frontend** | http://localhost:3000 | irixzafra@gmail.com | BusinessOS2024! |
| **Directus** | http://localhost:8055 | irixzafra@gmail.com | BusinessOS2024! |
| **n8n** | http://localhost:5678 | admin | Admin123! |
| **PostgreSQL** | localhost:5432 | directus | directus_secure_2024 |
| **Redis** | localhost:6379 | - | - |

---

## Schema de Base de Datos

### Modulos Actuales

| Modulo | Tablas | Estado |
|--------|--------|--------|
| **Core** | tenants, profiles, user_tenants | Sin tenant_id (MVP) |
| **ATS** | job_offers, candidates, applications, pipeline_stages, interviews | Listo |
| **CRM** | companies, contacts, opportunities, activities | Listo |
| **Tasks** | tasks | Listo |
| **Communication** | conversations, messages | Listo |
| **Workflows** | workflows, workflow_runs | Listo |
| **AI** | ai_prompts, ai_usage_logs | Listo |
| **Settings** | settings, feature_flags | Listo |

### Patron: Custom Fields (JSONB)

```sql
-- Campos flexibles sin migraciones
custom_fields JSONB DEFAULT '{}'

-- Uso
UPDATE candidates
SET custom_fields = custom_fields || '{"salary": 50000}'
WHERE id = 'uuid';
```

---

## Integracion Frontend

### SDK de Directus (RECOMENDADO)

```typescript
import { createDirectus, rest, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
  .with(authentication())
  .with(rest());

// Login
await client.login('email', 'password');

// Fetch
const candidates = await client.request(
  readItems('candidates', {
    filter: { status: { _eq: 'active' } },
    limit: 50
  })
);
```

### NO usar Supabase SDK para Auth

```typescript
// INCORRECTO - NO HACER
import { createClient } from '@supabase/supabase-js';
await supabase.auth.signIn(...); // ← PROHIBIDO

// CORRECTO
import { createDirectus } from '@directus/sdk';
await client.login(...); // ← USAR ESTO
```

---

## n8n - Workflows

### Conexion con Directus

- **URL interna:** `http://directus:8055` (desde contenedor)
- **Auth:** API Token (crear en Directus > Settings > Access Tokens)

### Workflows Recomendados

1. **Nuevo candidato** → Email de confirmacion
2. **Cambio de pipeline stage** → Notificacion
3. **Oferta cerrada** → Estadisticas
4. **Inactividad** → Recordatorio

---

## Deploy a Railway

### Paso 1: Crear Proyecto

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway init
```

### Paso 2: Desplegar Servicios

1. **PostgreSQL**: Usar add-on de Railway o conectar Supabase
2. **Redis**: Add-on de Railway
3. **Directus**: Template de Railway o docker-compose
4. **n8n**: Template de Railway

### Variables de Entorno (Railway)

```bash
# Directus
SECRET=generate-random-32-chars
DB_CLIENT=pg
DB_CONNECTION_STRING=postgresql://...
PUBLIC_URL=https://directus.tudominio.com

# n8n
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=...
EXECUTIONS_MODE=queue
QUEUE_BULL_REDIS_HOST=...
```

---

## Checklist

### Fase 1: Setup Local (COMPLETADO)
- [x] Docker Compose con 5 servicios
- [x] PostgreSQL + Redis
- [x] Directus con Auth
- [x] n8n en Queue Mode
- [x] Schema SQL inicial

### Fase 2: Configuracion Directus (COMPLETADO)
- [x] Configurar relaciones entre colecciones
- [x] Crear roles: Admin, Manager, Recruiter, User
- [x] Configurar permisos
- [x] White-label personalizado
- [x] API Token para n8n

### Fase 3: Automatizaciones (COMPLETADO)
- [x] Conectar n8n con Directus (API Token)
- [x] Crear workflow: Nuevo candidato
- [x] Crear workflow: Cambio de etapa
- [x] Documentacion de webhooks

### Fase 4: Frontend (COMPLETADO)
- [x] Crear app Next.js 16 con TypeScript
- [x] Integrar @directus/sdk
- [x] Login/registro con Directus Auth
- [x] Dashboard con estadisticas
- [x] ATS: Candidatos y Ofertas
- [x] CRM: Empresas, Contactos, Oportunidades
- [x] Pagina de configuracion

### Fase 5: Produccion (EN PROGRESO)
- [x] Crear proyecto Supabase (BusinessOS - Frankfurt)
- [x] Migrar schema a Supabase (50+ tablas)
- [x] Crear proyecto Railway (BusinessOS)
- [x] Configurar servicios Railway (Dockerfiles)
- [x] Subir codigo a GitHub
- [ ] Deploy Directus en Railway
- [ ] Deploy n8n + Worker en Railway
- [ ] Deploy Frontend en Railway
- [ ] Configurar dominios

---

## Produccion - Railway

### Servicios por Tenant

Cada tenant tiene su propio stack:

| Servicio | Imagen/Build | Puerto |
|----------|--------------|--------|
| **Redis** | Railway Add-on | 6379 |
| **Directus** | directus/directus:latest | 8055 |
| **n8n** | n8nio/n8n:latest | 5678 |
| **n8n-worker** | n8nio/n8n:latest | - |
| **Frontend** | Next.js (GitHub) | 3000 |

### Estructura de Carpetas

```
services/
├── directus/
│   ├── Dockerfile
│   └── railway.toml
├── n8n/
│   ├── Dockerfile
│   └── railway.toml
└── n8n-worker/
    ├── Dockerfile
    └── railway.toml
```

### Provisionamiento de Nuevos Tenants

```bash
# Crear nuevo tenant
./scripts/provision-tenant.sh

# El script crea automaticamente:
# 1. Proyecto Supabase con schema
# 2. Proyecto Railway con servicios
# 3. Variables de entorno
# 4. Archivo de configuracion en tenants/
```

---

## Credenciales Produccion

### Supabase (BusinessOS)

| Campo | Valor |
|-------|-------|
| Project Ref | hzuriwzjrwnoreschupz |
| Region | Central EU (Frankfurt) |
| URL | https://hzuriwzjrwnoreschupz.supabase.co |

### Railway (BusinessOS)

| Campo | Valor |
|-------|-------|
| Project ID | 80754abf-8093-4b23-a4c9-d2a69e5e07c5 |
| Dashboard | https://railway.com/project/80754abf-8093-4b23-a4c9-d2a69e5e07c5 |

### GitHub

| Campo | Valor |
|-------|-------|
| Repo | https://github.com/irixzafra/directus |

---

**Ultima actualizacion:** 2025-12-23
