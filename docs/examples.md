# Examples

This document provides example HTML files demonstrating different configurations and use cases for the Lightning Particles Effect.

## Example 1: Lightning Particles with Settings

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lightning Particles JS Example with Settings</title>
        <link rel="stylesheet" href="/examples/lightningparticles.css" />
    </head>

    <body>
        <div id="canvas-container">
            <canvas></canvas>
        </div>
        <script src="/lightningparticles.js"></script>
        <script src="/examples/lightningparticles_settings.js"></script>
        <script type="text/javascript">
            const config = {
                particleColor: "4a4a4a",
                lineColor: "#ffffff",
                lightningColor: "#00ffff",
                lightningGlowColor: "#00ffff",
                particleOpacity: 0.8,
                particleCount: 350,
                particleMinSize: 0.5,
                particleMaxSize: 2,
                particleSpeed: 1,
                lineOpacity: 0.6,
                lineThickness: 0.5,
                maxDistance: 50,
                lightningOpacity: 0.8,
                lightningThickness: 2,
                lightningFrequency: 0.03,
                lightningGlow: 100,
                globalLightningDirection: false,
                lightningAngle: Math.PI / 2,
                lightningThroughParticles: true,
                minLightningSegments: 3,
                maxLightningSegments: 20,
                enableSplits: true,
                minSplitSegments: 3,
                maxSplits: 3,
                splitProbability: 0.3,
                minLightningLifetime: 30,
                maxLightningLifetime: 60,
                instantLightning: false,
                fpsLimit: 60,
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                particleBlendMode: "screen",
                lightningBlendMode: "screen",
                pauseOnBlur: false,
            };

            document.addEventListener("DOMContentLoaded", () => {
                const canvas = document.querySelector("canvas");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                const lightningEffect = new LightningParticle(canvas, config);

                new SettingsUI(config, true, (newConfig) => {
                    lightningEffect.updateConfig(newConfig);
                });
            });
        </script>
    </body>
</html>
```

## Example 2: Lightning Only

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lightning Particles JS Example lightning only</title>
        <link rel="stylesheet" href="/examples/lightningparticles.css" />
    </head>

    <body>
        <canvas></canvas>

        <script src="/lightningparticles.min.js"></script>
        <script src="/examples/lightningparticles_settings.js"></script>
        <script type="text/javascript">
            const config = {
                particleColor: "#4a4a4a",
                lineColor: "#ffffff",
                lightningColor: "#ffffff",
                lightningGlowColor: "#00ffff",
                particleOpacity: 0,
                particleCount: 1500,
                particleMinSize: 0.5,
                particleMaxSize: 2,
                particleSpeed: 1,
                lineOpacity: 0,
                lineThickness: 0.5,
                maxDistance: 50,
                lightningOpacity: 1,
                lightningThickness: 3,
                lightningFrequency: 0.02,
                lightningGlow: 50,
                globalLightningDirection: false,
                lightningAngle: Math.PI / 2,
                lightningThroughParticles: true,
                minLightningSegments: 5,
                maxLightningSegments: 20,
                enableSplits: true,
                minSplitSegments: 3,
                maxSplits: 10,
                splitProbability: 0.7,
                minLightningLifetime: 50,
                maxLightningLifetime: 50,
                instantLightning: false,
                fpsLimit: 60,
                backgroundColor: "rgba(10, 10, 25, 1)",
                particleBlendMode: "screen",
                lightningBlendMode: "screen",
                pauseOnBlur: false,
            };

            document.addEventListener("DOMContentLoaded", () => {
                const canvas = document.querySelector("canvas");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                const lightningEffect = new LightningParticle(canvas, config);

                new SettingsUI(config, true, (newConfig) => {
                    lightningEffect.updateConfig(newConfig);
                });
            });
        </script>
    </body>
</html>
```

## Example 3: No Lightning

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lightning Particles JS Example no lightning</title>
        <link rel="stylesheet" href="/examples/lightningparticles.css" />
    </head>

    <body>
        <div id="canvas-container">
            <canvas></canvas>
        </div>

        <script src="/lightningparticles.js"></script>
        <script type="text/javascript">
            const config = {
                particleColor: "#4a4a4a",
                lineColor: "#ffffff",
                lightningColor: "#ffffff",
                lightningGlowColor: "#00ffff",
                particleOpacity: 0.9,
                particleCount: 100,
                particleMinSize: 0.1,
                particleMaxSize: 3,
                particleSpeed: 0.5,
                lineOpacity: 0.75,
                lineThickness: 0.5,
                maxDistance: 75,
                lightningOpacity: 0,
                lightningThickness: 3,
                lightningFrequency: 0.02,
                lightningGlow: 0,
                globalLightningDirection: false,
                lightningAngle: Math.PI / 2,
                lightningThroughParticles: true,
                minLightningSegments: 5,
                maxLightningSegments: 20,
                enableSplits: true,
                minSplitSegments: 3,
                maxSplits: 10,
                splitProbability: 0.7,
                minLightningLifetime: 50,
                maxLightningLifetime: 50,
                instantLightning: false,
                fpsLimit: 60,
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                particleBlendMode: "screen",
                lightningBlendMode: "screen",
                pauseOnBlur: false,
            };

            document.addEventListener("DOMContentLoaded", () => {
                const canvas = document.querySelector("canvas");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                const lightningEffect = new LightningParticle(canvas, config);
            });
        </script>
    </body>
</html>
```

## Example 4: Simple Initialization

```html
<script src="https://cdn.jsdelivr.net/gh/misztersoul/LightningParticlesJS/lightningparticles.js"></script>
<canvas width="1000" height="300"></canvas>
<script>
  new LightningParticle(document.querySelector("canvas"));
</script>
```
