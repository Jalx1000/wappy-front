// Bilingual legal content, ported from the design-ref English pages
// (terms.html / privacy.html / cookies.html) and translated to Spanish.
import type { Lang } from "./content";

export type LegalKind = "terms" | "privacy" | "cookies";

export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "contact"; text: string; email: string };

export interface LegalSection {
  id: string;
  heading: string;
  blocks: Block[];
}

export interface LegalDoc {
  eyebrow: string;
  title: string;
  updated: string;
  toc: { id: string; label: string }[];
  intro: Block[];
  sections: LegalSection[];
  back: string;
}

const TERMS_EN: LegalDoc = {
  eyebrow: "Legal",
  title: "Terms & Conditions",
  updated: "Last updated: 7 June 2026",
  back: "← Back to home",
  toc: [
    { id: "use", label: "Use of service" },
    { id: "accounts", label: "Accounts" },
    { id: "trial", label: "Free trial" },
    { id: "billing", label: "Billing" },
    { id: "acceptable", label: "Acceptable use" },
    { id: "liability", label: "Liability" },
  ],
  intro: [
    {
      type: "p",
      text: 'These Terms & Conditions ("Terms") govern your access to and use of Wappy\'s customer-support platform, websites, mobile apps and APIs (the "Service"), operated by Wappy ("we", "us"). By using the Service you agree to these Terms.',
    },
  ],
  sections: [
    {
      id: "use",
      heading: "1. Use of the service",
      blocks: [
        {
          type: "p",
          text: "Wappy provides an omnichannel customer-support platform that unifies messaging channels into a single inbox, with AI assistance, automations, a help center and analytics. You may use the Service only in compliance with these Terms and all applicable laws.",
        },
      ],
    },
    {
      id: "accounts",
      heading: "2. Accounts & workspaces",
      blocks: [
        {
          type: "p",
          text: "You are responsible for safeguarding your workspace credentials and for all activity under your account. Each workspace is isolated; you must not attempt to access another workspace's data. You must provide accurate information and keep it up to date.",
        },
        {
          type: "ul",
          items: [
            "You must be at least 18 years old to create a workspace.",
            "Admins are responsible for the agents and roles they invite.",
            "We may suspend accounts that violate these Terms.",
          ],
        },
      ],
    },
    {
      id: "trial",
      heading: "3. Free trial",
      blocks: [
        {
          type: "p",
          text: "We offer a 7-day free trial on all plans, with no credit card required to begin. At the end of the trial, you may choose a paid plan to continue. If you do not subscribe, your workspace may be paused and data retained for a limited period before deletion.",
        },
      ],
    },
    {
      id: "billing",
      heading: "4. Billing & subscriptions",
      blocks: [
        {
          type: "p",
          text: "Paid plans (Starter, Growth, Scale) are billed monthly in advance. Fees are non-refundable except where required by law. You can upgrade, downgrade or cancel at any time; changes are prorated. Taxes may apply based on your location.",
        },
      ],
    },
    {
      id: "acceptable",
      heading: "5. Acceptable use",
      blocks: [
        {
          type: "p",
          text: "You agree not to use the Service to send spam, unlawful, harmful or infringing content, to violate the messaging-platform policies of connected channels (e.g. WhatsApp, Instagram), or to reverse-engineer the Service. We may remove content or limit usage that breaches these rules.",
        },
      ],
    },
    {
      id: "liability",
      heading: "6. Disclaimers & liability",
      blocks: [
        {
          type: "p",
          text: 'The Service is provided "as is". To the maximum extent permitted by law, Wappy is not liable for indirect or consequential damages. Our total liability is limited to the fees paid in the 12 months preceding the claim.',
        },
      ],
    },
    {
      id: "changes",
      heading: "7. Changes",
      blocks: [
        {
          type: "p",
          text: "We may update these Terms from time to time. Material changes will be notified in-app or by email. Continued use after changes constitutes acceptance.",
        },
      ],
    },
    {
      id: "contact",
      heading: "8. Contact",
      blocks: [{ type: "contact", text: "Questions about these Terms? Email", email: "legal@wappy.dev" }],
    },
  ],
};

