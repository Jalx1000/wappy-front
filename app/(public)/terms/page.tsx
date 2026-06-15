import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de servicio",
  description:
    "Términos y condiciones de uso de Fobo Ads, plataforma de reportería multi-marca.",
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

const paragraphStyle: React.CSSProperties = {
  marginTop: 10,
  color: "var(--color-text-secondary)",
};

export default function TermsPage() {
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
        Términos de servicio
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
        Estos términos de servicio (los &quot;Términos&quot;) regulan el uso de la
        plataforma <strong>Fobo Ads</strong> (el &quot;Servicio&quot;) operada por{" "}
        <strong>Sofopolis</strong> (&quot;Sofopolis&quot;, &quot;nosotros&quot;), accesible en{" "}
        <a
          href="https://reports.sofopolis.com"
          style={{ color: "var(--color-primary)" }}
        >
          reports.sofopolis.com
        </a>
        . Al crear una cuenta o utilizar el Servicio aceptás estos Términos en
        su totalidad. Si no estás de acuerdo, no podés utilizar el Servicio.
      </p>

      <h2 style={sectionStyle}>1. Descripción del Servicio</h2>
      <p style={paragraphStyle}>
        Fobo Ads es una plataforma SaaS B2B que permite a agencias de marketing
        digital administrar las redes sociales y campañas publicitarias de
        múltiples marcas-cliente desde un panel unificado, incluyendo
        reportería, conexión a redes sociales, sincronización de métricas,
        gestión de mensajes directos y planificación de contenido.
      </p>

      <h2 style={sectionStyle}>2. Cuenta de usuario</h2>
      <p style={paragraphStyle}>
        Para utilizar el Servicio necesitás crear una cuenta. Sos responsable
        de mantener la confidencialidad de tus credenciales y de todas las
        actividades que ocurran bajo tu cuenta. Notificá inmediatamente a{" "}
        <a
          href="mailto:soporte@sofopolis.com"
          style={{ color: "var(--color-primary)" }}
        >
          soporte@sofopolis.com
        </a>{" "}
        cualquier uso no autorizado. Las cuentas son personales e
        intransferibles.
      </p>

      <h2 style={sectionStyle}>3. Conexiones de cuentas de terceros</h2>
      <p style={paragraphStyle}>
        El Servicio se integra mediante OAuth con plataformas como Facebook,
        Instagram, Google, TikTok y LinkedIn. Al conectar una cuenta de
        terceros declarás contar con los permisos necesarios para hacerlo y
        para autorizarnos a leer datos según los scopes que aceptes durante el
        flujo de autorización. Podés revocar cualquier conexión en cualquier
        momento desde la sección Conexiones de la aplicación.
      </p>

      <h2 style={sectionStyle}>4. Contenido del usuario</h2>
      <p style={paragraphStyle}>
        Sos el único responsable del contenido que cargás, publicás o
        gestionás a través del Servicio, incluyendo publicaciones programadas,
        respuestas a mensajes y archivos cargados en el módulo de Artes
        (DAM). Garantizás que tenés los derechos necesarios sobre dicho
        contenido y que no infringe derechos de terceros ni leyes aplicables.
      </p>

      <h2 style={sectionStyle}>5. Uso aceptable</h2>
      <p style={paragraphStyle}>Al utilizar el Servicio te comprometés a NO:</p>
      <ul style={{ ...paragraphStyle, paddingLeft: 22 }}>
        <li>
          Utilizarlo para fines ilegales, fraudulentos o que violen derechos
          de terceros.
        </li>
        <li>
          Realizar ingeniería inversa, descompilar o intentar acceder al
          código fuente.
        </li>
        <li>
          Sobrepasar los límites razonables de uso de las APIs de plataformas
          de terceros o eludir sus mecanismos de control.
        </li>
        <li>
          Enviar spam o mensajes no solicitados a través del módulo Inbox.
        </li>
        <li>Cargar contenido malicioso, virus o código dañino.</li>
        <li>
          Compartir credenciales o tokens OAuth con terceros no autorizados.
        </li>
      </ul>

      <h2 style={sectionStyle}>6. Propiedad intelectual</h2>
      <p style={paragraphStyle}>
        El Servicio, su código fuente, diseño, marca y documentación son
        propiedad exclusiva de Sofopolis o de sus licenciantes y están
        protegidos por las leyes de propiedad intelectual aplicables. Los
        datos que extraés a través de tus conexiones siguen siendo de
        propiedad de las plataformas y de los titulares de las cuentas
        conectadas, conforme a sus respectivos términos.
      </p>

      <h2 style={sectionStyle}>7. Disponibilidad del Servicio</h2>
      <p style={paragraphStyle}>
        Hacemos esfuerzos razonables para mantener el Servicio disponible
        24/7, pero no garantizamos disponibilidad ininterrumpida. Podemos
        programar mantenimientos, suspensiones temporales o cambios. Las
        plataformas de terceros (Meta, Google, etc.) pueden modificar sus
        APIs sin previo aviso, lo cual puede impactar funcionalidades.
      </p>

      <h2 style={sectionStyle}>8. Suscripciones y pagos</h2>
      <p style={paragraphStyle}>
        El uso del Servicio puede requerir el pago de una suscripción según el
        plan acordado por contrato con tu agencia. La falta de pago puede
        derivar en la suspensión o terminación del acceso. Los detalles
        específicos (montos, modalidad, vigencia) se rigen por el contrato
        comercial firmado por separado.
      </p>

      <h2 style={sectionStyle}>9. Limitación de responsabilidad</h2>
      <p style={paragraphStyle}>
        El Servicio se ofrece &quot;tal cual&quot; y &quot;según disponibilidad&quot;. Sofopolis no
        será responsable por daños indirectos, incidentales, especiales o
        consecuentes derivados del uso o la imposibilidad de uso del
        Servicio, ni por pérdida de datos, ganancias o reputación, en la
        medida máxima permitida por la ley aplicable.
      </p>
      <p style={paragraphStyle}>
        La responsabilidad total acumulada de Sofopolis por cualquier reclamo
        relacionado con el Servicio se limita al monto efectivamente abonado
        por el usuario en los últimos 12 meses, o equivalente a 100 USD si no
        hubo pagos.
      </p>

      <h2 style={sectionStyle}>10. Indemnidad</h2>
      <p style={paragraphStyle}>
        Te comprometés a mantener indemne a Sofopolis, sus directivos,
        empleados y representantes, frente a cualquier reclamo de terceros
        derivado de tu uso del Servicio, del contenido que publicás o de tu
        incumplimiento de estos Términos.
      </p>

      <h2 style={sectionStyle}>11. Terminación</h2>
      <p style={paragraphStyle}>
        Podés terminar tu cuenta en cualquier momento solicitándolo a{" "}
        <a
          href="mailto:soporte@sofopolis.com"
          style={{ color: "var(--color-primary)" }}
        >
          soporte@sofopolis.com
        </a>
        . Sofopolis puede suspender o terminar tu cuenta con causa razonable
        (incumplimiento de estos Términos, fraude, uso indebido) con
        notificación cuando sea posible. Al terminar el Servicio se
        eliminarán tus datos según lo descripto en la{" "}
        <a
          href="/privacy-policy"
          style={{ color: "var(--color-primary)" }}
        >
          Política de privacidad
        </a>
        .
      </p>

      <h2 style={sectionStyle}>12. Modificaciones</h2>
      <p style={paragraphStyle}>
        Podemos modificar estos Términos. Te notificaremos cambios
        sustanciales por correo electrónico a la dirección registrada, con
        al menos 15 días de antelación a la entrada en vigor. Continuar
        utilizando el Servicio luego de la entrada en vigor implica
        aceptación de los términos modificados.
      </p>

      <h2 style={sectionStyle}>13. Ley aplicable y jurisdicción</h2>
      <p style={paragraphStyle}>
        Estos Términos se rigen por las leyes de la República Plurinacional
        de Bolivia. Para cualquier controversia que no pueda resolverse de
        buena fe, las partes se someten a la jurisdicción de los tribunales
        ordinarios de La Paz, Bolivia.
      </p>

      <h2 style={sectionStyle}>14. Disposiciones varias</h2>
      <p style={paragraphStyle}>
        Si alguna cláusula resultara inválida o inaplicable, las demás
        permanecerán vigentes. Estos Términos, junto con la{" "}
        <a
          href="/privacy-policy"
          style={{ color: "var(--color-primary)" }}
        >
          Política de privacidad
        </a>
        , constituyen el acuerdo íntegro entre vos y Sofopolis con respecto
        al Servicio.
      </p>

      <h2 style={sectionStyle}>15. Contacto</h2>
      <p style={paragraphStyle}>
        Para consultas sobre estos Términos escribí a{" "}
        <a
          href="mailto:soporte@sofopolis.com"
          style={{ color: "var(--color-primary)" }}
        >
          soporte@sofopolis.com
        </a>
        .
      </p>
    </div>
  );
}
