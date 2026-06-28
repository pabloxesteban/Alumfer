# Guía de contribución

Este sitio es la principal herramienta de captación de clientes de Alumfer. La
regla número uno es: **no romper la conversión**. Cambios chicos, verificados y
explicados.

## Flujo de trabajo

1. Trabajá en una rama, nunca directo sobre `main` (un push a `main` publica el
   sitio en producción al instante).
2. Hacé el cambio más chico que resuelva el problema.
3. Verificá localmente (ver abajo).
4. Commit con mensaje claro en español, en imperativo: `fix: ...`, `feat: ...`,
   `chore: ...`, `docs: ...`.
5. Abrí PR. Al mergear a `main`, GitHub Actions despliega solo.

## Verificación antes de commitear

No hay tests automatizados. Verificá a mano:

```bash
php -S localhost:8000      # o: python3 -m http.server 8000
```

Revisá en el navegador (desktop **y** mobile, con DevTools):

- [ ] El hero anima y se ve bien; el fondo no genera saltos de layout.
- [ ] La galería de "Trabajos" filtra por categoría y el lightbox abre/cierra.
- [ ] Las tabs del catálogo cambian de panel.
- [ ] El formulario valida y envía (si probás con PHP, revisá que llegue el mail).
- [ ] Los botones de WhatsApp y teléfono funcionan.
- [ ] No hay errores en la consola.
- [ ] Probá con `prefers-reduced-motion` activado: el sitio debe seguir usable.

## Convenciones

- **CSS:** BEM (`bloque__elemento--modificador`) + estados `is-*`. Colores,
  tipografía y espaciado salen **siempre** de variables en `tokens.css`.
- **JS:** vanilla, sin dependencias nuevas. Mantené cada interacción en su bloque
  comentado dentro de `main.js`.
- **Animación pesada:** detrás de feature detection y `prefers-reduced-motion`.
- **Accesibilidad:** todo control interactivo necesita label/`aria-label`; las
  imágenes informativas, `alt` descriptivo.

## Cache busting (importante)

Si modificás un `.css` o `.js`, **subí el número de versión** en el querystring
de `index.html` (y `gracias.html` si corresponde):

```html
<link rel="stylesheet" href="components.css?v=3">   <!-- pasá a ?v=4 -->
```

Si no lo hacés, los visitantes recurrentes pueden quedar con estilos viejos
cacheados.

## Qué NO hacer sin discusión previa

- Agregar un framework, bundler o `node_modules`.
- Sumar dependencias de CDN nuevas (cada una es un punto de falla y latencia).
- Cambiar el endpoint o el formato de respuesta de `enviar.php` sin actualizar
  `main.js`.
- Tocar `tokens.css` para un caso puntual (eso rompe la consistencia global).

## Imágenes

- Optimizá antes de subir (ver el roadmap en `docs/AUDIT.md`). Las fotos de obra
  no deberían superar ~150–200 KB; el fondo del hero debería servirse en WebP.
- Nombre descriptivo y en minúsculas: `obra-ventanas-3.jpg`.
- Evitá nombres con doble extensión (`*.jpg.jpeg`): confunden y son frágiles.