const TERMS_ES: LegalDoc = {
  eyebrow: "Legal",
  title: "Términos y condiciones",
  updated: "Última actualización: 7 de junio de 2026",
  back: "← Volver al inicio",
  toc: [
    { id: "use", label: "Uso del servicio" },
    { id: "accounts", label: "Cuentas" },
    { id: "trial", label: "Prueba gratis" },
    { id: "billing", label: "Facturación" },
    { id: "acceptable", label: "Uso aceptable" },
    { id: "liability", label: "Responsabilidad" },
  ],
  intro: [
    {
      type: "p",
      text: 'Estos Términos y condiciones (los "Términos") regulan tu acceso y uso de la plataforma de soporte al cliente de Wappy, sus sitios web, apps móviles y APIs (el "Servicio"), operada por Wappy ("nosotros"). Al usar el Servicio aceptás estos Términos.',
    },
  ],
  sections: [
    {
      id: "use",
      heading: "1. Uso del servicio",
      blocks: [
        {
          type: "p",
          text: "Wappy ofrece una plataforma omnicanal de soporte al cliente que unifica los canales de mensajería en una sola bandeja, con asistencia de IA, automatizaciones, un centro de ayuda y analíticas. Solo podés usar el Servicio en cumplimiento de estos Términos y de las leyes aplicables.",
        },
      ],
    },
    {
      id: "accounts",
      heading: "2. Cuentas y espacios de trabajo",
      blocks: [
        {
          type: "p",
          text: "Sos responsable de proteger las credenciales de tu espacio de trabajo y de toda actividad bajo tu cuenta. Cada espacio de trabajo está aislado; no debés intentar acceder a los datos de otro. Debés proporcionar información veraz y mantenerla actualizada.",
        },
        {
          type: "ul",
          items: [
            "Debés tener al menos 18 años para crear un espacio de trabajo.",
            "Los administradores son responsables de los agentes y roles que invitan.",
            "Podemos suspender cuentas que violen estos Términos.",
          ],
        },
      ],
    },
    {
      id: "trial",
      heading: "3. Prueba gratis",
      blocks: [
        {
          type: "p",
          text: "Ofrecemos una prueba gratis de 7 días en todos los planes, sin tarjeta de crédito para comenzar. Al finalizar la prueba, podés elegir un plan de pago para continuar. Si no te suscribís, tu espacio de trabajo puede pausarse y los datos conservarse por un período limitado antes de su eliminación.",
        },
      ],
    },
    {
      id: "billing",
      heading: "4. Facturación y suscripciones",
      blocks: [
        {
          type: "p",
          text: "Los planes de pago (Starter, Growth, Scale) se facturan mensualmente por adelantado. Las tarifas no son reembolsables salvo cuando la ley lo exija. Podés mejorar, reducir o cancelar en cualquier momento; los cambios se prorratean. Pueden aplicarse impuestos según tu ubicación.",
        },
      ],
    },
    {
      id: "acceptable",
      heading: "5. Uso aceptable",
      blocks: [
        {
          type: "p",
          text: "Aceptás no usar el Servicio para enviar spam ni contenido ilegal, dañino o que infrinja derechos, para violar las políticas de las plataformas de mensajería conectadas (p. ej. WhatsApp, Instagram), ni para hacer ingeniería inversa del Servicio. Podemos eliminar contenido o limitar el uso que incumpla estas reglas.",
        },
      ],
    },
    {
      id: "liability",
      heading: "6. Descargos y responsabilidad",
      blocks: [
        {
          type: "p",
          text: 'El Servicio se ofrece "tal cual". En la máxima medida permitida por la ley, Wappy no es responsable por daños indirectos o consecuentes. Nuestra responsabilidad total se limita a las tarifas pagadas en los 12 meses previos al reclamo.',
        },
      ],
    },
    {
      id: "changes",
      heading: "7. Cambios",
      blocks: [
        {
          type: "p",
          text: "Podemos actualizar estos Términos ocasionalmente. Los cambios sustanciales se notificarán en la app o por correo. El uso continuado tras los cambios implica aceptación.",
        },
      ],
    },
    {
      id: "contact",
      heading: "8. Contacto",
      blocks: [{ type: "contact", text: "¿Preguntas sobre estos Términos? Escribí a", email: "legal@wappy.dev" }],
    },
  ],
};

