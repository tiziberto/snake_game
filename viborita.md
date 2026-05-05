# Plan: Snake Game (Viborita) 🐍

## Repo: https://github.com/tiziberto/snake_game
## Deploy: GitHub Pages (github.io)

## Tecnologia Elegida
- **Vanilla HTML + CSS + JavaScript**
- Canvas API para el renderizado del juego
- Sin frameworks ni dependencias externas
- Totalmente liviano y compatible con cualquier navegador
- Deploy estático con GitHub Pages (no necesita build)

---

## Fase 1: Página base sin reactividad

### Objetivo
Crear la estructura HTML/CSS estática de la página con botones de configuración estética.

### Archivos
- `index.html` → Estructura principal
- `style.css` → Estilos visuales
- `game.js` → Lógica del juego (vacío inicialmente)

### Elementos UI
- [ ] Título del juego
- [ ] Canvas para el área de juego
- [ ] Botón **"Start Game"**
- [ ] Botón **"Settings"** → abre panel de configuración estética:
  - [ ] Selector de color de la víbora
  - [ ] Selector de color de fondo
  - [ ] Selector de tamaño de grilla (15x15, 20x20, 30x30)
  - [ ] Selector de velocidad (slow, normal, fast)
- [ ] Área de puntuación (vacía inicialmente)
- [ ] Botón **"Leaderboard"** (placeholder por ahora)

---

## Fase 2: Movimiento con WASD

### Objetivo
Implementar la lógica de movimiento de la víbora con las teclas W, A, S, D.

### Lógica
- [ ] Estado inicial: víbora centrada con tamaño 3
- [ ] `W` → arriba
- [ ] `A` → izquierda
- [ ] `S` → abajo
- [ ] `D` → derecha
- [ ] Prevenir giro de 180° (no puede ir hacia atrás directamente)
- [ ] Game loop con `requestAnimationFrame` + throttle por velocidad configurada
- [ ] La víbora se mueve continuamente en la última dirección presionada

### Colisión básica
- [ ] Paredes → game over
- [ ] **No** se implementa colisión con la propia cola todavía

---

## Fase 3: Reactividad eficiente

### Objetivo
Agregar reactividad ligera para que el juego renderice solo cuando cambia el estado.

### Sistema reactivo minimalista
- [ ] Crear un pequeño sistema `store` con pattern **observer/pub-sub**:
  - [ ] `state` → objeto con todo el estado del juego
  - [ ] `subscribe(key, callback)` → registrar listeners por clave
  - [ ] `setState(key, value)` → actualizar y notificar solo los cambios
- [ ] Canvas se redibuja solo cuando cambian: `snake`, `apple`, `score`, `gameStatus`
- [ ] Usar `requestAnimationFrame` para render suave
- [ ] Evitar re-renders innecesarios (solo redibujar tiles que cambiaron)

### Optimización
- [ ] Redibujar solo la celda anterior de la cola (borrarla) y la nueva cabeza
- [ ] No limpiar y redibujar todo el canvas en cada frame

---

## Fase 4: Puntaje temporal

### Objetivo
Manejar un sistema de puntuación que se reinicia cuando el usuario pierde.

### Lógica
- [ ] Cada manzana comida → +10 puntos
- [ ] Timer que muestra el tiempo transcurrido desde el inicio de la partida
- [ ] Cuando la víbora colisiona con su **propia cola** → game over
- [ ] Al morir:
  - [ ] Mostrar pantalla de **Game Over** con:
    - [ ] Puntaje final
    - [ ] Tiempo jugado
    - [ ] Botón **"Play Again"**
    - [ ] Botón **"Save Score"** (agrega al leaderboard temporal)

### Manzanas
- [ ] Aparecen en posición aleatoria (no sobre la víbora)
- [ ] Al comerla, la víbora crece en 1 segmento
- [ ] Se genera nueva manzana

---

## Fase 5: Leaderboard temporal

### Objetivo
Ranking de mejores puntajes guardado en `sessionStorage` (se borra al cerrar el navegador).

### Funcionalidad
- [ ] Botón **"Leaderboard"** muestra tabla con:
  - [ ] Top 10 mejores puntajes
  - [ ] Nombre del jugador (input al guardar)
  - [ ] Puntaje
  - [ ] Fecha/hora de la partida
  - [ ] Duración de la partida
- [ ] Orden descendente por puntaje
- [ ] Al guardar un score, se actualiza la tabla
- [ ] Se puede limpiar el leaderboard con un botón
- [ ] Todo se guarda en `sessionStorage` → volátil, se pierde al cerrar el navegador

---

## Fase 6: Configuración para GitHub Pages

### Objetivo
Preparar el repo para deploy estático en `https://tiziberto.github.io/snake_game/`

### Pasos
- [ ] Crear estructura del repo `snake_game/` en el directorio correcto
- [ ] Inicializar git y conectar con `https://github.com/tiziberto/snake_game`
- [ ] Primer commit con todos los archivos
- [ ] Configurar GitHub Pages desde la rama `main` (raíz del repo)
- [ ] Verificar que el juego funciona en `https://tiziberto.github.io/snake_game/`

---

## Estructura de Archivos Final

```
snake_game/
├── index.html          → Página principal
├── style.css           → Estilos
├── game.js             → Lógica completa del juego
│   ├── Store reactivo
│   ├── Game loop
│   ├── Input handling (WASD)
│   ├── Collision detection
│   ├── Score system
│   └── Leaderboard (sessionStorage)
```

---

## Flujo del Juego

1. Usuario ve la pantalla principal con opciones estéticas
2. Presiona **"Start Game"**
3. La víbora se mueve, las manzanas aparecen
4. Puntaje y timer se actualizan en tiempo real
5. Si choca con la cola o paredes → **Game Over**
6. Usuario puede guardar su puntaje en el leaderboard
7. Leaderboard accesible desde cualquier momento
8. Al cerrar el navegador, leaderboard se pierde
