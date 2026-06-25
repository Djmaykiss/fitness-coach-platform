# Imágenes de transformaciones (Antes y Después)

Coloca aquí las imágenes de la sección "Antes y Después" de la landing.
Mientras un archivo no exista, la tarjeta muestra automáticamente un placeholder
elegante (patrón de gimnasio) sin romper el diseño.

## Archivos esperados (exactamente estos nombres)

```
carlos-before.webp
carlos-after.webp
mariana-before.webp
mariana-after.webp
andres-before.webp
andres-after.webp
```

Las rutas ya están referenciadas desde `src/data/transformations.ts`. No hace
falta tocar código: en cuanto subas los `.webp` con estos nombres, aparecerán
solos en la landing.

## Especificaciones recomendadas

- Formato: `.webp` (buena compresión, calidad alta).
- Relación de aspecto vertical (aprox. 4:5), tamaño sugerido 800x1000 px.
- Estilo fotográfico profesional, alta calidad, iluminación consistente.
- Fondo de gimnasio moderno; el "antes" y el "después" en el mismo entorno,
  misma pose, mismo ángulo e iluminación.
- Personas FICTICIAS y realistas. No usar personas famosas ni fotos de clientes
  reales.

## Prompts sugeridos para IA

### Carlos R. — Recomposición corporal (progreso de 12 semanas)
- `carlos-before.webp`: "Professional fitness photo, fictional man ~35 years old,
  moderate overweight, plain black t-shirt, standing front view, modern gym
  background, natural lighting, photorealistic, high quality."
- `carlos-after.webp`: "Same fictional man, much more defined, slightly visible
  abs, same plain black t-shirt, same pose and angle, same modern gym, same
  natural lighting, photorealistic — looks like a real 12-week progress."

### Mariana L. — Tonificación y fuerza (inicio → semana 10)
- `mariana-before.webp`: "Professional fitness photo, fictional fitness woman,
  low muscle tone, black leggings and sports top, modern gym, consistent
  lighting, front view, photorealistic, high quality."
- `mariana-after.webp`: "Same fictional woman, more defined, stronger legs and
  back, same outfit, same pose, same angle, same gym environment, photorealistic."

### Andrés M. — Consistencia (semana 1 → semana 16)
- `andres-before.webp`: "Professional fitness photo, fictional slim man, little
  muscle, modern gym, consistent lighting, front view, photorealistic, high
  quality."
- `andres-after.webp`: "Same fictional man, more muscle, more confident posture,
  same place, same lighting, same pose, photorealistic."
