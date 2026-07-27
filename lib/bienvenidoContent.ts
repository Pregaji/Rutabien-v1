// Static editorial content for the Bienvenido arrival guide (MVP_Draft.md
// section 3: "static content, auto-surfaces near stated arrival date").
// This is general practical/settling-in information, not visa or document
// requirement guidance - it doesn't fall under the "no AI for roadmap
// content" rule, but it's still customer-facing copy that should get a
// founder read-through before launch (SIM providers, prices, and transit
// options are exactly the kind of detail that goes stale).

export type Lang = "en" | "es";

export type BienvenidoIcon = "sim" | "transport" | "currency" | "checkin" | "safety" | "language" | "housing";

export interface BienvenidoSection {
  title: string;
  body: string;
  icon: BienvenidoIcon;
  links?: { label: string; url: string }[];
}

export interface BienvenidoContent {
  intro: string;
  empathyLine: string;
  sections: BienvenidoSection[];
}

export const BIENVENIDO_CONTENT: Record<Lang, BienvenidoContent> = {
  en: {
    intro: "A few practical things for your first days in Barcelona.",
    empathyLine:
      "Moving somewhere new is genuinely hard, not just a logistics checklist - it's okay if the first few weeks feel disorienting. That's normal, not a sign you're doing it wrong.",
    sections: [
      {
        title: "Getting a local SIM card",
        icon: "sim",
        body: "Prepaid SIMs from Spanish carriers (Vodafone, Orange, MASmovil, Digi) are available at the airport and most city-centre phone shops - bring your passport to register it. eSIM options exist too if your phone supports one.",
      },
      {
        title: "Getting from the airport",
        icon: "transport",
        body: "The Aerobús runs directly to Plaça Catalunya in the city centre. The R2 Nord train line also connects the airport to Sants and Passeig de Gràcia. Both are cheaper and more predictable than a taxi at peak times.",
      },
      {
        title: "Currency and cards",
        icon: "currency",
        body: "Spain uses the euro. Most places accept card, but keep some cash for small purchases, markets, and older bars. Your home bank card may charge foreign-transaction fees - a fee-free travel card is worth setting up before you fly.",
      },
      {
        title: "First few days",
        icon: "checkin",
        body: "Register your address (empadronamiento) as early as you can - you'll need it for almost everything else. Don't wait until you need it urgently, as appointment slots can book out.",
      },
      {
        title: "A note on safety",
        icon: "safety",
        body: "Barcelona is generally safe, but petty theft (phone snatching, pickpocketing) is a real and common issue, especially on the metro and in tourist-heavy areas like Las Ramblas. Keep bags zipped and in front of you, and be a little more alert in crowds than you might be at home.",
      },
      {
        title: "Learning Spanish/Catalan - EOI and intercambios",
        icon: "language",
        body: "The Escuela Oficial de Idiomas (EOI) is Spain's public language school system - genuinely affordable compared to private academies, with real accreditation. Local intercambio (language exchange) meetups are also a low-pressure way to practice and meet people outside your program.",
      },
      {
        title: "Still looking for housing?",
        icon: "housing",
        body: "A few listing sites students in Barcelona actually use - general information, not an endorsement or referral to any one of them. Cross-check a listing across more than one site, and never wire a deposit before seeing the place in person or on a verified video call. Gràcia, Sants, and Poble Sec are popular, well-connected areas within reach of most universities.",
        links: [
          { label: "Idealista", url: "https://www.idealista.com/en/" },
          { label: "Fotocasa", url: "https://www.fotocasa.es/en/" },
          { label: "Badi", url: "https://badi.com/" },
          { label: "Pisos.com", url: "https://www.pisos.com/" },
          { label: "HousingAnywhere", url: "https://housinganywhere.com/" },
        ],
      },
    ],
  },
  es: {
    intro: "Algunas cosas prácticas para tus primeros días en Barcelona.",
    empathyLine:
      "Mudarte a un lugar nuevo es genuinamente difícil, no solo una lista de logística - está bien si las primeras semanas se sienten desorientadoras. Es normal, no una señal de que lo estás haciendo mal.",
    sections: [
      {
        title: "Conseguir una SIM local",
        icon: "sim",
        body: "Las SIM de prepago de operadoras españolas (Vodafone, Orange, MASmovil, Digi) están disponibles en el aeropuerto y en la mayoría de tiendas del centro - lleva tu pasaporte para registrarla. También existen opciones eSIM si tu teléfono es compatible.",
      },
      {
        title: "Llegar desde el aeropuerto",
        icon: "transport",
        body: "El Aerobús va directo a Plaça Catalunya, en el centro. La línea de tren R2 Nord también conecta el aeropuerto con Sants y Passeig de Gràcia. Ambas opciones son más económicas y predecibles que un taxi en horas punta.",
      },
      {
        title: "Moneda y tarjetas",
        icon: "currency",
        body: "España usa el euro. La mayoría de lugares aceptan tarjeta, pero conviene llevar algo de efectivo para compras pequeñas, mercados y bares más tradicionales. Tu tarjeta bancaria de origen puede cobrar comisiones por transacciones en el extranjero - vale la pena configurar una tarjeta de viaje sin comisiones antes de volar.",
      },
      {
        title: "Los primeros días",
        icon: "checkin",
        body: "Regístrate en el padrón (empadronamiento) lo antes posible - lo necesitarás para casi todo lo demás. No esperes a necesitarlo con urgencia, ya que las citas pueden agotarse.",
      },
      {
        title: "Una nota sobre seguridad",
        icon: "safety",
        body: "Barcelona es generalmente segura, pero los hurtos menores (robo de móviles, carteristas) son un problema real y frecuente, especialmente en el metro y zonas turísticas como Las Ramblas. Mantén las mochilas cerradas y delante de ti, y mantente algo más alerta en aglomeraciones de lo que estarías en casa.",
      },
      {
        title: "Aprender español/catalán - EOI e intercambios",
        icon: "language",
        body: "La Escuela Oficial de Idiomas (EOI) es el sistema público de escuelas de idiomas de España - genuinamente asequible comparado con academias privadas, con acreditación real. Los encuentros de intercambio de idiomas también son una forma sin presión de practicar y conocer gente fuera de tu programa.",
      },
      {
        title: "¿Todavía buscando alojamiento?",
        icon: "housing",
        body: "Algunos portales que suelen usar los estudiantes en Barcelona - información general, no un aval ni una referencia a ninguno en concreto. Compara un anuncio en más de un portal, y nunca envíes una fianza antes de ver el piso en persona o por videollamada verificada. Gràcia, Sants y Poble Sec son zonas populares y bien conectadas, cerca de la mayoría de universidades.",
        links: [
          { label: "Idealista", url: "https://www.idealista.com/" },
          { label: "Fotocasa", url: "https://www.fotocasa.es/" },
          { label: "Badi", url: "https://badi.com/" },
          { label: "Pisos.com", url: "https://www.pisos.com/" },
          { label: "HousingAnywhere", url: "https://housinganywhere.com/" },
        ],
      },
    ],
  },
};
