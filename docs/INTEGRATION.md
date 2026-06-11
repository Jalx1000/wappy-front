# Fobo Ads Frontend-Backend Integration Audit

**Fecha Auditoría:** 2026-06-11  
**Estado:** ⏳ PENDIENTE VALIDACIÓN  
**Versiones:** Frontend: Next.js 16, React 19 | Backend: NestJS 11, TypeORM/Mongoose

---

## PASO 0 — TABLA DE MAPEO (Auditoría)

### Leyenda
- ✅ = Endpoint real existe y shapes alineados  
- ⚠️ = Existe pero hay discrepancia de shape  
- ❌ = No existe en backend, debe agregarse  
- 🔄 = En progreso

---

## 1. AUTH & AUTHORIZATION

| # | Módulo | Endpoint Esperado (Front) | Endpoint Real (Back) | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 1.1 | **Login** | `POST /api/v1/auth/email/login` | `POST /api/v1/auth/email/login` | ❓ Validar response | Mapear a Auth.js CredentialsProvider | CRÍTICA |
| 1.2 | **Refresh Token** | `POST /api/v1/auth/refresh` | `POST /api/v1/auth/refresh` | ❓ Validar request/response | Mapear a Auth.js JWT callback | CRÍTICA |
| 1.3 | **Logout** | `POST /api/v1/auth/logout` | `POST /api/v1/auth/logout` | ❓ | Conectar a signOut() | CRÍTICA |
| 1.4 | **Register (Invitación)** | `POST /api/v1/auth/email/confirm` | ¿Existe? | ❓ | Confirmar endpoint, validar token de invitación | ALTA |
| 1.5 | **Forgot Password** | `POST /api/v1/auth/email/forgot-password` | ¿Existe? | ❓ | Confirmar si existe | MEDIA |
| 1.6 | **Reset Password** | `POST /api/v1/auth/email/reset-password` | ¿Existe? | ❓ | Confirmar si existe | MEDIA |
| 1.7 | **Current User/Session** | `GET /api/v1/auth/me` | ¿Existe? | ❓ | Confirmar si Auth.js expone sesión o si necesitamos endpoint | ALTA |

---

## 2. BRANDS (Selección y Multi-tenancia)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 2.1 | **Listar Marcas** | `GET /api/v1/brands` | `GET /api/v1/brands` | ❓ Validar: `{data: Brand[], pagination?}` | Conectar useBrands() → BrandStore | CRÍTICA |
| 2.2 | **Detalle Marca** | `GET /api/v1/brands/:id` | `GET /api/v1/brands/:id` | ❓ | Conectar si necesita modal de edición | MEDIA |
| 2.3 | **Crear Marca** | `POST /api/v1/brands` | `POST /api/v1/brands` | ❓ | Validar si necesita en fase inicial | BAJA |
| 2.4 | **Actualizar Marca** | `PATCH /api/v1/brands/:id` | `PATCH /api/v1/brands/:id` | ❓ | Validar si necesita | BAJA |
| 2.5 | **Filtros por Rol** | Esperado: cliente ve solo sus marcas | ¿Backend filtra? | ❓ | Confirmar si backend respeta rol/permisos | CRÍTICA |

---

## 3. CONNECTIONS (Integraciones Sociales)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 3.1 | **Listar Conexiones** | `GET /api/v1/brands/:brandId/connections` | `GET /api/v1/brands/:brandId/connections` | ❓ | Conectar useConnections() | CRÍTICA |
| 3.2 | **Crear Conexión** | `POST /api/v1/brands/:brandId/connections` | `POST /api/v1/brands/:brandId/connections` | ❓ | Mapear form → request | CRÍTICA |
| 3.3 | **Actualizar Conexión** | `PATCH /api/v1/brands/:brandId/connections/:id` | `PATCH /api/v1/brands/:brandId/connections/:id` | ❓ | Conectar | ALTA |
| 3.4 | **Eliminar Conexión** | `DELETE /api/v1/brands/:brandId/connections/:id` | `DELETE /api/v1/brands/:brandId/connections/:id` | ✅ | Conectar | ALTA |
| 3.5 | **Sync Now (Job)** | `POST /api/v1/brands/:brandId/connections/:id/sync` | `POST /api/v1/brands/:brandId/connections/:id/sync` | ❓ Response: `{jobId, status}` | Mapear y configurar job polling | CRÍTICA |
| 3.6 | **Job Status** | `GET /api/v1/jobs/:jobId` | `GET /api/v1/jobs/:jobId` | ❓ Validar fields (status, progress, result) | Implementar polling o SSE | CRÍTICA |

