// Bilingual copy for the Wappy marketing site (ES default, EN available).
// Proper nouns, plan names, integration names and figures are shared across
// languages; only prose is translated.

export type Lang = "es" | "en";

export interface FeatureCopy {
  eyebrow: string;
  title: string;
  body: string;
  list: [string, string, string];
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface QA {
  q: string;
  a: string;
}

export interface Plan {
  name: string;
  price: string;
  per: string;
  audience: string;
  trial: string;
  features: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
}

export interface CompareRow {
  label: string;
  values: (string | boolean)[];
}
export interface CompareGroup {
  name: string;
  rows: CompareRow[];
}

export interface SiteContent {
  nav: {
    links: { label: string; href: string }[];
    signIn: string;
    bookDemo: string;
  };
  hero: {
    trial: string;
    title1: string;
    title2: string;
    sub: string;
    ctaTrial: string;
    ctaDemo: string;
  };
  stats: {
    eyebrow: string;
    title: string;
    omnichannel: string;
    omniTitle: string;
    channels: { name: string; status: string; color: string }[];
    more: string;
    cells: { n: string; l: string }[];
  };
  features: [FeatureCopy, FeatureCopy, FeatureCopy];
  app: {
    eyebrow: string;
    title: string;
    sub: string;
    iosLabel: string;
    androidLabel: string;
    availability: string;
    online: string;
    away: string;
    conversations: string;
    csat: string;
    role: string;
    compose: string;
    tabInbox: string;
    tabTeam: string;
    tabHelp: string;
    tabProfile: string;
  };
  video: { eyebrow: string; title: string; sub: string; tag: string };
  integrations: { eyebrow: string; title: string; sub: string };
  testimonials: { eyebrow: string; title: string; items: [Testimonial, Testimonial, Testimonial] };
  lifestyle: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    copilot: string;
    copilotMsg: string;
  };
  faq: { eyebrow: string; title: string; items: QA[] };
  pricing: {
    eyebrow: string;
    title: string;
    sub: string;
    plans: Plan[];
    note: string;
    compare: string;
  };
  compare: {
    title: string;
    subtitle: string;
    feature: string;
    plans: string[];
    prices: string[];
    groups: CompareGroup[];
    ctaTrial: string;
    ctaDemo: string;
  };
  finalCta: { trial: string; title: string; sub: string; ctaTrial: string; ctaDemo: string };
  footer: {
    ctaTitle: string;
    ctaSub: string;
    ctaTrial: string;
    signIn: string;
    tagline: string;
    cols: { title: string; links: { label: string; href: string }[] }[];
    rights: string;
    legal: { label: string; href: string }[];
  };
  demo: {
    eyebrow: string;
    title: string;
    sub: string;
    name: string;
    email: string;
    company: string;
    teamSizes: string[];
    submit: string;
    orStart: string;
    trialLink: string;
  };
  toasts: { trialStarting: string; demoRequested: string };
  common: { book: string; startTrial: string };
}

const CHANNELS_EN = [
  { name: "WhatsApp", status: "Connected", color: "#25D366" },
  { name: "Messenger", status: "Connected", color: "#0A7CFF" },
  { name: "Instagram", status: "Connect", color: "#E1306C" },
  { name: "Email", status: "Connected", color: "#5B6B7B" },
  { name: "Web widget", status: "Connected", color: "#C7F303" },
];
const CHANNELS_ES = [
  { name: "WhatsApp", status: "Conectado", color: "#25D366" },
  { name: "Messenger", status: "Conectado", color: "#0A7CFF" },
  { name: "Instagram", status: "Conectar", color: "#E1306C" },
  { name: "Email", status: "Conectado", color: "#5B6B7B" },
  { name: "Widget web", status: "Conectado", color: "#C7F303" },
];

