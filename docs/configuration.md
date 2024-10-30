# Configuration Options

This document provides a comprehensive list of configuration options for the Lightning Particles Effect project. Each option includes a description and its default value.

## Configuration Options

### Particle Options

- `particleColor`: Color of the particles (default: "#4a4a4a")
- `particleOpacity`: Opacity of the particles (default: 0.8)
- `particleCount`: Number of particles (default: 350)
- `particleMinSize`: Minimum size of particles (default: 0.5)
- `particleMaxSize`: Maximum size of particles (default: 2)
- `particleSpeed`: Speed of particle movement (default: 1)
- `particleBlendMode`: Blend mode for particles (default: "source-over")
- `minParticleCount`: Minimum particle count for scaling (default: 25)
- `maxParticleCount`: Maximum particle count for scaling (default: 1500)
- `particleAdjustStep`: Particle count adjustment step (default: 15)

### Line Options

- `lineColor`: Color of the lines connecting particles (default: "#ffffff")
- `lineOpacity`: Opacity of the lines connecting particles (default: 0.6)
- `lineThickness`: Thickness of the lines connecting particles (default: 0.5)
- `maxDistance`: Maximum distance between particles to draw a line (default: 50)

### Lightning Options

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
- `lightningBlendMode`: Blend mode for lightning (default: "source-over")

### Collision-Triggered Lightning Options

- `enableLightningOnCollision`: Enable lightning on collision (default: false)
- `collisionLightningColor`: Color of collision-triggered lightning (default: "#ff0000")
- `collisionLightningGlowColor`: Glow color of collision-triggered lightning (default: "#ff0000")
- `collisionLightningOpacity`: Opacity of collision-triggered lightning (default: 0.9)
- `collisionLightningThickness`: Thickness of collision-triggered lightning (default: 3)
- `collisionLightningLifetime`: Lifetime of collision-triggered lightning (default: 50)
- `collisionLightningDelay`: Delay before collision-triggered lightning (default: 1000)
- `collisionLightningMinDistance`: Minimum distance for collision-triggered lightning (default: 15)
- `collisionLightningIntensity`: Intensity of collision-triggered lightning (default: 50)
- `collisionEnableSplits`: Enable splits for collision-triggered lightning (default: true)
- `collisionSplitProbability`: Probability of splits for collision-triggered lightning (default: 0.3)
- `collisionMinSplitSegments`: Minimum number of split segments for collision-triggered lightning (default: 3)
- `collisionMaxSplits`: Maximum number of splits for collision-triggered lightning (default: 3)

### General Options

- `backgroundColor`: Background color of the canvas (default: "rgba(0, 0, 0, 0.75)")
- `fpsLimit`: Frame rate limit for the animation (default: 60)
- `pauseOnBlur`: Pause animation when page is not in focus (default: true)
- `referenceResolution`: Reference resolution for scaling (default: { width: 1920, height: 1080 })
- `referenceParticleCount`: Reference particle count for scaling (default: 350)
- `minFPS`: FPS threshold below which particles are reduced (default: 5)
- `maxFPS`: FPS threshold above which particles can be increased (default: 144)
- `pauseOnScroll`: Pause animation when the canvas is not in the viewport (default: false)
- `borderOffset`: Offset from the border (default: 5)