---

## 4. POSTS (Contenido)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 4.1 | **Listar Posts** | `GET /api/v1/brands/:brandId/posts` | `GET /api/v1/brands/:brandId/posts` | ❓ | Conectar usePosts() | ALTA |
| 4.2 | **Crear Post** | `POST /api/v1/brands/:brandId/posts` | `POST /api/v1/brands/:brandId/posts` | ❓ | Mapear form → API | ALTA |
| 4.3 | **Actualizar Post** | `PATCH /api/v1/brands/:brandId/posts/:id` | `PATCH /api/v1/brands/:brandId/posts/:id` | ❓ | Conectar | ALTA |
| 4.4 | **Eliminar Post** | `DELETE /api/v1/brands/:brandId/posts/:id` | `DELETE /api/v1/brands/:brandId/posts/:id` | ✅ | Conectar | ALTA |
| 4.5 | **Listar por Red Social** | `GET /api/v1/brands/:brandId/posts?channel=instagram` | ¿Soporta query param? | ❓ | Confirmar filtros soportados | MEDIA |
| 4.6 | **Cambiar Estado** | `PATCH /api/v1/brands/:brandId/posts/:id/status` | ¿Existe endpoint dedicado? | ❓ | Confirmar si usa PATCH general o dedicado | MEDIA |

---

## 5. ASSETS (Archivos y Uploads)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 5.1 | **Upload Archivo** | `POST /api/v1/brands/:brandId/assets/upload` | `POST /api/v1/brands/:brandId/assets/upload` | ❓ Multipart form-data → `{url, fileId, presignedUrl?}` | Implementar multipart interceptor | CRÍTICA |
| 5.2 | **Listar Assets** | `GET /api/v1/brands/:brandId/assets` | `GET /api/v1/brands/:brandId/assets` | ❓ | Conectar si necesita galería | MEDIA |
| 5.3 | **Eliminar Asset** | `DELETE /api/v1/brands/:brandId/assets/:id` | `DELETE /api/v1/brands/:brandId/assets/:id` | ✅ | Conectar | MEDIA |

---

## 6. CALENDAR (Programación)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 6.1 | **Listar Eventos Calendario** | `GET /api/v1/brands/:brandId/calendar` | `GET /api/v1/brands/:brandId/calendar` | ❓ | Confirmar si existe | MEDIA |
| 6.2 | **Crear Evento** | `POST /api/v1/brands/:brandId/calendar` | `POST /api/v1/brands/:brandId/calendar` | ❓ | Conectar si existe | MEDIA |
| 6.3 | **Actualizar Evento** | `PATCH /api/v1/brands/:brandId/calendar/:id` | `PATCH /api/v1/brands/:brandId/calendar/:id` | ❓ | Conectar si existe | MEDIA |

---

## 7. ANALYTICS / DASHBOARD

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 7.1 | **Dashboard KPIs** | `GET /api/v1/brands/:brandId/analytics/dashboard` | `GET /api/v1/brands/:brandId/analytics/dashboard` | ❓ Shapes: KPI[], TimeSeries[] | Validar shapes vs Recharts | CRÍTICA |
| 7.2 | **Métricas Snapshot** | `GET /api/v1/brands/:brandId/metrics/snapshots` | `GET /api/v1/brands/:brandId/metrics/snapshots` | ❓ Query: `?startDate=&endDate=` | Conectar a filtro de período | ALTA |
| 7.3 | **Comparación Período** | Lógica front-end | Depende de backend | ❓ | Validar si backend soporta comparación o es cálculo front | MEDIA |

---

## 8. REPORTS (Generación y Descarga)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 8.1 | **Listar Reports** | `GET /api/v1/brands/:brandId/reports` | `GET /api/v1/brands/:brandId/reports` | ❓ | Conectar useReports() | ALTA |
| 8.2 | **Generar Report (Job)** | `POST /api/v1/brands/:brandId/reports/generate` | `POST /api/v1/brands/:brandId/reports/generate` | ❓ Response: `{jobId}` | Encochar job → polling/SSE | CRÍTICA |
| 8.3 | **Descargar Report** | `GET /api/v1/brands/:brandId/reports/:id/download` | `GET /api/v1/brands/:brandId/reports/:id/download` | ❓ Presigned URL o file directo? | Validar mecanismo de descarga | CRÍTICA |
| 8.4 | **Eliminar Report** | `DELETE /api/v1/brands/:brandId/reports/:id` | `DELETE /api/v1/brands/:brandId/reports/:id` | ✅ | Conectar | MEDIA |

