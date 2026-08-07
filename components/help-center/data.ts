import type { IconName } from "@/components/ui/Icon";

export type HcColor = "primary" | "success" | "warning";

export interface Collection {
  id: string;
  icon: IconName;
  color: HcColor;
  name: string;
  desc: string;
}

export type ArticleStatus = "published" | "draft";

export interface Article {
  id: string;
  colId: string;
  title: string;
  status: ArticleStatus;
  excerpt: string;
  body: string;
  author: string;
  updated: string;
  views: number;
  helpful: number;
}

export const HC_TINT: Record<HcColor, { bg: string; fg: string }> = {
  primary: { bg: "var(--color-primary-subtle)", fg: "var(--color-primary-ink)" },
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success-dark)" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
};

export const COLLECTION_ICONS: IconName[] = ["rocket", "card", "users", "database", "book", "shield", "box", "megaphone"];

export const HC_COLLECTIONS: Collection[] = [
  { id: "col_start", icon: "rocket",   color: "primary", name: "Primeros pasos",      desc: "Configura tu cuenta y da tus primeros pasos" },
  { id: "col_pay",   icon: "card",     color: "success", name: "Pagos y tarjetas",    desc: "Recargas, transferencias, problemas con la tarjeta" },
  { id: "col_acct",  icon: "users",    color: "warning", name: "Cuenta y seguridad",  desc: "Acceso, 2FA, ajustes de perfil" },
  { id: "col_api",   icon: "database", color: "primary", name: "Desarrolladores",     desc: "API keys, webhooks y el SDK del widget" },
];

export const HC_ARTICLES: Article[] = [
  { id: "a1", colId: "col_start", title: "Crear tu espacio de trabajo", status: "published",
    excerpt: "Cómo crear un nuevo espacio Wappy e invitar a tus primeros agentes.",
    body: "## Crear tu espacio de trabajo\n\n¡Bienvenido a Wappy! La configuración toma unos dos minutos.\n\n1. Regístrate con tu correo de trabajo.\n2. Elige un nombre y una URL para el espacio.\n3. Invita a tu equipo desde **Configuración → Equipo**.\n\n> Consejo: tu widget se activa en cuanto pegas el snippet.\n\nEso es todo — ya puedes hablar con tus clientes.",
    author: "Ana García", updated: "2 jun 2026", views: 4210, helpful: 96 },
  { id: "a2", colId: "col_start", title: "Instalar el widget de chat", status: "published",
    excerpt: "Pega un snippet de dos líneas para añadir el messenger de Wappy a cualquier sitio.",
    body: "## Instalar el widget de chat\n\nPega esto antes de la etiqueta `</body>`:\n\n```html\n<script>window.Wappy={workspaceId:'ws_abc'}</script>\n<script src=\"https://cdn.wappy.dev/widget.js\" async></script>\n```\n\nEl launcher aparece abajo a la derecha en segundos.",
    author: "Tú", updated: "1 jun 2026", views: 3880, helpful: 92 },
  { id: "a3", colId: "col_pay", title: "¿Por qué se rechazó mi tarjeta?", status: "published",
    excerpt: "Las causas más comunes de un pago fallido y cómo solucionarlas.",
    body: "## ¿Por qué se rechazó mi tarjeta?\n\nLos sospechosos habituales:\n\n- **Límite diario alcanzado** — súbelo en los ajustes de la tarjeta.\n- **Datos incorrectos** — revisa el número y la caducidad.\n- **Tarjeta congelada** — descongélala desde la app.\n\n¿Sigues con problemas? Inicia un chat y lo revisamos.",
    author: "Carlos Ruiz", updated: "30 may 2026", views: 7640, helpful: 88 },
  { id: "a4", colId: "col_pay", title: "Configurar tu primera transferencia", status: "published",
    excerpt: "Envía dinero a un nuevo beneficiario en pocos toques.",
    body: "## Configurar tu primera transferencia\n\n1. Toca **Enviar** en la pantalla de inicio.\n2. Añade los datos del beneficiario.\n3. Confirma el importe y la moneda.\n\nLas transferencias internacionales pueden tardar hasta 3 días hábiles.",
    author: "Ana García", updated: "28 may 2026", views: 2120, helpful: 90 },
  { id: "a5", colId: "col_acct", title: "Activar la verificación en dos pasos", status: "published",
    excerpt: "Añade una capa extra de seguridad a tu cuenta en menos de un minuto.",
    body: "## Activar la verificación en dos pasos\n\nVe a **Configuración → Seguridad → Dos pasos** y elige tu método:\n\n- App de autenticación (recomendado)\n- Código por SMS\n\nGuarda tus códigos de respaldo en un lugar seguro.",
    author: "Sofia Lind", updated: "25 may 2026", views: 1540, helpful: 94 },
  { id: "a6", colId: "col_acct", title: "Restablecer una contraseña olvidada", status: "draft",
    excerpt: "Pasos para recuperar el acceso cuando no puedes iniciar sesión.",
    body: "## Restablecer una contraseña olvidada\n\nHaz clic en **¿Olvidaste tu contraseña?** en la pantalla de acceso y sigue el enlace del correo. Los enlaces caducan a los 30 minutos.",
    author: "Tú", updated: "Hoy", views: 0, helpful: 0 },
  { id: "a7", colId: "col_api", title: "Generar una API key", status: "published",
    excerpt: "Crea y limita API keys para integraciones del lado del servidor.",
    body: "## Generar una API key\n\nVe a **Configuración → Desarrolladores → API keys** y haz clic en **Nueva key**. Limítala solo a lo que necesites y nunca la expongas en código del cliente.",
    author: "Carlos Ruiz", updated: "21 may 2026", views: 980, helpful: 85 },
  { id: "a8", colId: "col_api", title: "Escuchar webhooks", status: "draft",
    excerpt: "Recibe eventos en tiempo real cuando cambian las conversaciones.",
    body: "## Escuchar webhooks\n\nRegistra un endpoint y haremos un POST firmado en cada evento `conversation.updated`. Verifica la firma del header antes de confiar en él.",
    author: "Tú", updated: "Ayer", views: 0, helpful: 0 },
];
