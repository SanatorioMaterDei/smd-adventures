# Bosque de números

Juego didáctico en pixel art para chicos, pensado para la sala de espera pediátrica del Sanatorio Mater Dei y para jugar desde el celular.

**Jugar:** https://sanatoriomaterdei.github.io/smd-adventures/

## La historia

Kamy, un zorro travieso, desordena el bosque. El jugador elige una loba (Gaby, Mary o Ely) y la ayuda a lo largo de tres niveles:

| Nivel | Qué se practica | Para chicos | Para grandes |
|---|---|---|---|
| 1. Manzanas | Orden de los números | Del 1 al 10 | Del 1 al 20 |
| 2. Amigos | Lectura y escritura de nombres de animales | Casillas con la cantidad de letras y pista automática | Sin casillas ni pista automática |
| 3. Sonidos | Reconocer animales por su sonido | 3 opciones y el sonido escrito | 4 opciones, solo se escucha |

Los niveles se desbloquean al completar el anterior. El avance, la dificultad y el sonido se guardan en cada navegador.

## Modo sala de espera

Para las tablets de la sala, abrí el juego una vez con `?sala` al final de la dirección:

```
https://sanatoriomaterdei.github.io/smd-adventures/?sala
```

El dispositivo queda en ese modo (también si después se instala como app) hasta abrirlo con `?casa`. En modo sala:

- todos los niveles están disponibles,
- si nadie toca la pantalla por 90 segundos aparece "¿Seguís jugando?" y, a los 15 segundos, vuelve al menú,
- la pantalla no se apaga mientras el juego está abierto (si el navegador lo permite),
- se desactiva el menú del toque largo y se ocultan los créditos.

Recomendado para la tablet: abrir con `?sala`, usar **Agregar a pantalla de inicio** (se abre a pantalla completa) y fijar la app con el modo kiosco del sistema (Android: *Fijar app*; iPad: *Acceso guiado*).

### Sin conexión

Después de la primera visita, el juego queda guardado en el dispositivo y funciona aunque se caiga el wifi. Los cambios publicados se ven a partir de la segunda vez que se abre.

## Cómo está hecho

Página estática sin compilación: HTML, CSS y JavaScript. Los sprites son grillas de caracteres que se convierten en SVG, el fondo se dibuja en un canvas y los efectos de sonido se sintetizan con Web Audio.

```
index.html            estructura de la página
css/styles.css        estilos
js/sprites.js         dibujos pixel art (Kamy, lobas, animales, íconos)
js/forest.js          fondo del bosque (versión apaisada y vertical)
js/audio.js           efectos de sonido y grabaciones de animales
js/game.js            estado compartido y motor de diálogos
js/level1.js … 3.js   un archivo por nivel
js/main.js            menú, progreso, modo sala de espera y arranque
sw.js                 funcionamiento sin conexión
sounds/, fonts/       recursos (ver CREDITS.md)
tests/                pruebas de punta a punta
```

Para agregar un nivel: crear `js/levelN.js` con su `startLevelN()`, sumarlo a `LEVELS` y `START` en `js/main.js`, cargarlo en `index.html` y agregar sus archivos a `sw.js`.

### Correrlo localmente

```bash
npm start          # sirve el juego en http://localhost:4173
```

También se puede abrir `index.html` directo en el navegador, aunque así no funciona el modo sin conexión.

### Pruebas

Las pruebas juegan los tres niveles en Chromium, en tamaño escritorio y celular, y se corren solas en GitHub Actions con cada push a `main`.

```bash
npm install
npx playwright install chromium
npm test
```

## Créditos

Sonidos de Wikimedia Commons y tipografías de Google Fonts; detalle de autores y licencias en [CREDITS.md](CREDITS.md).