---

## 9. APPROVALS (Flujos de Aprobación)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 9.1 | **Listar Approvals** | `GET /api/v1/brands/:brandId/approvals` | `GET /api/v1/brands/:brandId/approvals` | ❓ | Conectar useApprovals() | ALTA |
| 9.2 | **Cambiar Estado** | `PATCH /api/v1/brands/:brandId/approvals/:id` | `PATCH /api/v1/brands/:brandId/approvals/:id` | ❓ Body: `{status: APPROVED\|REJECTED, comment?}` | Mapear form | ALTA |
| 9.3 | **Notificación en Tiempo Real** | SSE / Polling | ¿Backend emite eventos? | ❓ | Confirmar mecanismo | MEDIA |

---

## 10. INBOX / REQUESTS (Comentarios y Solicitudes)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 10.1 | **Listar Inbox** | `GET /api/v1/brands/:brandId/inbox` | `GET /api/v1/brands/:brandId/inbox` | ❓ | Conectar useInbox() | MEDIA |
| 10.2 | **Responder** | `POST /api/v1/brands/:brandId/inbox/:id/reply` | `POST /api/v1/brands/:brandId/inbox/:id/reply` | ❓ | Conectar form de reply | MEDIA |

---

## 11. NOTIFICATIONS (Notificaciones)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 11.1 | **Listar Notificaciones** | `GET /api/v1/notifications` | `GET /api/v1/notifications` | ❓ | Conectar useNotifications() | MEDIA |
| 11.2 | **Marcar Leído** | `PATCH /api/v1/notifications/:id/read` | `PATCH /api/v1/notifications/:id/read` | ✅ | Conectar | MEDIA |
| 11.3 | **Stream en Tiempo Real** | SSE: `GET /events` | ¿Existe? | ❓ | Confirmar si backend soporta SSE para notificaciones | MEDIA |

---

## 12. INFLUENCERS (Nueva integración — Phase 1 → Real)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 12.1 | **Listar Influencers** | `GET /api/v1/brands/:brandId/influencers` | ¿Existe? | ❓ | Crear si no existe | ALTA |
| 12.2 | **Detalle + Drawer** | `GET /api/v1/brands/:brandId/influencers/:id` | ¿Existe? | ❓ Incluir rate card, audience, contact | Crear si no existe | ALTA |
| 12.3 | **Crear/Actualizar** | `POST/PATCH /api/v1/brands/:brandId/influencers/:id` | ¿Existe? | ❓ | Crear si no existe | ALTA |
| 12.4 | **Cobros (Phase 2)** | `GET /api/v1/brands/:brandId/influencers/:id/deals` | ¿Existe? | ❓ | Crear si no existe | MEDIA |

---

## 13. OTROS (Roles, Permisos, etc.)

| # | Módulo | Endpoint Esperado | Endpoint Real | DTO/Shape | Acción | Prioridad |
|---|---|---|---|---|---|---|
| 13.1 | **Listar Roles** | `GET /api/v1/roles` | `GET /api/v1/roles` | ❓ | Confirmar si existe | BAJA |
| 13.2 | **Permisos por Rol** | Incluido en JWT / session | Validado por Auth.js | ✅ | Ya integrado | BAJA |

---

## RESUMEN ACTUAL

### Estado de Endpoints
- **Esperado en Frontend (lib/api/):** ❓ REVISAR
- **Real en Backend (Swagger):** ❓ REVISAR
- **Mapeo Validado:** ❓ PENDIENTE

### Siguiente Paso
1. ✅ Generar tabla (este documento)
2. ⏳ **VALIDAR CON EQUIPO:**
   - Acceder a `http://localhost:3100/docs-json` (backend corriendo)
   - Verificar shapes reales vs esperados
   - Marcar `❓` → `✅`, `⚠️`, o `❌`
   - Documentar discrepancias
3. 🚀 Proceder con integración módulo a módulo (Fase 1 en adelante)

---

## NOTAS

- **Formato Header:** `x-brand-id: <id>` en endpoints brand-scoped
- **Autenticación:** `Authorization: Bearer <accessToken>`
- **Errores:** Validar formato boilerplate brocoders: `{status, errors: {field: [msg[]]}}`
- **Multipart:** Assets upload necesita interceptor especial (no JSON)