export const CONTENT: Record<Lang, SiteContent> = {
  es: {
    nav: {
      links: [
        { label: "Producto", href: "#features" },
        { label: "Precios", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
        { label: "Móvil", href: "#app" },
      ],
      signIn: "Iniciar sesión",
      bookDemo: "Agendar demo",
    },
    hero: {
      trial: "Prueba gratis de 7 días · sin tarjeta",
      title1: "Habla con cada cliente,",
      title2: "desde una sola bandeja veloz.",
      sub: "Wappy unifica WhatsApp, Instagram, email y chat web en una sola bandeja — con IA, automatizaciones y un centro de ayuda integrado.",
      ctaTrial: "Empezar prueba de 7 días",
      ctaDemo: "Agendar demo",
    },
    stats: {
      eyebrow: "Por qué cambian los equipos",
      title: "Soporte que escala contigo",
      omnichannel: "Omnicanal",
      omniTitle: "Conecta cada canal que tus clientes ya usan.",
      channels: CHANNELS_ES,
      more: "+ Más",
      cells: [
        { n: "2m 14s", l: "Primera respuesta mediana" },
        { n: "120+", l: "Integraciones" },
        { n: "520k", l: "Mensajes / mes" },
        { n: "20+", l: "Países" },
      ],
    },
    features: [
      {
        eyebrow: "Bandeja",
        title: "Cada conversación, perfectamente organizada.",
        body: "Asigna, pospón, etiqueta y resuelve con escritura en vivo y temporizadores SLA. Rápida con el teclado, hecha para equipos que responden en segundos.",
        list: ["Respuestas guardadas y macros", "Bandeja de equipo y asignación", "Temporizadores SLA y estados"],
      },
      {
        eyebrow: "Copilot con IA",
        title: "Responde en segundos, no en minutos.",
        body: "Copilot redacta respuestas con tu tono a partir de la conversación, resume hilos largos y ajusta el tono — para que cada agente suene como el mejor.",
        list: ["Respuestas sugeridas", "Resúmenes de conversación", "Reescritura de tono"],
      },
      {
        eyebrow: "Widget y Centro de ayuda",
        title: "Un widget de dos líneas que tus clientes aman.",
        body: "Agrega un lanzador de chat de menos de 30KB a cualquier sitio, con un centro de ayuda buscable incluido. Los clientes se autoatienden; los agentes hacen el resto.",
        list: ["Menos de 30KB, carga asíncrona", "Artículos dentro del widget", "Combina con tu marca"],
      },
    ],
    app: {
      eyebrow: "iOS y Android",
      title: "Soporte desde tu bolsillo",
      sub: "Responde, asigna y resuelve donde estés. Apps nativas para iPhone y Android, con acciones deslizables, Copilot y notificaciones.",
      iosLabel: "iOS · iPhone",
      androidLabel: "Android",
      availability: "DISPONIBILIDAD",
      online: "En línea",
      away: "Ausente",
      conversations: "Conversaciones",
      csat: "CSAT",
      role: "Agente de soporte",
      compose: "+ Redactar",
      tabInbox: "Bandeja",
      tabTeam: "Equipo",
      tabHelp: "Ayuda",
      tabProfile: "Perfil",
    },
    video: {
      eyebrow: "Míralo en acción",
      title: "Wappy, en movimiento",
      sub: "Del primer mensaje de un cliente a una conversación resuelta — mira todo el flujo.",
      tag: "Tour del producto",
    },
    integrations: {
      eyebrow: "Integraciones",
      title: "Conecta todo tu stack",
      sub: "Slack, Shopify, Stripe y más de 120 — además de webhooks para cualquier cosa a medida.",
    },
    testimonials: {
      eyebrow: "Amado por los equipos",
      title: "No solo lo decimos nosotros",
      items: [
        {
          quote: "Wappy redujo a la mitad nuestro tiempo de primera respuesta. Las sugerencias de Copilot son increíblemente buenas.",
          name: "Ana García",
          role: "Head of Support",
        },
        {
          quote: "Reemplazamos tres herramientas con Wappy. Una bandeja, todos los canales, mucho menos caos.",
          name: "Marco Rossi",
          role: "Fundador",
        },
        {
          quote: "Con la app móvil nunca perdemos un ticket urgente — ni siquiera los fines de semana.",
          name: "Sofia Lind",
          role: "Support Lead",
        },
      ],
    },
    lifestyle: {
      eyebrow: "Conversaciones reales",
      title: "Encuentra a tus clientes donde ya están.",
      body: "Tus clientes están chateando en su teléfono ahora mismo. Wappy te pone en el mismo hilo — rápido, cercano y con tu marca.",
      cta: "Empezar prueba de 7 días",
      copilot: "Copilot",
      copilotMsg: "¡Gracias por las fotos! 🔥 Me encanta cómo captaste la luz ✨",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Preguntas, respondidas",
      items: [
        {
          q: "¿En qué se diferencia Wappy de una bandeja compartida?",
          a: "Wappy unifica cada canal — WhatsApp, Instagram, email, web — en una vista de hilos, con IA, automatizaciones, un CRM y analíticas que una simple bandeja de email no puede ofrecer.",
        },
        {
          q: "¿Qué canales soporta?",
          a: "WhatsApp, Facebook Messenger, Instagram, email y el widget web integrable — con más en camino. Puedes conectar varias cuentas por canal.",
        },
        {
          q: "¿Cuánto cuesta?",
          a: "Los planes empiezan en $29/mes (Starter) y escalan a Growth ($99) y Scale ($249). Cada plan incluye el widget, la bandeja y el centro de ayuda.",
        },
        {
          q: "¿Mis datos están seguros?",
          a: "Sí — los datos se cifran en tránsito y en reposo, con acceso por roles, registros de auditoría e interfaces accesibles AA.",
        },
      ],
    },
    pricing: {
      eyebrow: "Precios",
      title: "Precios simples y escalables",
      sub: "Cada plan empieza con una prueba gratis de 7 días. Sin tarjeta para comenzar.",
      plans: [
        {
          name: "Starter",
          price: "$29",
          per: "/mes",
          audience: "Para equipos pequeños",
          trial: "Prueba gratis de 7 días",
          features: [
            "2 asientos de agente",
            "3 canales (WhatsApp, email, web)",
            "1.000 conversaciones / mes",
            "Bandeja compartida y widget web",
            "Centro de ayuda (1 colección)",
            "Respuestas guardadas y etiquetas",
            "Apps iOS y Android",
          ],
          cta: "Empezar prueba gratis",
        },
        {
          name: "Growth",
          price: "$99",
          per: "/mes",
          audience: "Para equipos en crecimiento",
          trial: "Prueba gratis de 7 días",
          featured: true,
          badge: "Más popular",
          features: [
            "Todo lo de Starter, más:",
            "10 asientos · los 5 canales",
            "10.000 conversaciones / mes",
            "Copilot con IA y automatizaciones",
            "Colecciones de ayuda ilimitadas",
            "Bot Builder y Campañas",
            "Analíticas e integraciones",
          ],
          cta: "Empezar prueba gratis",
        },
        {
          name: "Scale",
          price: "$249",
          per: "/mes",
          audience: "Para alto volumen",
          trial: "Prueba gratis de 7 días",
          features: [
            "Todo lo de Growth, más:",
            "Asientos y conversaciones ilimitados",
            "Roles y permisos avanzados",
            "Centros de ayuda multi-marca",
            "Reportes programados y SLAs",
            "Soporte prioritario y onboarding",
            "SSO y registro de auditoría",
          ],
          cta: "Empezar prueba gratis",
        },
      ],
      note: "Todos los planes incluyen el widget integrable, el Centro de ayuda y las apps móviles.",
      compare: "Comparar todas las funciones →",
    },
    compare: {
      title: "Cada función, lado a lado",
      subtitle: "Comparación de planes",
      feature: "Función",
      plans: ["Starter", "Growth", "Scale"],
      prices: ["$29", "$99", "$249"],
      groups: [
        {
          name: "Core",
          rows: [
            { label: "Asientos de agente", values: ["2", "10", "Ilimitados"] },
            { label: "Conversaciones / mes", values: ["1.000", "10.000", "Ilimitadas"] },
            { label: "Canales", values: ["3", "Los 5", "Los 5"] },
            { label: "Bandeja compartida y widget web", values: [true, true, true] },
            { label: "Apps iOS y Android", values: [true, true, true] },
          ],
        },
        {
          name: "Centro de ayuda",
          rows: [
            { label: "Colecciones del centro de ayuda", values: ["1", "Ilimitadas", "Multi-marca"] },
            { label: "Artículos y búsqueda en el widget", values: [true, true, true] },
          ],
        },
        {
          name: "Productividad e IA",
          rows: [
            { label: "Respuestas guardadas y etiquetas", values: [true, true, true] },
            { label: "Copilot IA (respuestas, resumen, tono)", values: [false, true, true] },
            { label: "Automatizaciones (cuando/entonces)", values: [false, true, true] },
            { label: "Bot Builder y Campañas", values: [false, true, true] },
          ],
        },
        {
          name: "Insights y admin",
          rows: [
            { label: "Panel de analíticas", values: [false, true, true] },
            { label: "Integraciones y webhooks", values: [false, true, true] },
            { label: "Reportes programados y SLAs", values: [false, false, true] },
            { label: "Roles y permisos", values: [false, false, true] },
            { label: "SSO y registro de auditoría", values: [false, false, true] },
            { label: "Soporte prioritario y onboarding", values: [false, false, true] },
          ],
        },
        {
          name: "Prueba",
          rows: [{ label: "Prueba gratis", values: ["7 días", "7 días", "7 días"] }],
        },
      ],
      ctaTrial: "Empezar prueba de 7 días",
      ctaDemo: "Agendar demo",
    },
    finalCta: {
      trial: "Prueba gratis de 7 días · sin tarjeta",
      title: "Empieza gratis en 2 minutos.",
      sub: "Trae tus canales, invita a tu equipo y sal en vivo hoy.",
      ctaTrial: "Empezar prueba de 7 días",
      ctaDemo: "Agendar demo",
    },
    footer: {
      ctaTitle: "Listos cuando tú lo estés.",
      ctaSub: "Empieza tu prueba gratis de 7 días — sin tarjeta de crédito.",
      ctaTrial: "Empezar prueba gratis",
      signIn: "Iniciar sesión",
      tagline: "Habla con cada cliente, en cada canal, desde una sola bandeja veloz.",
      cols: [
        {
          title: "Producto",
          links: [
            { label: "Bandeja", href: "#features" },
            { label: "App móvil", href: "#app" },
            { label: "Widget", href: "#features" },
            { label: "Precios", href: "#pricing" },
          ],
        },
        {
          title: "Empresa",
          links: [
            { label: "Nosotros", href: "#" },
            { label: "Empleo", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Contacto", href: "#" },
          ],
        },
        {
          title: "Recursos",
          links: [
            { label: "Centro de ayuda", href: "#faq" },
            { label: "Docs de API", href: "#" },
            { label: "Estado", href: "#" },
            { label: "Changelog", href: "#" },
          ],
        },
        {
          title: "Legal",
          links: [
            { label: "Términos y condiciones", href: "/terms" },
            { label: "Privacidad", href: "/privacy-policy" },
            { label: "Cookies", href: "/cookies" },
          ],
        },
      ],
      rights: "© 2026 Wappy. Todos los derechos reservados.",
      legal: [
        { label: "Términos y condiciones", href: "/terms" },
        { label: "Privacidad", href: "/privacy-policy" },
        { label: "Cookies", href: "/cookies" },
      ],
    },
    demo: {
      eyebrow: "Agendar demo",
      title: "Mira Wappy en vivo",
      sub: "Elige un horario y le mostramos a tu equipo la bandeja, el Copilot con IA y el widget.",
      name: "Nombre completo",
      email: "Email de trabajo",
      company: "Empresa",
      teamSizes: ["Tamaño del equipo: 1–5", "6–20", "21–50", "50+"],
      submit: "Solicitar demo",
      orStart: "O empieza una",
      trialLink: "prueba gratis de 7 días",
    },
    toasts: {
      trialStarting: "🎉 Iniciando tu prueba gratis de 7 días…",
      demoRequested: "✅ Demo solicitada — ¡revisa tu correo!",
    },
    common: { book: "Agendar demo", startTrial: "Empezar prueba gratis" },
  },

  en: {
    nav: {
      links: [
        { label: "Product", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
        { label: "Mobile", href: "#app" },
      ],
      signIn: "Sign in",
      bookDemo: "Book a demo",
    },
    hero: {
      trial: "Free 7-day trial · no card needed",
      title1: "Talk to every customer,",
      title2: "from one lime-fast inbox.",
      sub: "Wappy unifies WhatsApp, Instagram, email and web chat into a single inbox — with AI, automations and a help center built in.",
      ctaTrial: "Start 7-day free trial",
      ctaDemo: "Book a demo",
    },
    stats: {
      eyebrow: "Why teams switch",
      title: "Support that scales with you",
      omnichannel: "Omnichannel",
      omniTitle: "Connect every channel your customers already use.",
      channels: CHANNELS_EN,
      more: "+ More",
      cells: [
        { n: "2m 14s", l: "Median first response" },
        { n: "120+", l: "Integrations" },
        { n: "520k", l: "Messages / month" },
        { n: "20+", l: "Countries" },
      ],
    },
    features: [
      {
        eyebrow: "Inbox",
        title: "Every conversation, beautifully organized.",
        body: "Assign, snooze, tag and resolve with live typing and SLA timers. Keyboard-fast, built for teams that reply in seconds.",
        list: ["Saved replies & macros", "Team inbox & assignment", "SLA timers & statuses"],
      },
      {
        eyebrow: "AI Copilot",
        title: "Answer in seconds, not minutes.",
        body: "Copilot drafts on-brand replies from the conversation, summarizes long threads, and rewrites tone — so every agent sounds like your best one.",
        list: ["Suggested replies", "Conversation summaries", "Tone rewriting"],
      },
      {
        eyebrow: "Widget & Help Center",
        title: "A two-line widget your customers love.",
        body: "Drop a <30KB chat launcher onto any site, with a searchable help center built right in. Customers self-serve; agents handle the rest.",
        list: ["Under 30KB, loads async", "In-widget articles", "Matches your brand"],
      },
    ],
    app: {
      eyebrow: "iOS & Android",
      title: "Support from your pocket",
      sub: "Reply, assign and resolve on the go. Native apps for iPhone and Android, with swipe actions, Copilot and push.",
      iosLabel: "iOS · iPhone",
      androidLabel: "Android",
      availability: "AVAILABILITY",
      online: "Online",
      away: "Away",
      conversations: "Conversations",
      csat: "CSAT",
      role: "Support agent",
      compose: "+ Compose",
      tabInbox: "Inbox",
      tabTeam: "Team",
      tabHelp: "Help",
      tabProfile: "Profile",
    },
    video: {
      eyebrow: "See it in motion",
      title: "Wappy, in motion",
      sub: "From a customer's first message to a resolved conversation — watch the whole flow.",
      tag: "Product tour",
    },
    integrations: {
      eyebrow: "Integrations",
      title: "Connect your whole stack",
      sub: "Slack, Shopify, Stripe and 120+ more — plus webhooks for anything custom.",
    },
    testimonials: {
      eyebrow: "Loved by teams",
      title: "Don't take our word for it",
      items: [
        {
          quote: "Wappy cut our first-response time in half. The Copilot suggestions are scarily good.",
          name: "Ana García",
          role: "Head of Support",
        },
        {
          quote: "We replaced three tools with Wappy. One inbox, every channel, way less chaos.",
          name: "Marco Rossi",
          role: "Founder",
        },
        {
          quote: "The mobile app means we never miss an urgent ticket — even on weekends.",
          name: "Sofia Lind",
          role: "Support Lead",
        },
      ],
    },
    lifestyle: {
      eyebrow: "Real conversations",
      title: "Meet customers where they already are.",
      body: "Your customers are chatting on their phones right now. Wappy puts you in the same thread — fast, friendly and on-brand.",
      cta: "Start 7-day free trial",
      copilot: "Copilot",
      copilotMsg: "Thanks for the photos! 🔥 Love how you captured the light ✨",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions, answered",
      items: [
        {
          q: "How is Wappy different from a shared inbox?",
          a: "Wappy unifies every channel — WhatsApp, Instagram, email, web — into one threaded view, with AI, automations, a CRM and analytics that a shared email inbox simply can't offer.",
        },
        {
          q: "Which channels are supported?",
          a: "WhatsApp, Facebook Messenger, Instagram, email and the embeddable web widget — with more on the way. You can connect multiple accounts per channel.",
        },
        {
          q: "How much does it cost?",
          a: "Plans start at $29/mo (Starter) and scale to Growth ($99) and Scale ($249). Every plan includes the widget, inbox and help center.",
        },
        {
          q: "Is my data secure?",
          a: "Yes — data is encrypted in transit and at rest, with role-based access, audit logs and AA-accessible interfaces.",
        },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Simple, scalable pricing",
      sub: "Every plan starts with a free 7-day trial. No credit card to begin.",
      plans: [
        {
          name: "Starter",
          price: "$29",
          per: "/mo",
          audience: "For small teams",
          trial: "7-day free trial",
          features: [
            "2 agent seats",
            "3 channels (WhatsApp, email, web)",
            "1,000 conversations / mo",
            "Shared inbox & web widget",
            "Help Center (1 collection)",
            "Saved replies & tags",
            "iOS & Android apps",
          ],
          cta: "Start free trial",
        },
        {
          name: "Growth",
          price: "$99",
          per: "/mo",
          audience: "For growing teams",
          trial: "7-day free trial",
          featured: true,
          badge: "Most popular",
          features: [
            "Everything in Starter, plus:",
            "10 seats · all 5 channels",
            "10,000 conversations / mo",
            "AI Copilot & automations",
            "Unlimited Help Center collections",
            "Bot Builder & Campaigns",
            "Analytics & integrations",
          ],
          cta: "Start free trial",
        },
        {
          name: "Scale",
          price: "$249",
          per: "/mo",
          audience: "For high volume",
          trial: "7-day free trial",
          features: [
            "Everything in Growth, plus:",
            "Unlimited seats & conversations",
            "Roles & advanced permissions",
            "Multi-brand Help Centers",
            "Scheduled reports & SLAs",
            "Priority support & onboarding",
            "SSO & audit log",
          ],
          cta: "Start free trial",
        },
      ],
      note: "All plans include the embeddable widget, the Help Center and the mobile apps.",
      compare: "Compare full features →",
    },
    compare: {
      title: "Every feature, side by side",
      subtitle: "Plan comparison",
      feature: "Feature",
      plans: ["Starter", "Growth", "Scale"],
      prices: ["$29", "$99", "$249"],
      groups: [
        {
          name: "Core",
          rows: [
            { label: "Agent seats", values: ["2", "10", "Unlimited"] },
            { label: "Conversations / mo", values: ["1,000", "10,000", "Unlimited"] },
            { label: "Channels", values: ["3", "All 5", "All 5"] },
            { label: "Shared inbox & web widget", values: [true, true, true] },
            { label: "iOS & Android apps", values: [true, true, true] },
          ],
        },
        {
          name: "Help Center",
          rows: [
            { label: "Help Center collections", values: ["1", "Unlimited", "Multi-brand"] },
            { label: "In-widget articles & search", values: [true, true, true] },
          ],
        },
        {
          name: "Productivity & AI",
          rows: [
            { label: "Saved replies & tags", values: [true, true, true] },
            { label: "AI Copilot (replies, summary, tone)", values: [false, true, true] },
            { label: "Automations (when/then)", values: [false, true, true] },
            { label: "Bot Builder & Campaigns", values: [false, true, true] },
          ],
        },
        {
          name: "Insights & admin",
          rows: [
            { label: "Analytics dashboard", values: [false, true, true] },
            { label: "Integrations & webhooks", values: [false, true, true] },
            { label: "Scheduled reports & SLAs", values: [false, false, true] },
            { label: "Roles & permissions", values: [false, false, true] },
            { label: "SSO & audit log", values: [false, false, true] },
            { label: "Priority support & onboarding", values: [false, false, true] },
          ],
        },
        {
          name: "Trial",
          rows: [{ label: "Free trial", values: ["7 days", "7 days", "7 days"] }],
        },
      ],
      ctaTrial: "Start 7-day free trial",
      ctaDemo: "Book a demo",
    },
    finalCta: {
      trial: "Free 7-day trial · no card needed",
      title: "Start free in 2 minutes.",
      sub: "Bring your channels, invite your team, go live today.",
      ctaTrial: "Start 7-day free trial",
      ctaDemo: "Book a demo",
    },
    footer: {
      ctaTitle: "Ready when you are.",
      ctaSub: "Start your free 7-day trial — no credit card needed.",
      ctaTrial: "Start free trial",
      signIn: "Sign in",
      tagline: "Talk to every customer, on every channel, from one lime-fast inbox.",
      cols: [
        {
          title: "Product",
          links: [
            { label: "Inbox", href: "#features" },
            { label: "Mobile app", href: "#app" },
            { label: "Widget", href: "#features" },
            { label: "Pricing", href: "#pricing" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Contact", href: "#" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "Help center", href: "#faq" },
            { label: "API docs", href: "#" },
            { label: "Status", href: "#" },
            { label: "Changelog", href: "#" },
          ],
        },
        {
          title: "Legal",
          links: [
            { label: "Terms & conditions", href: "/terms" },
            { label: "Privacy", href: "/privacy-policy" },
            { label: "Cookies", href: "/cookies" },
          ],
        },
      ],
      rights: "© 2026 Wappy. All rights reserved.",
      legal: [
        { label: "Terms & conditions", href: "/terms" },
        { label: "Privacy", href: "/privacy-policy" },
        { label: "Cookies", href: "/cookies" },
      ],
    },
    demo: {
      eyebrow: "Book a demo",
      title: "See Wappy live",
      sub: "Pick a time and we'll walk your team through the inbox, AI Copilot and the widget.",
      name: "Full name",
      email: "Work email",
      company: "Company",
      teamSizes: ["Team size: 1–5", "6–20", "21–50", "50+"],
      submit: "Request demo",
      orStart: "Or start a",
      trialLink: "free 7-day trial",
    },
    toasts: {
      trialStarting: "🎉 Starting your free 7-day trial…",
      demoRequested: "✅ Demo requested — check your inbox!",
    },
    common: { book: "Book a demo", startTrial: "Start free trial" },
  },
};