const PRIVACY_EN: LegalDoc = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  updated: "Last updated: 7 June 2026",
  back: "← Back to home",
  toc: [
    { id: "collect", label: "What we collect" },
    { id: "use", label: "How we use it" },
    { id: "share", label: "Sharing" },
    { id: "security", label: "Security" },
    { id: "rights", label: "Your rights" },
    { id: "retention", label: "Retention" },
  ],
  intro: [
    {
      type: "p",
      text: 'This Privacy Policy explains how Wappy ("we", "us") collects, uses and protects personal data when you use our customer-support platform (the "Service"). We act as a processor for the end-customer data your workspace handles, and as a controller for your account data.',
    },
  ],
  sections: [
    {
      id: "collect",
      heading: "1. Data we collect",
      blocks: [
        {
          type: "ul",
          items: [
            "Account data — name, work email, workspace details, billing info.",
            "Conversation data — messages, contacts and attributes you process through Wappy on behalf of your customers.",
            "Usage data — device, browser, log and analytics data to improve the Service.",
          ],
        },
      ],
    },
    {
      id: "use",
      heading: "2. How we use data",
      blocks: [
        {
          type: "p",
          text: "We use data to provide and improve the Service, power AI features (Copilot suggestions and summaries), process billing, provide support, and keep the platform secure. We do not sell your data.",
        },
      ],
    },
    {
      id: "share",
      heading: "3. Sharing & sub-processors",
      blocks: [
        {
          type: "p",
          text: "We share data only with sub-processors that help us run the Service (cloud hosting, messaging-channel providers such as WhatsApp/Meta, email delivery, payments). All are bound by data-processing agreements. We may disclose data if required by law.",
        },
      ],
    },
    {
      id: "security",
      heading: "4. Security",
      blocks: [
        {
          type: "p",
          text: "Data is encrypted in transit (TLS) and at rest. We enforce role-based access, workspace isolation (multi-tenant), audit logging and least-privilege access for our staff.",
        },
      ],
    },
    {
      id: "rights",
      heading: "5. Your rights",
      blocks: [
        {
          type: "p",
          text: "Depending on your region (GDPR, CCPA and similar), you may access, correct, export or delete personal data. End-customers should contact the workspace (our customer) that controls their data; we assist our customers in fulfilling such requests.",
        },
      ],
    },
    {
      id: "retention",
      heading: "6. Data retention",
      blocks: [
        {
          type: "p",
          text: "We retain account and conversation data for as long as your workspace is active. After cancellation or an expired trial, data is retained for a limited grace period and then deleted, unless a longer period is required by law.",
        },
      ],
    },
    {
      id: "intl",
      heading: "7. International transfers",
      blocks: [
        {
          type: "p",
          text: "Data may be processed in countries other than yours. Where required, we use appropriate safeguards such as Standard Contractual Clauses.",
        },
      ],
    },
    {
      id: "contact",
      heading: "8. Contact",
      blocks: [{ type: "contact", text: "For privacy requests, email", email: "privacy@wappy.dev" }],
    },
  ],
};

