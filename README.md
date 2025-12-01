# Lightning Particles Effect

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/MiszterSoul/LightningParticlesJS)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A high-performance, customizable particle system with lightning effects for HTML5 Canvas. Create stunning visual displays of particles connected by lines, with dynamic lightning bolts striking between them.

## ✨ Features

- 🎨 Fully customizable particle system
- ⚡ Dynamic lightning effects with splits and collision triggers
- 🚀 High performance with spatial hashing and object pooling
- 📱 Responsive design that adapts to window resizing
- 🔧 UMD module support (CommonJS, AMD, Browser globals)
- ⏸️ Smart pause on blur/scroll for battery saving
- 🎯 Avoidable areas support for UI elements

## 🎬 Demo

### Lightning Effect

![Lightning Effect](https://i.imgur.com/KXLEGuv.gif)

### Particle Effect

![Particle Effect](https://i.imgur.com/7YAirI8.gif)

## 📦 Installation

### Browser

```html
<script src="path/to/lightningparticles.js"></script>
```

### npm (coming soon)

```bash
npm install lightning-particles
```

### ES Module

```javascript
import LightningParticle from './lightningparticles.js';
```

## 🚀 Quick Start

1. Create a canvas element in your HTML:

```html
<canvas id="canvas-container"></canvas>
```

2. Add some basic styling:

```css
#canvas-container {
  width: 100%;
  height: 100vh;
  display: block;
}
```

3. Initialize the effect:

```javascript
const canvas = document.getElementById("canvas-container");
const effect = new LightningParticle(canvas, {
  // Optional configuration
  particleColor: "#4a4a4a",
  lightningColor: "#00ffff",
  lightningFrequency: 0.03
});
```

## ⚙️ Configuration Options

The `LightningParticle` constructor accepts a configuration object with the following options:

### Particle Settings

| Option | Description | Default |
|--------|-------------|---------|
| `particleCount` | Number of particles | `350` |
| `particleColor` | Color of the particles | `"#4a4a4a"` |
| `particleOpacity` | Opacity of the particles (0-1) | `0.8` |
| `particleMinSize` | Minimum particle radius | `0.5` |
| `particleMaxSize` | Maximum particle radius | `2` |
| `particleSpeed` | Speed of particle movement | `1` |
| `particleBlendMode` | Canvas blend mode for particles | `"source-over"` |
| `minParticleCount` | Minimum particles (for adaptive scaling) | `25` |
| `maxParticleCount` | Maximum particles (for adaptive scaling) | `1500` |
| `particleAdjustStep` | Particles to add/remove per performance adjustment | `15` |

### Line Settings

| Option | Description | Default |
|--------|-------------|---------|
| `lineColor` | Color of connecting lines | `"#ffffff"` |
| `lineOpacity` | Opacity of connecting lines | `0.6` |
| `lineThickness` | Thickness of connecting lines | `0.5` |
| `maxDistance` | Maximum distance for particle connections | `50` |

### Lightning Settings

| Option | Description | Default |
|--------|-------------|---------|
| `lightningColor` | Color of lightning bolts | `"#00ffff"` |
| `lightningGlowColor` | Glow color of lightning | `"#00ffff"` |
| `lightningOpacity` | Opacity of lightning | `0.8` |
| `lightningThickness` | Thickness of lightning bolts | `2` |
| `lightningFrequency` | Probability of lightning per frame (0-1) | `0.03` |
| `lightningGlow` | Glow intensity (blur radius) | `100` |
| `globalLightningDirection` | Use fixed direction for all lightning | `false` |
| `lightningAngle` | Angle when global direction enabled | `Math.PI / 2` |
| `lightningThroughParticles` | Lightning segments snap to particles | `true` |
| `minLightningSegments` | Minimum segments per bolt | `3` |
| `maxLightningSegments` | Maximum segments per bolt | `20` |
| `enableSplits` | Allow lightning to split into branches | `true` |
| `minSplitSegments` | Minimum segments for split bolts | `3` |
| `maxSplits` | Maximum number of splits | `3` |
| `splitProbability` | Probability of splitting (0-1) | `0.3` |
| `minLightningLifetime` | Minimum bolt lifetime (frames) | `30` |
| `maxLightningLifetime` | Maximum bolt lifetime (frames) | `60` |
| `instantLightning` | Draw full bolt immediately vs animated | `false` |
| `lightningBlendMode` | Canvas blend mode for lightning | `"source-over"` |

### Collision Lightning Settings

| Option | Description | Default |
|--------|-------------|---------|
| `enableLightningOnCollision` | Enable lightning on particle collisions | `false` |
| `collisionLightningColor` | Color of collision lightning | `"#ff0000"` |
| `collisionLightningGlowColor` | Glow color of collision lightning | `"#ff0000"` |
| `collisionLightningOpacity` | Opacity of collision lightning | `0.9` |
| `collisionLightningThickness` | Thickness of collision lightning | `3` |
| `collisionLightningLifetime` | Lifetime of collision lightning | `50` |
| `collisionLightningDelay` | Delay between collision lightnings (ms) | `1000` |
| `collisionLightningMinDistance` | Minimum distance between collision lightnings | `15` |
| `collisionLightningIntensity` | Glow intensity for collision lightning | `50` |

### General Settings

| Option | Description | Default |
|--------|-------------|---------|
| `backgroundColor` | Canvas background color | `"rgba(0, 0, 0, 0.75)"` |
| `fpsLimit` | Maximum frames per second | `60` |
| `pauseOnBlur` | Pause when window loses focus | `true` |
| `pauseOnScroll` | Pause when canvas not in viewport | `false` |
| `referenceResolution` | Resolution for particle density scaling | `{ width: 1920, height: 1080 }` |
| `referenceParticleCount` | Base particle count at reference resolution | `350` |
| `minFPS` | FPS threshold to reduce particles | `5` |
| `maxFPS` | FPS threshold to increase particles | `144` |
| `borderOffset` | Offset from canvas edges | `5` |
| `resetOnResume` | Reset particle positions on resume | `false` |

## 🔧 Methods

### `updateConfig(newConfig)`

Update configuration at runtime:

```javascript
effect.updateConfig({
  particleColor: "#ff0000",
  lightningFrequency: 0.05
});
```

### `pause()` / `resume()`

Control animation state:

```javascript
effect.pause();
// ... later
effect.resume();
```

### `stop()`

Stop animation and cleanup resources:

```javascript
effect.stop();
```

### `getFPS()`

Get current frames per second:

```javascript
console.log(`Current FPS: ${effect.getFPS()}`);
```

### `getParticleCount()`

Get number of active particles:

```javascript
console.log(`Particles: ${effect.getParticleCount()}`);
```

### `updateAvoidableAreas(selector)`

Make particles avoid specific DOM elements:

```javascript
effect.updateAvoidableAreas('.btn, .nav-item');
```

### `isPaused()` / `isRunning()`

Check animation state:

```javascript
if (effect.isPaused()) {
  effect.resume();
}
```

### `createLightning()`

Manually trigger a lightning bolt:

```javascript
// Random position
effect.createLightning();

// Specific position
effect.createLightning(100, 200);

// Full control
effect.createLightning(x, y, lifetime, color, glowColor, opacity, thickness, intensity, type);
```

## 🚀 Performance

Version 2.0.0 includes significant performance improvements:

- **Spatial Hashing**: O(n) particle connection lookups instead of O(n²)
- **Object Pooling**: Reduced garbage collection for lightning bolts
- **Batched Rendering**: Single draw call for all particles
- **Adaptive Performance**: Automatic particle count adjustment based on FPS
- **Smart Pausing**: Stops animation when tab is hidden or canvas is off-screen

## 📋 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 👤 Author

**MiszterSoul**

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.
