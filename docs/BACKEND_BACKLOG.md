# Backend backlog (frontend ready)

Estado al **2026-06-11**. El frontend tiene UI completa para los siguientes módulos pero falta endpoint backend. Hoy cada vista muestra un banner naranja **"Datos de demostración"** + datos mock para mantener la UX navegable.

Cuando backend agregue cada endpoint listado abajo, el cambio en frontend es trivial: swap `queryFn: async () => MOCK` por el `api.get(...)` real en `lib/hooks/index.ts` y quitar el `<DemoBanner />` de la vista correspondiente.

Todos los endpoints son brand-scoped y deben aceptar el header **`x-brand-id`** ya inyectado por `lib/api/client.ts`.

---

## Lo que ya existe en backend (referencia)

- `POST /api/v1/auth/email/login`, `GET/PATCH/DELETE /api/v1/auth/me`, `/auth/refresh`, `/auth/logout`
- `GET/POST/PATCH/DELETE /api/v1/brands` y `/api/v1/brands/{id}/members`
- `GET/POST/PATCH/DELETE /api/v1/connections` y `/api/v1/connections/{id}/sync`
- `GET /api/v1/analytics/social/summary|overview|top-posts`
- **`POST /api/v1/files/upload`** (multipart, devuelve `{ file: { id, path } }`)

---

## 1. Approvals (Aprobaciones)

**Endpoints sugeridos**:
- `GET /api/v1/approvals` — listar (x-brand-id)
- `PATCH /api/v1/approvals/{id}` — actualizar status

**Tipos** (de `lib/mocks/analyticsData.ts`):

```ts
type ApprovalStatus = "pending" | "approved" | "rejected" | "changes";

type Approval = {
  id: number;
  ch: string;          // "instagram" | "facebook" | "tiktok" | "youtube" | ...
  title: string;
  by: string;          // autor
  role: string;        // "Content" | "Copy" | etc.
  when: string;        // texto relativo "hace 2 h" — o ISO si backend lo prefiere
  caption: string;
  ratio: string;       // "9/16" | "1/1" | "16/9"
  due: string;         // texto humano "Hoy 18:00" | "Mañana"
  status: ApprovalStatus;
};

// PATCH body
type UpdateApprovalDto = {
  status: ApprovalStatus;
  note?: string;
};
```

Mock data: `APPROVALS_DATA` (~4 items).

---

## 2. Calendar (Calendario)

**Endpoints sugeridos**:
- `GET /api/v1/calendar?year=YYYY&month=MM` — listar piezas del mes

**Tipos**:

```ts
type PostStatus = "published" | "scheduled" | "review" | "draft";

type CalPost = {
  id: string;
  day: number;       // 1..31
  ch: string;
  st: PostStatus;
  t: string;         // título
  time: string;      // "HH:mm"
};

type CalendarResponse = {
  year: number;
  month: number;     // 0..11
  posts: Record<number, CalPost[]>;     // por día
  // statusMeta se queda del lado del frontend (UI)
};
```

Mock data: `CAL_POSTS_RAW` (estructura por día).

---

## 3. Campaigns (Campañas)

**Endpoints sugeridos**:
- `GET /api/v1/campaigns` — listar por brand activa
- Eventual `POST/PATCH/DELETE` (no usado por UI actual)

**Tipos**:

```ts
type CampaignStatus = "active" | "scheduled" | "ended" | "paused";

type CampaignItem = {
  id: string;
  name: string;
  status: CampaignStatus;
  channels: string[];    // ["instagram","tiktok","metaads",...]
  start: string;         // "1 jun" o ISO
  end: string;
  budget: string;        // "$8.0K"
  spent: number;         // 0..100 (porcentaje)
  kpi: string;           // "1,284 leads" o "—"
  goal: string;          // "Leads" | "Awareness" | "Conversión" | "Tráfico"
};
```

Mock data: `CAMPAIGNS_DATA` (~5 items).

---

## 4. Posts

**Endpoints sugeridos**:
- `GET /api/v1/posts` — listar (x-brand-id)
- Potencial `POST` para programar; backend ya tiene `social_post` table (visto en logs)

**Tipos**:

```ts
type PostItem = {
  id: string;
  ch: string;
  title: string;
  status: PostStatus;     // "published" | "scheduled" | "review" | "draft"
  date: string;
  reach?: string;
  eng?: string;
  // … (ver POSTS_DATA en lib/mocks/analyticsData.ts)
};
```

Mock data: `POSTS_DATA`.

> Nota: el backend ya tiene `social_post` rows (los devuelve `/analytics/social/top-posts`). Probablemente quepa exponer un endpoint público similar para esta vista.

---

## 5. Influencers (Roster + Briefs + Contratos + Pagos)

### 5a. Roster
- `GET /api/v1/influencers` — listar
- `POST /api/v1/influencers` — crear
- `PATCH /api/v1/influencers/{id}` — actualizar
- `DELETE /api/v1/influencers/{id}` — borrar

```ts
type InfluencerItem = {
  id: string;
  name: string;
  ch: string;
  followers: string;
  eng: string;
  reach: string;
  status: "active" | "inactive" | "pending";
  // … ver INFLUENCERS_DATA
};
```

### 5b. Briefs
- `GET/POST/PATCH/DELETE /api/v1/briefs`