const PRIVACY_ES: LegalDoc = {
  eyebrow: "Legal",
  title: "Política de privacidad",
  updated: "Última actualización: 7 de junio de 2026",
  back: "← Volver al inicio",
  toc: [
    { id: "collect", label: "Qué recopilamos" },
    { id: "use", label: "Cómo lo usamos" },
    { id: "share", label: "Compartir" },
    { id: "security", label: "Seguridad" },
    { id: "rights", label: "Tus derechos" },
    { id: "retention", label: "Retención" },
  ],
  intro: [
    {
      type: "p",
      text: 'Esta Política de privacidad explica cómo Wappy ("nosotros") recopila, usa y protege los datos personales cuando usás nuestra plataforma de soporte al cliente (el "Servicio"). Actuamos como encargado del tratamiento de los datos de los clientes finales que gestiona tu espacio de trabajo, y como responsable de los datos de tu cuenta.',
    },
  ],
  sections: [
    {
      id: "collect",
      heading: "1. Datos que recopilamos",
      blocks: [
        {
          type: "ul",
          items: [
            "Datos de cuenta — nombre, email de trabajo, detalles del espacio de trabajo, información de facturación.",
            "Datos de conversación — mensajes, contactos y atributos que procesás a través de Wappy en nombre de tus clientes.",
            "Datos de uso — dispositivo, navegador, registros y analíticas para mejorar el Servicio.",
          ],
        },
      ],
    },
    {
      id: "use",
      heading: "2. Cómo usamos los datos",
      blocks: [
        {
          type: "p",
          text: "Usamos los datos para brindar y mejorar el Servicio, potenciar funciones de IA (sugerencias y resúmenes de Copilot), procesar la facturación, dar soporte y mantener la plataforma segura. No vendemos tus datos.",
        },
      ],
    },
    {
      id: "share",
      heading: "3. Compartir y sub-encargados",
      blocks: [
        {
          type: "p",
          text: "Compartimos datos solo con sub-encargados que nos ayudan a operar el Servicio (hosting en la nube, proveedores de canales de mensajería como WhatsApp/Meta, envío de correo, pagos). Todos están vinculados por acuerdos de tratamiento de datos. Podemos divulgar datos si la ley lo exige.",
        },
      ],
    },
    {
      id: "security",
      heading: "4. Seguridad",
      blocks: [
        {
          type: "p",
          text: "Los datos se cifran en tránsito (TLS) y en reposo. Aplicamos acceso por roles, aislamiento del espacio de trabajo (multi-inquilino), registros de auditoría y acceso de mínimo privilegio para nuestro personal.",
        },
      ],
    },
    {
      id: "rights",
      heading: "5. Tus derechos",
      blocks: [
        {
          type: "p",
          text: "Según tu región (GDPR, CCPA y similares), podés acceder, corregir, exportar o eliminar datos personales. Los clientes finales deben contactar al espacio de trabajo (nuestro cliente) que controla sus datos; asistimos a nuestros clientes en atender dichas solicitudes.",
        },
      ],
    },
    {
      id: "retention",
      heading: "6. Retención de datos",
      blocks: [
        {
          type: "p",
          text: "Conservamos los datos de cuenta y de conversación mientras tu espacio de trabajo esté activo. Tras la cancelación o una prueba vencida, los datos se conservan por un período de gracia limitado y luego se eliminan, salvo que la ley exija un plazo mayor.",
        },
      ],
    },
    {
      id: "intl",
      heading: "7. Transferencias internacionales",
      blocks: [
        {
          type: "p",
          text: "Los datos pueden procesarse en países distintos al tuyo. Cuando corresponde, usamos salvaguardas apropiadas como las Cláusulas Contractuales Estándar.",
        },
      ],
    },
    {
      id: "contact",
      heading: "8. Contacto",
      blocks: [{ type: "contact", text: "Para solicitudes de privacidad, escribí a", email: "privacy@wappy.dev" }],
    },
  ],
};

