# Usage Instructions

This document provides detailed usage instructions for the Lightning Particles Effect project.

## Including the Script

To use the Lightning Particles Effect in your project, include the `lightningparticles.js` script in your HTML file:

```html
<script src="path/to/lightningparticles.js"></script>
```

Replace `path/to/lightningparticles.js` with the actual path to the script file.

## Creating the Canvas Element

Create a canvas element in your HTML file where the effect will be rendered:

```html
<canvas id="canvas-container"></canvas>
```

## Initializing the Effect

Initialize the LightningParticle effect by creating a new instance of the `LightningParticle` class and passing the canvas element and an optional configuration object:

```javascript
const canvas = document.getElementById("canvas-container");
const lightningEffect = new LightningParticle(canvas, {
  // Optional configuration options
});
```

## Configuration Options

The `LightningParticle` constructor accepts a configuration object with various options to customize the effect. Here are some of the available options:

- `particleColor`: Color of the particles (default: "#4a4a4a")
- `particleOpacity`: Opacity of the particles (default: 0.8)
- `particleCount`: Number of particles (default: 350)
- `particleMinSize`: Minimum size of particles (default: 0.5)
- `particleMaxSize`: Maximum size of particles (default: 2)
- `particleSpeed`: Speed of particle movement (default: 1)
- `lineColor`: Color of the lines connecting particles (default: "#ffffff")
- `lineOpacity`: Opacity of the lines connecting particles (default: 0.6)
- `lineThickness`: Thickness of the lines connecting particles (default: 0.5)
- `maxDistance`: Maximum distance between particles to draw a line (default: 50)
- `lightningColor`: Color of the lightning (default: "#00ffff")
- `lightningGlowColor`: Glow color of the lightning (default: "#00ffff")
- `lightningOpacity`: Opacity of the lightning (default: 0.8)
- `lightningThickness`: Thickness of the lightning (default: 2)
- `lightningFrequency`: Frequency of lightning creation (default: 0.03)
- `lightningGlow`: Glow intensity of the lightning (default: 100)
- `globalLightningDirection`: Whether lightning follows a global direction (default: false)
- `lightningAngle`: Angle of the lightning if global direction is enabled (default: Math.PI / 2)
- `lightningThroughParticles`: Whether lightning can pass through particles (default: true)
- `minLightningSegments`: Minimum number of segments in a lightning bolt (default: 3)
- `maxLightningSegments`: Maximum number of segments in a lightning bolt (default: 20)
- `enableSplits`: Whether lightning can split into multiple bolts (default: true)
- `minSplitSegments`: Minimum number of segments in a split lightning bolt (default: 3)
- `maxSplits`: Maximum number of splits in a lightning bolt (default: 3)
- `splitProbability`: Probability of a lightning bolt splitting (default: 0.3)
- `minLightningLifetime`: Minimum lifetime of a lightning bolt (default: 30)
- `maxLightningLifetime`: Maximum lifetime of a lightning bolt (default: 60)
- `instantLightning`: Whether lightning is drawn instantly or with lifetime by steps (default: false)
- `backgroundColor`: Background color of the canvas (default: "rgba(0, 0, 0, 0.75)")
- `particleBlendMode`: Blend mode for particles (default: "source-over")
- `lightningBlendMode`: Blend mode for lightning (default: "source-over")
- `fpsLimit`: Frame rate limit for the animation (default: 60)
- `pauseOnBlur`: Pause animation when page is not in focus (default: true)
- `referenceResolution`: Reference resolution for scaling (default: { width: 1920, height: 1080 })
- `referenceParticleCount`: Reference particle count for scaling (default: 350)
- `minParticleCount`: Minimum particle count for scaling (default: 25)
- `maxParticleCount`: Maximum particle count for scaling (default: 1500)
- `minFPS`: FPS threshold below which particles are reduced (default: 5)
- `maxFPS`: FPS threshold above which particles can be increased (default: 144)
- `particleAdjustStep`: Particle count adjustment step (default: 15)
- `pauseOnScroll`: Pause animation when the canvas is not in the viewport (default: false)

For a comprehensive list of configuration options with descriptions and default values, see the [configuration documentation](docs/configuration.md).

## Updating Configuration

You can update the configuration at runtime using the `updateConfig` method:

```javascript
lightningEffect.updateConfig({
  particleColor: "#ff0000",
  lightningFrequency: 0.05,
});
```

This allows you to dynamically change the effect's settings without reinitializing the effect.

## Example

Here is a complete example of how to use the Lightning Particles Effect:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lightning Particles Effect Example</title>
    <script src="path/to/lightningparticles.js"></script>
</head>
<body>
    <canvas id="canvas-container"></canvas>
    <script>
        const canvas = document.getElementById("canvas-container");
        const lightningEffect = new LightningParticle(canvas, {
            particleColor: "#ff0000",
            particleCount: 500,
            lightningFrequency: 0.05,
        });
    </script>
</body>
</html>
```

Replace `path/to/lightningparticles.js` with the actual path to the script file.

## Additional Examples

For more examples demonstrating different configurations and use cases, see the [examples documentation](docs/examples.md).
