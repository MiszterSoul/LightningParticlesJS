# Lightning Particles Effect
This project implements an interactive lightning and particle effect using HTML5 Canvas and JavaScript. It creates a visually stunning display of particles connected by lines, with occasional lightning bolts striking between them.

## Features

- Customizable particle system
- Dynamic lightning effect
- Configurable settings for both particles and lightning
- Responsive design that adapts to window resizing

## Demo

### Particle Effect with Lightning
![Particle Effect](assets/example1.webm)

### Lightning Effect
![Lightning Effect](assets/example2.webm)

### Particle Effect
![Particle Effect](assets/example3.webm)

## Usage

1. Include the `lightningparticles.js` file in your HTML:

  ```html
  <script src="path/to/lightningparticles.js"></script>
  ```

2. Create a canvas element in your HTML:

  ```html
  <canvas id="canvas-container"></canvas>
  ```

3. Initialize the LightningParticle effect:

  ```javascript
  const canvas = document.getElementById('canvas-container');
  const lightningEffect = new LightningParticle(canvas, {
    // Optional configuration options
  });
  ```

## Configuration Options

The `LightningParticle` constructor accepts a configuration object with the following options:

| Option | Description | Default |
|--------|-------------|---------|
| particleColor | Color of the particles | "#4a4a4a" |
| particleOpacity | Opacity of the particles | 0.8 |
| particleCount | Number of particles | 350 |
| particleMinSize | Minimum size of particles | 0.5 |
| particleMaxSize | Maximum size of particles | 2 |
| particleSpeed | Speed of particle movement | 1 |
| lineColor | Color of the lines connecting particles | "#ffffff" |
| lineOpacity | Opacity of the lines connecting particles | 0.6 |
| lineThickness | Thickness of the lines connecting particles | 0.5 |
| maxDistance | Maximum distance between particles to draw a line | 50 |
| lightningColor | Color of the lightning | "#00ffff" |
| lightningGlowColor | Glow color of the lightning | "#00ffff" |
| lightningOpacity | Opacity of the lightning | 0.8 |
| lightningThickness | Thickness of the lightning | 2 |
| lightningFrequency | Frequency of lightning creation | 0.03 |
| lightningGlow | Glow intensity of the lightning | 100 |
| globalLightningDirection | Whether lightning follows a global direction | false |
| lightningAngle | Angle of the lightning if global direction is enabled | Math.PI / 2 |
| lightningThroughParticles | Whether lightning can pass through particles | true |
| minLightningSegments | Minimum number of segments in a lightning bolt | 3 |
| maxLightningSegments | Maximum number of segments in a lightning bolt | 20 |
| enableSplits | Whether lightning can split into multiple bolts | true |
| minSplitSegments | Minimum number of segments in a split lightning bolt | 3 |
| maxSplits | Maximum number of splits in a lightning bolt | 3 |
| splitProbability | Probability of a lightning bolt splitting | 0.3 |
| minLightningLifetime | Minimum lifetime of a lightning bolt | 30 |
| maxLightningLifetime | Maximum lifetime of a lightning bolt | 60 |
| instantLightning | Whether lightning is drawn instantly or with lifetime by steps | false |
| minActiveLightning | Minimum number of active lightning bolts | 1 |
| maxActiveLightning | Maximum number of active lightning bolts | 5 |
| backgroundColor | Background color of the canvas | "rgba(0, 0, 0, 0.75)" |
| particleBlendMode | Blend mode for particles | "screen" |
| lightningBlendMode | Blend mode for lightning | "screen" |
| fpsLimit | Frame rate limit for the animation | 60 |
| pauseOnBlur | Pause animation when page is not in focus | true |

## Updating Configuration

You can update the configuration at runtime using the `updateConfig` method:

```javascript
lightningEffect.updateConfig({
  particleColor: "#ff0000",
  lightningFrequency: 0.05
});
```

## Author

MiszterSoul

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.