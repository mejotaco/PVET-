interface FAQEntry {
  keywords: string[]
  answer: string
}

export const FAQ: FAQEntry[] = [
  {
    keywords: ['vacunar', 'vacuna', 'vacunación', 'vacunas'],
    answer: 'Las vacunas dependen de la especie y edad. Perros y gatos necesitan su primer ciclo de vacunas a las 6-8 semanas (múltiple, parvovirus, moquillo). Los refuerzos son anuales. La vacuna antirrábica es obligatoria en muchos países. Consulta el calendario de vacunación con tu veterinario.',
  },
  {
    keywords: ['desparasitar', 'desparasitación', 'parásitos', 'lombrices', 'pulgas', 'garrapatas'],
    answer: 'La desparasitación interna se recomienda cada 3 meses, y la externa (pulgas/garrapatas) mensual o cada 3 meses según el producto. Los cachorros deben desparasitarse cada 15 días hasta los 3 meses. Usa productos específicos para la especie y peso de tu mascota.',
  },
  {
    keywords: ['síntoma', 'síntomas', 'emergencia', 'urgencia', 'grave', 'enfermo', 'vomita', 'vómito', 'diarrea'],
    answer: '⚠️ Síntomas que requieren atención veterinaria URGENTE: vómitos o diarrea persistentes, sangre en heces/orina, dificultad para respirar, convulsiones, colapso, hinchazón abdominal, ojos/encías pálidas, fiebre alta (>39.5°C), pérdida de conocimiento. Si observas cualquiera de estos, acude al veterinario INMEDIATAMENTE.',
  },
  {
    keywords: ['comida', 'alimento', 'alimentación', 'comer', 'dieta', 'nutrición', 'dar de comer'],
    answer: 'Una alimentación balanceada es clave. Usa alimento comercial de calidad según especie, edad y tamaño. Los perros y gatos NO deben comer: chocolate, uvas, pasas, cebolla, ajo, xilitol, aguacate, masa cruda, huesos cocidos. Los gatos son carnívoros estrictos y necesitan taurina. Los conejos necesitan heno fresco ilimitado. Siempre agua fresca disponible.',
  },
  {
    keywords: ['tóxico', 'tóxica', 'veneno', 'intoxicación', 'venenoso'],
    answer: 'Sustancias tóxicas comunes: plantas (lirios, azaleas, sago, tulipanes), medicamentos humanos (ibuprofeno, paracetamol), alimentos (chocolate, uvas, cebolla, xilitol), productos de limpieza, anticongelante. Si sospechas intoxicación, contacta a tu veterinario o a un centro de toxicología animal URGENTE.',
  },
  {
    keywords: ['bañar', 'baño', 'higiene', 'limpiar', 'cepillar'],
    answer: 'Perros: baño cada 2-4 semanas con champú específico para perros. Gatos: generalmente no necesitan baños (se limpian solos). Cepillado semanal (diario en razas de pelo largo). Limpia oídos con solución específica, cepilla dientes con pasta dental para mascotas, corta uñas si es necesario.',
  },
  {
    keywords: ['ejercicio', 'paseo', 'caminar', 'jugar', 'actividad'],
    answer: 'Perros: mínimo 30-60 min de ejercicio diario según raza y edad. Paseos con correa, juegos de olfato, pelota. Gatos: juego interactivo 15-30 min/día (juguetes tipo caña, ratones). Conejos: necesitan espacio para saltar y correr varias horas al día. El ejercicio previene obesidad y problemas de conducta.',
  },
  {
    keywords: ['edad', 'años', 'año', 'cachorro', 'cachorra', 'cría', 'bebé', 'senior', 'viejo', 'anciano'],
    answer: 'Perros: cachorro (0-12 meses según raza), adulto (1-7 años), senior (7+ años). Gatos: cachorro (0-12 meses), adulto (1-7 años), senior (7+ años). Los cuidados cambian con la edad: los cachorros necesitan más vacunas y socialización, los seniors requieren chequeos más frecuentes y dieta adaptada.',
  },
  {
    keywords: ['esterilizar', 'castrar', 'esterilización', 'castración', 'opera', 'operación', 'cirugía'],
    answer: 'Se recomienda esterilizar entre los 5-8 meses de edad. Beneficios: previene camadas no deseadas, reduce riesgo de cáncer mamario/testicular y enfermedades uterinas, disminuye marcaje y agresividad, reduce el instinto de escapar. Es una cirugía segura con recuperación rápida.',
  },
  {
    keywords: ['dentista', 'diente', 'dientes', 'muela', 'encía', 'encias', 'sarros', 'bucal', 'halitosis', 'mal aliento'],
    answer: 'La salud dental es importante. Cepilla los dientes de tu mascota 2-3 veces por semana con pasta dental para animales (nunca pasta humana). Los signos de problemas dentales incluyen mal aliento, sarro, encías rojas, dificultad al comer. Las limpiezas dentales profesionales bajo anestesia son seguras y necesarias periódicamente.',
  },
  {
    keywords: ['peso', 'obesidad', 'gordo', 'flaco', 'delgado', 'sobrepeso'],
    answer: 'Un peso saludable es fundamental. Debes poder sentir las costillas sin verlas, y ver la cintura desde arriba. La obesidad acorta la esperanza de vida y causa problemas articulares, cardíacos y diabetes. Controla las porciones, evita premios en exceso, y pesa a tu mascota mensualmente.',
  },
  {
    keywords: ['adiestramiento', 'entrenar', 'educar', 'adiestrar', 'conducta', 'comportamiento', 'ladra', 'muerde', 'agresivo'],
    answer: 'El adiestramiento con refuerzo positivo (premios, caricias, elogios) es el más efectivo. Nunca uses castigos físicos. Para problemas de conducta (agresividad, ansiedad por separación, ladridos excesivos), identifica la causa y consulta con un etólogo o educador canino profesional.',
  },
  {
    keywords: ['viajar', 'viaje', 'transportar', 'transportín', 'coche', 'auto', 'avión', 'vuelo'],
    answer: 'Para viajar: usa transportín o arnés de seguridad. Identificación con chip obligatorio. Lleva agua, comida, su correa y sus documentos (cartilla de vacunación, pasaporte si es internacional). Para vuelos, consulta requisitos de la aerolínea. Nunca dejes a tu mascota sola en el coche, especialmente en días calurosos.',
  },
  {
    keywords: ['chip', 'microchip', 'identificación', 'identificar'],
    answer: 'El microchip es obligatorio en muchos lugares. Es un dispositivo del tamaño de un grano de arroz que se implanta bajo la piel y contiene un número único asociado a tus datos. Es indoloro y dura toda la vida. Mantén tus datos actualizados en el registro correspondiente.',
  },
  {
    keywords: ['calor', 'celo', 'monta', 'aparear', 'reproducción', 'embarazo', 'gestación'],
    answer: 'Perros: el celo ocurre cada 6-12 meses, dura 2-3 semanas. Gatos: son poliéstricas estacionales (varios celos en primavera/verano). La gestación dura ~63 días en perros y ~65 en gatos. Si no deseas crías, la esterilización es la opción más recomendable.',
  },
  {
    keywords: ['baño', 'temperatura', 'fiebre', 'hipotermia', 'frío', 'caliente', 'calor extremo'],
    answer: 'La temperatura normal es 37.5-39.2°C (perros) y 38-39.2°C (gatos). En días calurosos, nunca dejes a tu mascota encerrada en el coche, proporciona sombra y agua fresca. Los golpes de calor son mortales. En frío, los animales de pelo corto pueden necesitar abrigo, especialmente razas pequeñas o senior.',
  },
  {
    keywords: ['socializar', 'socialización', 'presentar', 'convivir', 'otros perros', 'otros animales'],
    answer: 'La socialización temprana (3-12 semanas en perros, 2-8 semanas en gatos) es crucial. Expón a tu mascota a diferentes personas, animales, sonidos y entornos de forma positiva. Las presentaciones entre mascotas deben ser graduales y supervisadas. Una mala socialización puede generar miedos y agresividad.',
  },
  {
    keywords: ['garrapata', 'garrapatas', 'pulga', 'pulgas', 'picadura', 'parasiticida'],
    answer: 'Las pulgas causan picazón, alergias y transmiten parásitos internos. Las garrapatas transmiten enfermedades graves (ehrlichiosis, babesiosis). Usa antiparasitarios externos recomendados por tu veterinario (pipetas, collares, comprimidos). Revisa a tu mascota después de paseos por el campo.',
  },
  {
    keywords: ['cuánto', 'frecuencia', 'cada cuánto', 'seguido', 'repetir'],
    answer: 'Depende del tema: vacunas (anuales o según calendario), desparasitación (3 meses interno, 1-3 meses externo), baño (2-4 semanas perros), cepillado dental (2-3 veces/semana), chequeo veterinario (anual adultos, cada 6 meses senior), uñas (cada 3-6 semanas si no se desgastan naturalmente).',
  },
  {
    keywords: ['gato', 'gatos', 'felino'],
    answer: 'Los gatos tienen necesidades específicas: son carnívoros estrictos, necesitan rascadores, arenero limpio, altura (estantes, torres), y enriquecimiento ambiental. Nunca les des comida de perro (no contiene taurina). La mayoría son intolerantes a la lactosa. El estrés en gatos puede causar problemas urinarios graves.',
  },
  {
    keywords: ['perro', 'perros', 'canino'],
    answer: 'Los perros necesitan rutina, ejercicio diario, socialización y liderazgo positivo. Cada raza tiene necesidades distintas: un Border Collie necesita mucho ejercicio mental, un Bulldog es más tranquilo. La educación temprana previene problemas de conducta. Los perros son animales de manada y necesitan compañía.',
  },
  {
    keywords: ['conejo', 'conejos', 'roedor', 'hámster', 'cobaya', 'cuyo', 'hurón'],
    answer: 'Conejos: necesitan heno ilimitado, verduras frescas, espacio para saltar, y su temperatura ideal es 18-24°C. No les des cereales/pan en exceso. Hámsters: son nocturnos, necesitan rueda de ejercicio y jaula espaciosa. Cobayas: necesitan vitamina C adicional en su dieta. Hurones: son carnívoros, necesitan jaula amplia y vacunación.',
  },
  {
    keywords: ['alergia', 'alérgico', 'alergias', 'picor', 'picazón', 'rascarse'],
    answer: 'Las alergias en mascotas se manifiestan como picazón, enrojecimiento, otitis recurrentes, pérdida de pelo o problemas digestivos. Pueden ser alimentarias, ambientales (polen, ácaros) o por pulgas. El diagnóstico requiere evaluación veterinaria. El tratamiento incluye evitar el alérgeno, medicación y dieta hipoalergénica.',
  },
  {
    keywords: ['artritis', 'articulación', 'articulaciones', 'cojera', 'rengo', 'dificultad al levantarse'],
    answer: 'La artritis es común en mascotas senior. Síntomas: rigidez al levantarse, cojera, dificultad para saltar, menos actividad. Ayuda: mantén un peso saludable, camas ortopédicas, rampas para subir al sofá/coche, suplementos (glucosamina, omega-3), y medicación antiinflamatoria recetada por el veterinario.',
  },
  {
    keywords: ['parvovirus', 'moquillo', 'leucemia', 'rabia', 'tos perreras', 'enfermedad'],
    answer: 'Enfermedades graves prevenibles con vacunación: parvovirus (vómitos, diarrea con sangre), moquillo (fiebre, secreciones, neurológicos), rabia (mortal, zoonótica), leucemia felina (inmunosupresión), tos de las perreras (tos seca). La vacunación al día es la mejor prevención. Ante cualquier síntoma, acude al veterinario.',
  },
]

export function findAnswer(input: string): string | null {
  const lower = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  for (const entry of FAQ) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry.answer
      }
    }
  }

  const words = lower.split(/\s+/)
  let bestEntry: FAQEntry | null = null
  let bestCount = 0

  for (const entry of FAQ) {
    let count = 0
    for (const keyword of entry.keywords) {
      for (const word of words) {
        if (word.length > 3 && keyword.includes(word)) {
          count++
        }
      }
    }
    if (count > bestCount) {
      bestCount = count
      bestEntry = entry
    }
  }

  if (bestCount >= 2) {
    return bestEntry!.answer
  }

  return null
}
