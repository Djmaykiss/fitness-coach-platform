# Ilustraciones de tipos de cuerpo (onboarding)

Imágenes para el Paso 3 del onboarding inteligente ("¿Qué cuerpo se parece más
al tuyo?"). Mientras un archivo no exista, la tarjeta muestra una silueta
placeholder sin romper el diseño.

## Archivos esperados (estos nombres exactos)

```
muy-delgado.webp
delgado.webp
atletico.webp
promedio.webp
sobrepeso.webp
obesidad.webp
```

Las rutas ya están referenciadas en `src/data/onboarding.ts` (`BODY_TYPES`). Al
subir los `.webp` con estos nombres aparecen solos, sin tocar código.

## Especificaciones recomendadas

- Formato `.webp`, fondo neutro/transparente.
- Ilustraciones (no fotos de personas reales), estilo consistente entre sí.
- Siluetas/figuras neutras que representen cada complexión.

## Prompts sugeridos para IA

- `muy-delgado.webp`: "Minimal flat illustration of a very thin human body
  silhouette, front view, neutral background, consistent style."
- `delgado.webp`: "...slim human body silhouette..."
- `atletico.webp`: "...athletic/fit human body silhouette..."
- `promedio.webp`: "...average build human body silhouette..."
- `sobrepeso.webp`: "...overweight human body silhouette..."
- `obesidad.webp`: "...obese human body silhouette..."

Mantener el mismo estilo, pose y encuadre en las 6 para que se vean como una
serie coherente.