```ts
type BriefStatus = "borrador" | "enviado" | "firmado" | "activo";
type Brief = {
  id: string;            // "BR-001"
  influencerId: string;
  title: string;
  objective: string;
  deliverables: string;
  startDate: string;
  endDate: string;
  status: BriefStatus;
  hashtags: string[];
  mentions: string[];
  dos: string;
  donts: string;
  createdAt: string;
};
```

### 5c. Contratos
- `GET/POST/PATCH/DELETE /api/v1/contracts`

```ts
type ContractType = "Reel" | "Reels" | "Stories" | "Post" | "Campaña" | "Video";
type SignatureStatus = "pendiente" | "firmado" | "vencido";
type Contract = {
  id: string;            // "CT-001"
  influencerId: string;
  briefId: string;
  type: ContractType;
  amount: number;        // USD
  conditions: string;
  signatureStatus: SignatureStatus;
  expiresAt: string;
  createdAt: string;
};
```

---

## 6. Inbox (Bandeja social)

**Endpoints sugeridos**:
- `GET /api/v1/inbox` — listar conversaciones
- `GET /api/v1/inbox/{itemId}/thread` — leer hilo
- `POST /api/v1/inbox/{itemId}/reply` — responder

```ts
type InboxItem = {
  id: number;
  ch: string;
  kind: "DM" | "Comentario";
  from: string;
  preview: string;
  at: string;            // ISO o relativo
  unread: boolean;
};

type ThreadMsg = {
  from: string;          // "Tú" | nombre del contacto
  text: string;
  at: string;
};
```

Mock data: `INBOX_ITEMS`, `INBOX_THREAD`.

---

## 7. AI Insights (Think Tank)

**Endpoints sugeridos**:
- `GET /api/v1/insights` — listar hallazgos
- `POST /api/v1/insights/chat` — pregunta al modelo

```ts
type InsightKind = "win" | "warn" | "idea";
type InsightItem = {
  kind: InsightKind;
  icon: string;
  title: string;
  body: string;
  action: string;
};

type ChatRequest = { message: string };
type ChatResponse = { content: string };
```

Mock data: `AI_INSIGHTS`.

---

## 8. Requests (Solicitudes)

**Endpoints sugeridos**:
- `GET /api/v1/requests`
- `POST /api/v1/requests`
- `PATCH /api/v1/requests/{id}` — actualizar status

```ts
type RequestItem = {
  id: string;
  title: string;
  brand: string;
  pri: "alta" | "media" | "baja";
  status: "abierta" | "progreso" | "cerrada";
  by: string;
  when: string;
  type: string;
};
```

Mock data: `REQUESTS_DATA`.

---

## 9. Reports (Reportes)

**Endpoints sugeridos**:
- `GET /api/v1/reports` — listar (x-brand-id)
- `POST /api/v1/reports` — generar uno nuevo (async job)
- `GET /api/v1/reports/{id}/download` — descargar

```ts
type ReportItem = {
  id: string;
  title: string;
  brand: string;
  period: string;
  status: "generating" | "ready" | "failed";
  format: "pdf" | "xlsx" | "csv";
  size: string | null;
  created: string;
};
```

---

## 10. Web Analytics (GA4) y Paid Media (Ads)

**Endpoints sugeridos**:
- `GET /api/v1/analytics/web/summary?from=&to=`
- `GET /api/v1/analytics/web/sessions?from=&to=`
- `GET /api/v1/analytics/ads/summary?from=&to=`
- `GET /api/v1/analytics/ads/platforms?from=&to=`
- `GET /api/v1/analytics/ads/campaigns?from=&to=`

Estos requieren integración con GA4 API y Meta/Google/TikTok Ads API. Es un esfuerzo más grande — el frontend ya advierte al usuario con un banner explícito.

Shapes esperados están en `lib/hooks/index.ts → WebAnalyticsData / AdsAnalyticsData`.

---

## Patrón de migración (cuando agregues un endpoint)

1. **Backend**: implementa el endpoint con el shape listado.
2. **Frontend** — un PR chico:
   - Cambia el `queryFn` del hook correspondiente en `lib/hooks/index.ts` de `async () => MOCK` a la llamada real.
   - Quita el `<DemoBanner />` de la vista correspondiente.
3. **Verifica** con curl + Bearer JWT + `x-brand-id`.
4. Actualiza este documento marcando ese módulo como ✅.

---

## Estado actual al 2026-06-11

| Módulo | Backend | UI | Estado |
|---|---|---|---|
| Auth / Brands / Connections | ✅ | ✅ | done |
| Settings (Mi cuenta + Equipo) | ✅ | ✅ | done |
| Dashboard | ✅ (via `/analytics/social`) | ✅ | done |
| Analytics > Social | ✅ | ✅ | done |
| **Analytics > Web (GA4)** | ❌ | ⚠️ banner | backlog |
| **Analytics > Ads** | ❌ | ⚠️ banner | backlog |
| **Posts** | ❌ | ⚠️ banner | backlog |
| **Calendar** | ❌ | ⚠️ banner | backlog |
| **Approvals** | ❌ | ⚠️ banner | backlog |
| **Campaigns** | ❌ | ⚠️ banner | backlog |
| **Influencers (×3)** | ❌ | ⚠️ banner | backlog |
| **Inbox** | ❌ | ⚠️ banner | backlog |
| **AI Insights** | ❌ | ⚠️ banner | backlog |
| **Requests** | ❌ | ⚠️ banner | backlog |
| **Reports** | ❌ | ⚠️ banner | backlog |
| **DAM (Artes)** | ✅ upload only | ✅ upload + gallery local | parcial |
