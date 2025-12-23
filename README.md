# Business OS Stack

> Directus + PostgreSQL + n8n - Tu plataforma de negocio no-code/low-code

## Stack Tecnologico

| Componente | Rol | URL Local |
|------------|-----|-----------|
| **PostgreSQL 15** | Base de Datos | `localhost:5432` |
| **Redis 7** | Cache + Colas | `localhost:6379` |
| **Directus 11** | Backend + Admin Panel | http://localhost:8055 |
| **n8n** | Automatizaciones | http://localhost:5678 |

## Quick Start

### 1. Iniciar servicios

```bash
# Desde esta carpeta
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver solo Directus
docker-compose logs -f directus
```

### 2. Acceder a las aplicaciones

| App | URL | Usuario | Password |
|-----|-----|---------|----------|
| **Directus** | http://localhost:8055 | `admin@business-os.local` | `Admin123!` |
| **n8n** | http://localhost:5678 | `admin` | `Admin123!` |

### 3. Comandos utiles

```bash
# Parar todos los servicios
docker-compose down

# Parar y eliminar volumenes (CUIDADO: borra datos)
docker-compose down -v

# Reiniciar un servicio
docker-compose restart directus

# Ver estado
docker-compose ps

# Entrar a PostgreSQL
docker exec -it business-os-db psql -U directus -d business_os

# Backup de la base de datos
docker exec business-os-db pg_dump -U directus business_os > backups/backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i business-os-db psql -U directus business_os < backups/backup_20241223.sql
```

## Estructura del Proyecto

```
Directus/
├── docker-compose.yml      # Orquestacion de servicios
├── .env                    # Variables de entorno (no commitear)
├── .env.example            # Template de variables
├── init-db/
│   └── 01-create-schemas.sql  # Schema inicial (ATS, CRM, etc.)
├── uploads/                # Archivos subidos a Directus
├── extensions/             # Extensiones custom de Directus
├── snapshots/              # Schema snapshots de Directus
└── backups/                # Backups de BD
```

## Schema de Base de Datos

El schema esta basado en Highlander ATS e incluye:

### Core
- `tenants` - Organizaciones (multi-tenancy)
- `profiles` - Usuarios del sistema
- `user_tenants` - Relacion usuario-tenant

### ATS (Applicant Tracking)
- `job_offers` - Ofertas de trabajo
- `candidates` - Pool de candidatos
- `applications` - Candidaturas
- `pipeline_stages` - Etapas del pipeline
- `interviews` - Entrevistas

### CRM
- `companies` - Empresas/Cuentas
- `contacts` - Contactos
- `opportunities` - Oportunidades de venta
- `activities` - Llamadas, emails, reuniones

### Otros
- `tasks` - Gestion de tareas
- `workflows` - Automatizaciones
- `integrations` - Conexiones externas
- `ai_prompts` - Templates de IA
- `activity_logs` - Auditoria

## Configurar Directus

### 1. Crear colecciones desde el schema

Directus detectara automaticamente las tablas creadas. Para configurar:

1. Ir a **Settings > Data Model**
2. Cada tabla aparece como coleccion
3. Configurar campos, relaciones y permisos

### 2. Configurar relaciones

Ejemplo de relaciones a configurar:

```
applications → candidates (M2O)
applications → job_offers (M2O)
applications → pipeline_stages (M2O)
contacts → companies (M2O)
opportunities → companies (M2O)
opportunities → contacts (M2O)
```

### 3. Crear roles y permisos

1. **Settings > Access Control**
2. Crear roles: `Admin`, `Manager`, `Recruiter`, `User`
3. Asignar permisos por coleccion

## Configurar n8n

### 1. Conectar con Directus

1. En n8n, crear credencial **Directus**
2. URL: `http://directus:8055` (nombre del contenedor)
3. Token: Generar en Directus > Settings > Access Tokens

### 2. Workflows recomendados

- **Nuevo candidato** → Email de confirmacion
- **Cambio de etapa** → Notificacion Slack
- **Oferta cerrada** → Actualizar estadisticas
- **Nueva oportunidad** → Crear tareas de seguimiento

## Migrar a Supabase (Produccion)

Para usar Supabase en lugar de PostgreSQL local:

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar Connection String
3. En `.env`, cambiar:

```env
# Comentar estas lineas:
# DB_HOST=postgres
# DB_PORT=5432

# Añadir:
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

4. En `docker-compose.yml`, comentar el servicio `postgres`
5. Ejecutar el SQL de `init-db/01-create-schemas.sql` en Supabase SQL Editor

## Troubleshooting

### Directus no inicia
```bash
# Ver logs
docker-compose logs directus

# Comun: base de datos no lista
docker-compose restart directus
```

### Error de conexion a PostgreSQL
```bash
# Verificar que postgres esta corriendo
docker-compose ps postgres

# Verificar salud
docker exec business-os-db pg_isready
```

### n8n no puede conectar a Directus
- Usar `http://directus:8055` (no localhost)
- Los contenedores usan nombres de servicio internos

## Siguiente Pasos

1. [ ] Configurar colecciones en Directus
2. [ ] Crear roles y permisos
3. [ ] Conectar n8n con Directus
4. [ ] Crear primer workflow de automatizacion
5. [ ] Configurar integracion con Slack/Email
6. [ ] Migrar a Supabase para produccion

---

**Version:** 1.0.0
**Basado en:** Highlander ATS Architecture
