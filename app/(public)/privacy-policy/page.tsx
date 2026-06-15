import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad de Fobo Ads — datos que recolectamos, cómo los usamos y tus derechos.",
};

const EFFECTIVE_DATE = "13 de junio de 2026";

const sectionStyle: React.CSSProperties = {
  marginTop: 32,
  fontFamily: "var(--ff-display)",
  fontSize: 20,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "var(--color-text-primary)",
};

const subStyle: React.CSSProperties = {
  marginTop: 22,
  fontFamily: "var(--ff-display)",
  fontSize: 15.5,
  fontWeight: 600,
  color: "var(--color-text-primary)",
};

const paragraphStyle: React.CSSProperties = {
  marginTop: 10,
  color: "var(--color-text-secondary)",
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--ff-display)",
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "-0.02em",
          margin: 0,
          color: "var(--color-text-primary)",
        }}
      >
        Política de privacidad
      </h1>
      <p
        style={{
          marginTop: 8,
          fontSize: 13,
          color: "var(--color-text-tertiary)",
        }}
      >
        Última actualización: {EFFECTIVE_DATE}
      </p>

      <p style={paragraphStyle}>
        Esta política de privacidad describe cómo <strong>Sofopolis</strong> (la
        &quot;Empresa&quot;, &quot;nosotros&quot;) recolecta, utiliza y protege los datos personales de
        los usuarios y los datos de cuentas de redes sociales y plataformas
        publicitarias conectadas a la plataforma <strong>Fobo Ads</strong> (el
        &quot;Servicio&quot;), accesible en{" "}
        <a
          href="https://reports.sofopolis.com"
          style={{ color: "var(--color-primary)" }}
        >
          reports.sofopolis.com
        </a>
        . Al utilizar el Servicio aceptás esta política.
      </p>

      <h2 style={sectionStyle}>1. Responsable del tratamiento</h2>
      <p style={paragraphStyle}>
        <strong>Sofopolis</strong>, agencia de marketing digital con domicilio
        en Bolivia. Punto de contacto para consultas sobre datos personales:{" "}
        <a
          href="mailto:soporte@sofopolis.com"
          style={{ color: "var(--color-primary)" }}
        >
          soporte@sofopolis.com
        </a>
        .
      </p>

      <h2 style={sectionStyle}>2. Datos que recolectamos</h2>

      <h3 style={subStyle}>2.1 Datos de cuenta de usuario</h3>
      <p style={paragraphStyle}>
        Al crear una cuenta en Fobo Ads recolectamos: nombre completo, correo
        electrónico, contraseña (almacenada como hash con sal), avatar
        opcional, rol dentro de la agencia y marcas a las que tenés acceso.
      </p>

      <h3 style={subStyle}>2.2 Datos de autenticación de terceros (OAuth)</h3>
      <p style={paragraphStyle}>
        Cuando conectás una cuenta de Facebook, Instagram, Google Analytics 4,
        Google Ads, TikTok, LinkedIn u otra plataforma soportada, recibimos y
        almacenamos tokens de acceso emitidos por esas plataformas. Estos
        tokens nos permiten leer datos en tu nombre dentro de los permisos
        (scopes) que autorizaste expresamente durante el flujo OAuth. Los
        tokens se almacenan cifrados en reposo con AES-256-GCM.
      </p>

      <h3 style={subStyle}>2.3 Datos de plataformas conectadas</h3>
      <p style={paragraphStyle}>
        Para alimentar reportería y módulos operativos, leemos y almacenamos
        snapshots periódicos de datos provenientes de las plataformas
        conectadas, dentro de los límites de los scopes autorizados:
      </p>
      <ul style={{ ...paragraphStyle, paddingLeft: 22 }}>
        <li>
          <strong>Facebook Pages e Instagram Business:</strong> métricas
          agregadas (alcance, impresiones, engagement, seguidores), posts
          publicados con sus métricas de interacción, conversaciones de
          mensajes directos.
        </li>
        <li>
          <strong>Plataformas publicitarias (Meta Ads, Google Ads, TikTok Ads,
          LinkedIn Ads):</strong> campañas, inversión, impresiones, clicks,
          conversiones, ROAS y CPA por campaña y por día.
        </li>
        <li>
          <strong>Google Analytics 4:</strong> sesiones, usuarios, páginas
          vistas, tasa de conversión, dimensiones agregadas por
          fuente/medio, dispositivo, página, país y ciudad.
        </li>
      </ul>

      <h3 style={subStyle}>2.4 Datos técnicos y de uso</h3>
      <p style={paragraphStyle}>
        Registramos automáticamente: dirección IP, identificador de sesión,
        tipo de navegador y dispositivo, rutas visitadas dentro de la
        aplicación, errores técnicos. Estos datos se usan para seguridad,
        diagnóstico y mejora del Servicio.
      </p>

      <h2 style={sectionStyle}>3. Finalidad del tratamiento</h2>
      <p style={paragraphStyle}>Utilizamos los datos para:</p>
      <ul style={{ ...paragraphStyle, paddingLeft: 22 }}>
        <li>Proveer el Servicio: paneles, reportes, sincronización de cuentas.</li>
        <li>
          Generar reportería consolidada por marca para las agencias que
          contraten el Servicio.
        </li>
        <li>Permitir respuesta de mensajes directos desde el módulo Inbox.</li>
        <li>Notificarte sobre eventos relevantes (alertas, expiración de tokens).</li>
        <li>
          Cumplir con obligaciones legales, prevenir fraude y garantizar la
          seguridad de la plataforma.
        </li>
      </ul>
      <p style={paragraphStyle}>
        No utilizamos tus datos para entrenar modelos de machine learning, ni
        los vendemos ni los compartimos con anunciantes terceros.
      </p>

      <h2 style={sectionStyle}>4. Compartir datos con terceros</h2>
      <p style={paragraphStyle}>
        Compartimos datos únicamente con proveedores de infraestructura que
        son necesarios para operar el Servicio, bajo contratos de
        confidencialidad y procesamiento de datos:
      </p>
      <ul style={{ ...paragraphStyle, paddingLeft: 22 }}>
        <li><strong>Railway</strong> — hosting de aplicación y base de datos.</li>
        <li>
          <strong>Meta Platforms, Google, TikTok, LinkedIn</strong> — son las
          fuentes de datos a través de sus APIs públicas; los datos viajan
          cifrados en tránsito (TLS).
        </li>
        <li>
          <strong>Proveedores de email transaccional</strong> — para enviar
          confirmaciones y recuperación de contraseña.
        </li>
      </ul>

      <h2 style={sectionStyle}>5. Transferencias internacionales</h2>
      <p style={paragraphStyle}>
        Algunos de los proveedores mencionados (Railway, Meta, Google) operan
        servidores fuera de Bolivia. Las transferencias se realizan al
        amparo de cláusulas contractuales tipo y mecanismos equivalentes
        reconocidos internacionalmente.
      </p>

      <h2 style={sectionStyle}>6. Plazos de conservación</h2>
      <ul style={{ ...paragraphStyle, paddingLeft: 22 }}>
        <li>
          <strong>Datos de cuenta:</strong> mientras tu cuenta esté activa; se
          eliminan dentro de 90 días tras solicitar baja.
        </li>
        <li>
          <strong>Tokens OAuth:</strong> hasta que se revoquen o expiren; podés
          desconectar cualquier cuenta desde la sección Conexiones en
          cualquier momento.
        </li>
        <li>
          <strong>Snapshots de métricas:</strong> hasta 36 meses por defecto, o
          el plazo que indique el contrato con la agencia.
        </li>
        <li>
          <strong>Logs técnicos:</strong> 30 días.
        </li>
      </ul>

      <h2 style={sectionStyle}>7. Derechos del usuario</h2>
      <p style={paragraphStyle}>
        Podés ejercer en cualquier momento los siguientes derechos enviando un
        correo a soporte@sofopolis.com:
      </p>
      <ul style={{ ...paragraphStyle, paddingLeft: 22 }}>
        <li>Acceso a los datos personales que tenemos sobre vos.</li>
        <li>Rectificación de datos inexactos.</li>
        <li>Supresión (&quot;derecho al olvido&quot;).</li>
        <li>Oposición y limitación del tratamiento.</li>
        <li>Portabilidad — exportación de tus datos en formato JSON o CSV.</li>
        <li>Retirar consentimientos otorgados a integraciones OAuth.</li>
      </ul>
      <p style={paragraphStyle}>
        Respondemos solicitudes dentro de un plazo máximo de 30 días.
      </p>

      <h2 style={sectionStyle}>8. Seguridad</h2>
      <p style={paragraphStyle}>
        Aplicamos medidas técnicas y organizativas razonables: cifrado en
        reposo (AES-256) de tokens y secretos, cifrado en tránsito (TLS 1.2+)
        en todas las comunicaciones, contraseñas con bcrypt, control de
        acceso basado en roles, registro de auditoría de accesos, copias de
        seguridad cifradas y aislamiento de entornos.
      </p>

      <h2 style={sectionStyle}>9. Cookies y tecnologías similares</h2>
      <p style={paragraphStyle}>
        Utilizamos cookies estrictamente necesarias para mantener tu sesión
        autenticada, recordar preferencias de tema (claro/oscuro) y selector
        de marca activa. No utilizamos cookies publicitarias ni cookies de
        terceros con fines de seguimiento entre sitios.
      </p>

      <h2 style={sectionStyle}>10. Menores de edad</h2>
      <p style={paragraphStyle}>
        El Servicio está dirigido a profesionales y no se ofrece a menores de
        18 años. No recolectamos conscientemente datos de menores.
      </p>

      <h2 style={sectionStyle}>11. Cambios a esta política</h2>
      <p style={paragraphStyle}>
        Podemos actualizar esta política de tiempo en tiempo. Notificaremos
        cambios sustanciales por correo electrónico a las direcciones
        registradas con al menos 15 días de antelación a la entrada en
        vigor.
      </p>

      <h2 style={sectionStyle}>12. Cumplimiento con plataformas de terceros</h2>
      <p style={paragraphStyle}>
        Cuando utilizamos APIs de Meta, Google, TikTok o LinkedIn, lo hacemos
        respetando sus respectivos términos de uso y políticas para
        desarrolladores. En particular cumplimos con la{" "}
        <a
          href="https://developers.facebook.com/terms/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--color-primary)" }}
        >
          Política de Plataforma de Meta
        </a>
        , no almacenamos datos de usuarios más allá de lo necesario y los
        eliminamos cuando una conexión es revocada por el usuario.
      </p>

      <h2 style={sectionStyle}>13. Contacto</h2>
      <p style={paragraphStyle}>
        Para cualquier consulta sobre esta política, escribinos a{" "}
        <a
          href="mailto:soporte@sofopolis.com"
          style={{ color: "var(--color-primary)" }}
        >
          soporte@sofopolis.com
        </a>
        . También podés enviar una solicitud de eliminación de tus datos a{" "}
        <a
          href="mailto:privacidad@sofopolis.com"
          style={{ color: "var(--color-primary)" }}
        >
          privacidad@sofopolis.com
        </a>
        .
      </p>
    </div>
  );
}
