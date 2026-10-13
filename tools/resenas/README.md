# Reseñas de Google automáticas

El sitio muestra la puntuación de la ficha, la cantidad de reseñas y tres
reseñas, en 28 páginas y en el `aggregateRating` del `LocalBusiness`. Hasta
ahora estaban escritas a mano, así que cada reseña nueva había que copiarla.
Con esto se actualiza solo, una vez por semana.

## Ahora mismo: la carga es a mano

La Places API exige una tarjeta de crédito y todavía no hay, así que **la
corrida automática está apagada** y las reseñas se cargan a mano. Pero no hay
que editar 28 páginas: se escriben una sola vez en un archivo y el mismo script
las reparte.

Los datos vivos están en `ficha-actual.json`, ordenados **de la más nueva a la
más vieja**. El script muestra las tres primeras que pasen los filtros y el
resto queda archivado ahí sin mostrarse.

1. Cuando entra una reseña nueva, copiá un bloque de `reviews`, ponelo **arriba
   de todo** y completalo. La más vieja de las tres que estaban se corre sola.
   Actualizá también `rating` y `userRatingCount` con lo que muestre el panel.
2. Corré:

   ```sh
   python3 tools/resenas/actualizar_resenas.py --json tools/resenas/ficha-actual.json --dry-run
   ```

   Eso te dice qué tres eligió y qué páginas cambiarían, sin escribir nada.
3. Sacá el `--dry-run`, revisá el `git diff` y publicá.

Sin el campo `id` en el archivo, los links de las páginas quedan como están. El
resto es igual que en el modo automático: los mismos filtros, las mismas
validaciones, y las 28 páginas más el `aggregateRating` siempre en sincronía.

Dos cosas que se ganan archivando en vez de borrar: si una reseña se borra de la
ficha, la que había quedado afuera vuelve sola; y queda el registro de qué
mostró el sitio y cuándo.

El campo `_pendientes` es para las que no se pueden publicar todavía —por
ejemplo las que el panel muestra cortadas con "Ver la opinión completa"—. El
script lo ignora.

## Cómo funciona

`.github/workflows/resenas.yml` corre los lunes a la madrugada, llama a
`actualizar_resenas.py`, y el script:

1. le pide a la Places API de Google la puntuación, la cantidad y las reseñas;
2. descarta las de menos de 4 estrellas, las de menos de 40 caracteres y las
   que no tengan fecha utilizable;
3. se queda con **las tres más nuevas** y reescribe el badge, las tarjetas y el
   `aggregateRating`;
4. si cambió algo, commitea a `main` y lanza el deploy.

Si Google falla, responde raro o devuelve menos de tres reseñas publicables, el
script **sale con error sin tocar ningún archivo**. Es a propósito: es mejor
mostrar el dato de la semana pasada que vaciar la sección del sitio.

## Qué hay que configurar una sola vez

Sin esto el workflow corre, avisa que falta la clave y no hace nada.

**1. Proyecto en Google Cloud**

En [console.cloud.google.com](https://console.cloud.google.com) creá un
proyecto (por ejemplo `alumfer`) y habilitale **Places API (New)**. Tiene que
ser la versión nueva: la vieja no devuelve los mismos campos.

**2. Activar facturación**

Google exige una tarjeta para usar la API, aunque no se llegue a cobrar. El
esquema de precios tiene un tramo gratuito mensual muy por encima de las cuatro
o cinco llamadas que vamos a hacer, pero **conviene verificar el precio vigente
cuando lo configures**, porque Google lo cambió más de una vez.

**3. Crear la clave y restringirla**

En *Credenciales* → *Crear credencial* → *Clave de API*. Después editala:

- **Restricciones de API:** solo *Places API (New)*. Esto es lo que importa: si
  la clave se filtra, no sirve para nada más.
- **Restricciones de aplicación:** ninguna. Las IP de GitHub Actions cambian,
  así que no se pueden listar.
- En *Cuotas*, ponele un **tope diario bajo** (10 pedidos alcanza y sobra). Es
  la red de seguridad por si la clave se filtra: con tope, el daño máximo son
  diez llamadas.

**4. Guardar la clave en el repositorio**

En GitHub: *Settings* → *Secrets and variables* → *Actions* → *New repository
secret*, con el nombre exacto `GOOGLE_PLACES_API_KEY`.

**5. Fijar la ficha (recomendado)**

La primera corrida busca la ficha por nombre y dirección, e imprime el
`place_id` en el log de Actions. Guardalo como un segundo secret,
`GOOGLE_PLACE_ID`. Así no se gasta una búsqueda por corrida y nunca puede
confundirse con otra ficha parecida.

## Probarlo

Desde la pestaña *Actions* → *Reseñas de Google* → *Run workflow*. El log dice
qué puntuación trajo y qué tres reseñas eligió.

En la máquina, sin escribir nada:

```sh
GOOGLE_PLACES_API_KEY=... python3 tools/resenas/actualizar_resenas.py --dry-run
```

Y sin clave, con una respuesta guardada en un archivo, para probar el armado
del HTML:

```sh
python3 tools/resenas/actualizar_resenas.py --json ficha.json --dry-run
```

## Dos cosas para tener en cuenta

**La API devuelve hasta cinco reseñas y no se elige cuáles.** Son las que Google
considera más relevantes. No hay forma de pedir "las últimas" ni "las mejores":
si querés que aparezca una en particular, no se puede.

**Los términos de la Places API restringen guardar contenido de reseñas.** El
único dato que se puede almacenar sin vueltas es el `place_id`. Acá el texto
queda escrito en el repositorio, que es una forma de almacenamiento, aunque se
reemplace entero cada semana y nunca se acumule un historial. Si en algún
momento eso trae problemas, el reemplazo es dejar automática solo la puntuación
y la cantidad —que es lo que se desactualiza sin que te enteres— y volver a
elegir los tres textos a mano.

## Un detalle de posicionamiento

Las directrices de datos estructurados de Google piden que las reseñas marcadas
en el sitio sean propias y no traídas de otra plataforma. Las nuestras salen de
Google, así que **no hay que esperar que el `aggregateRating` nos dé estrellas
en el resultado de búsqueda**. Lo que se gana con esto es que el dato que
publicamos sea verdadero y que el visitante vea reseñas recientes, no que suba
el posicionamiento.

## Diseño 2026

Con el rediseño, el script reconoce también el formato nuevo: el dato del
hero como `.stat` (`aria-label="Ver reseñas en Google"`) y, en la home, el
bloque `.rating` y las citas `.quotes`. Las páginas internas conservan el
bloque `.reviews-grid` + `google-badge` de siempre. Muestra 4 reseñas.