const COOKIES_EN: LegalDoc = {
  eyebrow: "Legal",
  title: "Cookie Policy",
  updated: "Last updated: 7 June 2026",
  back: "← Back to home",
  toc: [
    { id: "what", label: "What cookies are" },
    { id: "types", label: "Types we use" },
    { id: "manage", label: "Managing cookies" },
  ],
  intro: [
    { type: "p", text: "This Cookie Policy explains how Wappy uses cookies and similar technologies on our websites and platform." },
  ],
  sections: [
    {
      id: "what",
      heading: "1. What are cookies?",
      blocks: [
        {
          type: "p",
          text: "Cookies are small text files stored on your device that help a site work, remember your preferences and understand how it's used. We also use local storage and similar technologies.",
        },
      ],
    },
    {
      id: "types",
      heading: "2. Cookies we use",
      blocks: [
        {
          type: "table",
          headers: ["Category", "Purpose", "Examples"],
          rows: [
            ["Essential", "Sign-in, security, workspace session — required for the Service.", "session, csrf, workspace"],
            ["Preferences", "Remember theme (dark/light), language and layout.", "theme, locale"],
            ["Analytics", "Understand usage to improve the product (aggregated).", "_wappy_analytics"],
            ["Marketing", "Measure campaign performance on our website only.", "_ref, utm"],
          ],
        },
      ],
    },
    {
      id: "manage",
      heading: "3. Managing cookies",
      blocks: [
        {
          type: "p",
          text: "You can accept or reject non-essential cookies via our cookie banner, and manage them anytime in your browser settings. Blocking essential cookies may break parts of the Service. Most browsers let you delete or block cookies under their privacy settings.",
        },
      ],
    },
    {
      id: "contact",
      heading: "4. Contact",
      blocks: [{ type: "contact", text: "Questions about cookies? Email", email: "privacy@wappy.dev" }],
    },
  ],
};

const COOKIES_ES: LegalDoc = {
  eyebrow: "Legal",
  title: "Política de cookies",
  updated: "Última actualización: 7 de junio de 2026",
  back: "← Volver al inicio",
  toc: [
    { id: "what", label: "Qué son las cookies" },
    { id: "types", label: "Tipos que usamos" },
    { id: "manage", label: "Gestionar cookies" },
  ],
  intro: [
    { type: "p", text: "Esta Política de cookies explica cómo Wappy usa cookies y tecnologías similares en nuestros sitios web y plataforma." },
  ],
  sections: [
    {
      id: "what",
      heading: "1. ¿Qué son las cookies?",
      blocks: [
        {
          type: "p",
          text: "Las cookies son pequeños archivos de texto que se guardan en tu dispositivo y ayudan a que un sitio funcione, recuerde tus preferencias y entienda cómo se usa. También usamos almacenamiento local y tecnologías similares.",
        },
      ],
    },
    {
      id: "types",
      heading: "2. Cookies que usamos",
      blocks: [
        {
          type: "table",
          headers: ["Categoría", "Propósito", "Ejemplos"],
          rows: [
            ["Esenciales", "Inicio de sesión, seguridad, sesión del espacio de trabajo — requeridas para el Servicio.", "session, csrf, workspace"],
            ["Preferencias", "Recordar tema (claro/oscuro), idioma y disposición.", "theme, locale"],
            ["Analíticas", "Entender el uso para mejorar el producto (agregado).", "_wappy_analytics"],
            ["Marketing", "Medir el rendimiento de campañas solo en nuestro sitio web.", "_ref, utm"],
          ],
        },
      ],
    },
    {
      id: "manage",
      heading: "3. Gestionar cookies",
      blocks: [
        {
          type: "p",
          text: "Podés aceptar o rechazar las cookies no esenciales desde nuestro banner de cookies, y gestionarlas en cualquier momento en la configuración de tu navegador. Bloquear las cookies esenciales puede romper partes del Servicio. La mayoría de los navegadores permiten eliminar o bloquear cookies en su configuración de privacidad.",
        },
      ],
    },
    {
      id: "contact",
      heading: "4. Contacto",
      blocks: [{ type: "contact", text: "¿Preguntas sobre cookies? Escribí a", email: "privacy@wappy.dev" }],
    },
  ],
};

export const LEGAL: Record<Lang, Record<LegalKind, LegalDoc>> = {
  es: { terms: TERMS_ES, privacy: PRIVACY_ES, cookies: COOKIES_ES },
  en: { terms: TERMS_EN, privacy: PRIVACY_EN, cookies: COOKIES_EN },
};
