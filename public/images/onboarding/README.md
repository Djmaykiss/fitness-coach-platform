# Ilustraciones del onboarding inteligente

Ilustraciones vectoriales (`.svg`) del wizard de evaluación inicial. Son
ilustraciones propias (no fotos de personas reales), con un estilo neón
consistente entre todas las series. Si un archivo no existe, la tarjeta muestra
un placeholder elegante (icono/silueta vía `onError`) sin romper el diseño.

Las rutas están referenciadas en `src/data/onboarding.ts` (`BODY_TYPES`,
`OBJECTIVES`, `LEVEL_OPTIONS`, `PLACE_OPTIONS`). No hace falta tocar código para
sustituirlas: basta con reemplazar el `.svg` por otro del mismo nombre.

> Nota técnica: para servir SVG locales vía `next/image` está habilitado
> `images.dangerouslyAllowSVG` en `next.config.ts` (solo afecta a ilustraciones
> propias del proyecto).

## Tipos de cuerpo — `body-types/`

```
body-types/muy-delgado.svg
body-types/delgado.svg
body-types/atletico.svg
body-types/promedio.svg
body-types/sobrepeso.svg
body-types/obesidad.svg
```

## Objetivos — `goals/`

```
goals/perder-grasa.svg
goals/ganar-musculo.svg
goals/recomposicion.svg
goals/tonificar.svg
goals/condicion.svg
goals/rendimiento.svg
```

## Nivel — `levels/`

```
levels/principiante.svg
levels/intermedio.svg
levels/avanzado.svg
```

## Lugar de entrenamiento — `places/`

```
places/gimnasio.svg
places/casa.svg
places/ambos.svg
```

## Especificaciones recomendadas

- Formato `.svg` (vectorial), fondo transparente, `viewBox="0 0 120 120"`.
- Paleta neón del proyecto (verde `#65ff4f`); estilo consistente entre series.
- Tipos de cuerpo: siluetas neutras que representen cada complexión.
- Objetivos / lugar / nivel: glifos simples y reconocibles.

Mantener el mismo estilo, encuadre y peso visual dentro de cada serie para que se
vean coherentes.
