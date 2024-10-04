class LightningParticle {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configuration settings for the LightningParticle class
    this.config = {
      // Particle settings
      particleCount: config.particleCount ?? 350, // Number of particles
      particleColor: config.pparticleColor ?? '#4a4a4a', // Color of particles
      particleOpacity: config.particleOpacity ?? 0.8, // Opacity of particles
      particleMinSize: config.particleMinSize ?? 0.5, // Minimum size of particles
      particleMaxSize: config.particleMaxSize ?? 2, // Maximum size of particles
      particleSpeed: config.particleSpeed ?? 1, // Speed of particles
      particleBlendMode: config.particleBlendMode ?? 'source-over', // Blend mode for particles
      minParticleCount: config.minParticleCount ?? 25, // Minimum number of particles
      maxParticleCount: config.maxParticleCount ?? 1500, // Maximum number of particles
      particleAdjustStep: config.particleAdjustStep ?? 15, // Step size for adjusting particle count

      // Line settings
      lineColor: config.lineColor ?? '#ffffff', // Color of lines
      lineOpacity: config.lineOpacity ?? 0.6, // Opacity of lines
      lineThickness: config.lineThickness ?? 0.5, // Thickness of lines
      maxDistance: config.maxDistance ?? 50, // Maximum distance for line connections

      // Lightning settings
      lightningColor: config.lightningColor ?? '#00ffff', // Color of lightning
      lightningGlowColor: config.lightningGlowColor ?? '#00ffff', // Glow color of lightning
      lightningOpacity: config.lightningOpacity ?? 0.8, // Opacity of lightning
      lightningThickness: config.lightningThickness ?? 2, // Thickness of lightning
      lightningFrequency: config.lightningFrequency ?? 0.03, // Frequency of lightning strikes
      lightningGlow: config.lightningGlow ?? 100, // Glow intensity of lightning
      globalLightningDirection: config.globalLightningDirection ?? false, // Global direction for lightning
      lightningAngle: config.lightningAngle ?? Math.PI / 2, // Angle of lightning
      lightningThroughParticles: config.lightningThroughParticles ?? true, // Whether lightning passes through particles
      minLightningSegments: config.minLightningSegments ?? 3, // Minimum number of lightning segments
      maxLightningSegments: config.maxLightningSegments ?? 20, // Maximum number of lightning segments
      enableSplits: config.enableSplits ?? true, // Enable lightning splits
      minSplitSegments: config.minSplitSegments ?? 3, // Minimum number of split segments
      maxSplits: config.maxSplits ?? 3, // Maximum number of splits
      splitProbability: config.splitProbability ?? 0.3, // Probability of lightning splits
      minLightningLifetime: config.minLightningLifetime ?? 30, // Minimum lifetime of lightning
      maxLightningLifetime: config.maxLightningLifetime ?? 60, // Maximum lifetime of lightning
      instantLightning: config.instantLightning ?? false, // Enable instant lightning
      lightningBlendMode: config.lightningBlendMode ?? 'source-over', // Blend mode for lightning

      // Collision-triggered lightning settings
      enableLightningOnCollision: config.enableLightningOnCollision ?? false, // Enable lightning on collision
      collisionLightningColor: config.collisionLightningColor ?? '#ff0000', // Color of collision-triggered lightning
      collisionLightningGlowColor: config.collisionLightningGlowColor ?? '#ff0000', // Glow color of collision-triggered lightning
      collisionLightningOpacity: config.collisionLightningOpacity ?? 0.9, // Opacity of collision-triggered lightning
      collisionLightningThickness: config.collisionLightningThickness ?? 3, // Thickness of collision-triggered lightning
      collisionLightningLifetime: config.collisionLightningLifetime ?? 50, // Lifetime of collision-triggered lightning
      collisionLightningDelay: config.collisionLightningDelay ?? 1000, // Delay before collision-triggered lightning
      collisionLightningMinDistance: config.collisionLightningMinDistance ?? 15, // Minimum distance for collision-triggered lightning
      collisionLightningIntensity: config.collisionLightningIntensity ?? 50, // Intensity of collision-triggered lightning
      collisionEnableSplits: config.collisionEnableSplits ?? true, // Enable splits for collision-triggered lightning
      collisionSplitProbability: config.collisionSplitProbability ?? 0.3, // Probability of splits for collision-triggered lightning
      collisionMinSplitSegments: config.collisionMinSplitSegments ?? 3, // Minimum number of split segments for collision-triggered lightning
      collisionMaxSplits: config.collisionMaxSplits ?? 3, // Maximum number of splits for collision-triggered lightning

      // General settings
      backgroundColor: config.backgroundColor ?? 'rgba(0, 0, 0, 0.75)', // Background color
      fpsLimit: config.fpsLimit ?? 60, // Frames per second limit
      pauseOnBlur: config.pauseOnBlur ?? true, // Pause animation when window loses focus
      referenceResolution: config.referenceResolution ?? { width: 1920, height: 1080 }, // Reference resolution for scaling
      referenceParticleCount: config.referenceParticleCount ?? config.particleCount ?? 350, // Reference particle count for scaling
      minFPS: config.minFPS ?? 5, // Minimum frames per second
      maxFPS: config.maxFPS ?? 144, // Maximum frames per second
      pauseOnScroll: config.pauseOnScroll ?? false, // Pause animation on scroll
      borderOffset: config.borderOffset ?? 5, // Offset from the border
    };

    // Initialize properties
    this.particles = [];
    this.lightning = [];
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fpsInterval = 1000 / this.config.fpsLimit;
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.isRunning = true;
    this.isPaused = false;
    this.isScrollPaused = false;

    // Bind methods
    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleScroll = this.handleScroll.bind(this);

    this.avoidableAreas = [];

    // Initialize collision-triggered lightning tracking
    this.lastCollisionLightningTime = 0;
    this.collisionLightningPositions = []; // Array to store recent lightning positions

    // Set up event listeners
    this.setupEventListeners();

    // Initial setup
    this.resize();
    requestAnimationFrame(this.animate);
  }

  /**
   * Sets up the necessary event listeners.
   */
  setupEventListeners() {
    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
    if (this.config.pauseOnScroll) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.resume();
              this.isScrollPaused = false;
            } else {
              this.pause();
              this.isScrollPaused = true;
            }
          });
        },
        { threshold: 0 }
      );
      this.observer.observe(this.canvas);
    }
  }

  /**
   * Removes the event listeners.
   */
  removeEventListeners() {
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
    if (this.config.pauseOnScroll) {
      window.removeEventListener('scroll', this.handleScroll);
    }
    if (this.config.pauseOnScroll && this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Resizes the canvas and adjusts particle count based on new size.
   */
  resize() {
    try {
      // Set canvas dimensions to client dimensions
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;

      // Calculate particle density based on reference resolution
      const currentArea = this.canvas.width * this.canvas.height;
      const referenceArea =
        this.config.referenceResolution.width * this.config.referenceResolution.height;
      const particleDensity = this.config.referenceParticleCount / referenceArea;

      // Calculate target particle count
      let targetParticleCount = Math.round(particleDensity * currentArea);
      targetParticleCount = Math.max(
        this.config.minParticleCount,
        Math.min(targetParticleCount, this.config.maxParticleCount)
      );

      // Update particle count in config
      this.config.particleCount = targetParticleCount;

      // Adjust existing particles
      this.particles.forEach((particle) => {
        // Ensure particles are within bounds
        particle.x = Math.max(0, Math.min(particle.x, this.canvas.width));
        particle.y = Math.max(0, Math.min(particle.y, this.canvas.height));
      });

      // Add or remove particles to match target count
      while (this.particles.length > this.config.particleCount) {
        this.particles.pop();
      }
      while (this.particles.length < this.config.particleCount) {
        this.createParticle();
      }
    } catch (error) {
      console.error('Error in resize:', error);
    }
  }

  /**
   * Creates a new particle with random properties.
   */
  createParticle() {
    const radius =
      Math.random() * (this.config.particleMaxSize - this.config.particleMinSize) +
      this.config.particleMinSize;
    this.particles.push({
      x: Math.random() * (this.canvas.width - 2 * radius) + radius, // Ensure particle starts within canvas bounds
      y: Math.random() * (this.canvas.height - 2 * radius) + radius,
      radius: radius,
      color: this.config.particleColor,
      velocity: {
        x: (Math.random() - 0.5) * this.config.particleSpeed * 2,
        y: (Math.random() - 0.5) * this.config.particleSpeed * 2,
      },
    });
  }

  updateParticles() {
    const {
      particleSpeed,
      borderOffset,
      enableLightningOnCollision,
      collisionLightningDelay,
      collisionLightningMinDistance,
      collisionLightningIntensity,
      pauseOnBlur
    } = this.config;

    // Use the destructured variables directly
    const scaleFactor = this.deltaTime / (1000 / 60);
    const dampingFactor = 0.9;

    this.particles.forEach(particle => {
      // Store previous position
      const prevX = particle.x;
      const prevY = particle.y;

      // Update particle position
      particle.x += particle.velocity.x * scaleFactor;
      particle.y += particle.velocity.y * scaleFactor;

      // Check collision with avoidable areas
      const collidedArea = this.getCollidedAvoidableArea(particle, prevX, prevY);
      if (collidedArea) {
        const { area, side, collisionPoint } = collidedArea;

        // Reverse the relevant velocity component based on collision side
        if (side === 'left' || side === 'right') {
          particle.velocity.x = -particle.velocity.x * dampingFactor;
        }
        if (side === 'top' || side === 'bottom') {
          particle.velocity.y = -particle.velocity.y * dampingFactor;
        }

        // Reposition particle just outside the collided area to prevent sticking
        switch (side) {
          case 'left':
            particle.x = area.x - particle.radius;
            break;
          case 'right':
            particle.x = area.x + area.width + particle.radius;
            break;
          case 'top':
            particle.y = area.y - particle.radius;
            break;
          case 'bottom':
            particle.y = area.y + area.height + particle.radius;
            break;
        }

        // Trigger collision-triggered lightning if enabled
        if (this.config.enableLightningOnCollision) {
          const currentTime = performance.now();

          // Clean up old lightning positions beyond the min distance
          this.collisionLightningPositions = this.collisionLightningPositions.filter(
            (pos) => currentTime - pos.time < this.config.collisionLightningDelay
          );

          // Check if enough time has passed since the last collision-triggered lightning
          const timeSinceLastLightning =
            currentTime - this.lastCollisionLightningTime;

          // Check distance from recent lightnings
          const isFarEnough = this.collisionLightningPositions.every(
            (pos) =>
              Math.hypot(collisionPoint.x - pos.x, collisionPoint.y - pos.y) >=
              this.config.collisionLightningMinDistance
          );

          if (
            timeSinceLastLightning >= this.config.collisionLightningDelay &&
            isFarEnough
          ) {
            // Create lightning at collision point with intensity and splitting
            this.createLightning(
              collisionPoint.x,
              collisionPoint.y,
              this.config.collisionLightningLifetime,
              this.config.collisionLightningColor,
              this.config.collisionLightningGlowColor,
              this.config.collisionLightningOpacity,
              this.config.collisionLightningThickness,
              this.config.collisionLightningIntensity, // Pass intensity
              'collision' // Specify type for collision lightning
            );

            // Update tracking variables
            this.lastCollisionLightningTime = currentTime;
            this.collisionLightningPositions.push({
              x: collisionPoint.x,
              y: collisionPoint.y,
              time: currentTime,
            });
          }
        }
      }

      // Boundary checks for canvas edges with borderOffset
      // Only apply borderOffset here to maintain a buffer from the edges
      if (particle.x - particle.radius < borderOffset) {
        particle.velocity.x = -particle.velocity.x * dampingFactor;
        particle.x = borderOffset + particle.radius;

        // Optionally, trigger lightning on collision with canvas boundary
        if (this.config.enableLightningOnCollision) {
          const collisionPoint = { x: borderOffset, y: particle.y };
          this.triggerCollisionLightning(collisionPoint);
        }
      } else if (particle.x + particle.radius > this.canvas.width - borderOffset) {
        particle.velocity.x = -particle.velocity.x * dampingFactor;
        particle.x = this.canvas.width - borderOffset - particle.radius;

        // Optionally, trigger lightning on collision with canvas boundary
        if (this.config.enableLightningOnCollision) {
          const collisionPoint = { x: this.canvas.width - borderOffset, y: particle.y };
          this.triggerCollisionLightning(collisionPoint);
        }
      }

      if (particle.y - particle.radius < borderOffset) {
        particle.velocity.y = -particle.velocity.y * dampingFactor;
        particle.y = borderOffset + particle.radius;

        // Optionally, trigger lightning on collision with canvas boundary
        if (this.config.enableLightningOnCollision) {
          const collisionPoint = { x: particle.x, y: borderOffset };
          this.triggerCollisionLightning(collisionPoint);
        }
      } else if (particle.y + particle.radius > this.canvas.height - borderOffset) {
        particle.velocity.y = -particle.velocity.y * dampingFactor;
        particle.y = this.canvas.height - borderOffset - particle.radius;

        // Optionally, trigger lightning on collision with canvas boundary
        if (this.config.enableLightningOnCollision) {
          const collisionPoint = { x: particle.x, y: this.canvas.height - borderOffset };
          this.triggerCollisionLightning(collisionPoint);
        }
      }

      // Normalize the velocity to maintain constant speed
      const speed = Math.sqrt(particle.velocity.x ** 2 + particle.velocity.y ** 2);
      if (speed > 0.01) { // Use a small threshold instead of strict inequality
        particle.velocity.x = (particle.velocity.x / speed) * this.config.particleSpeed;
        particle.velocity.y = (particle.velocity.y / speed) * this.config.particleSpeed;
      } else {
        // Assign a random direction if speed is too low
        const angle = Math.random() * Math.PI * 2;
        particle.velocity.x = Math.cos(angle) * this.config.particleSpeed;
        particle.velocity.y = Math.sin(angle) * this.config.particleSpeed;
      }

    });
  }

  /**
   * Draws particles on the canvas.
   */
  drawParticles() {
    try {
      this.ctx.globalCompositeOperation = this.config.particleBlendMode;
      this.ctx.globalAlpha = this.config.particleOpacity;
      this.ctx.fillStyle = this.config.particleColor;

      this.particles.forEach((particle) => {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // Reset context settings
      this.ctx.globalAlpha = 1;
      this.ctx.globalCompositeOperation = 'source-over';
    } catch (error) {
      console.error('Error in drawParticles:', error);
    }
  }

  /**
   * Connects particles with lines if they are within a certain distance.
   */
  connectParticles() {
    try {
      this.ctx.globalAlpha = this.config.lineOpacity;
      this.ctx.strokeStyle = this.config.lineColor;
      this.ctx.lineWidth = this.config.lineThickness;

      const maxDistanceSquared = this.config.maxDistance ** 2;

      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distanceSquared = dx * dx + dy * dy;

          if (distanceSquared < maxDistanceSquared) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }

      // Reset context settings
      this.ctx.globalAlpha = 1;
    } catch (error) {
      console.error('Error in connectParticles:', error);
    }
  }

  /**
   * Finds the closest particle to the given coordinates.
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {object|null} Closest particle or null
   */
  findClosestParticle(x, y) {
    let closestDistSquared = Infinity;
    let closestParticle = null;

    for (const particle of this.particles) {
      const dx = particle.x - x;
      const dy = particle.y - y;
      const distSquared = dx * dx + dy * dy;

      if (distSquared < closestDistSquared) {
        closestDistSquared = distSquared;
        closestParticle = particle;
      }
    }

    return closestParticle;
  }

  /**
   * Creates a lightning bolt starting from a given point.
   * @param {number|null} startX - Starting X coordinate
   * @param {number|null} startY - Starting Y coordinate
   * @param {number|null} lifetime - Lifetime of the lightning bolt
   * @param {string|null} color - Color of the lightning
   * @param {string|null} glowColor - Glow color of the lightning
   * @param {number|null} opacity - Opacity of the lightning
   * @param {number|null} thickness - Thickness of the lightning
   * @param {number|null} intensity - Intensity of the lightning's glow
   * @param {string} type - Type of lightning ('general' or 'collision')
   */
  createLightning(startX = null, startY = null, lifetime = null, color = null, glowColor = null, opacity = null, thickness = null, intensity = null, type = 'general') {
    const MAX_DEPTH = 3; // Define a maximum recursion depth

    if (type === 'collision' && this.config.collisionEnableSplits === false) return;
    if (type === 'general' && this.config.enableSplits === false) return;
    if (type === 'collision' && this.collisionLightningPositions.length >= this.config.collisionMaxSplits) return;
    if (type === 'general' && this.lightning.length >= this.config.maxSplits) return;

    try {
      if (this.particles.length === 0 && (startX === null || startY === null)) return;

      // Determine starting point
      let x =
        startX !== null
          ? startX
          : this.particles[Math.floor(Math.random() * this.particles.length)].x;
      let y =
        startY !== null
          ? startY
          : this.particles[Math.floor(Math.random() * this.particles.length)].y;
      const points = [{ x, y }];

      // Determine initial angle and number of segments
      let angle = this.config.globalLightningDirection
        ? this.config.lightningAngle
        : Math.random() * Math.PI * 2;
      const segments =
        lifetime !== null
          ? lifetime
          : Math.floor(
            Math.random() *
            (this.config.maxLightningSegments - this.config.minLightningSegments + 1)
          ) + this.config.minLightningSegments;

      // Determine split configuration based on type
      const enableSplits = type === 'collision' ? this.config.collisionEnableSplits : this.config.enableSplits;
      const splitProbability = type === 'collision' ? this.config.collisionSplitProbability : this.config.splitProbability;
      const minSplitSegments = type === 'collision' ? this.config.collisionMinSplitSegments : this.config.minSplitSegments;
      const maxSplits = type === 'collision' ? this.config.collisionMaxSplits : this.config.maxSplits;

      // Generate lightning segments
      for (let i = 0; i < segments; i++) {
        const length = Math.random() * 30 + 20;
        let newX = x + Math.cos(angle) * length;
        let newY = y + Math.sin(angle) * length;

        // Adjust segment to pass through the closest particle
        if (this.config.lightningThroughParticles) {
          const closestParticle = this.findClosestParticle(newX, newY);
          if (closestParticle) {
            newX = closestParticle.x;
            newY = closestParticle.y;
          }
        }

        points.push({ x: newX, y: newY });

        // Create split lightning if conditions are met
        if (
          enableSplits &&
          Math.random() < splitProbability &&
          lifetime === null
        ) {
          const splitSegments =
            Math.floor(Math.random() * (segments - i - this.config.minSplitSegments)) +
            minSplitSegments;
          this.createLightning(newX, newY, splitSegments, null, null, null, null, null, type);
        }

        // Adjust angle for next segment
        if (!this.config.globalLightningDirection) {
          angle += ((Math.random() - 0.5) * Math.PI) / 4;
        }

        x = newX;
        y = newY;

        // Break if segment goes outside canvas
        if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) break;
      }

      // Determine lifetime of the lightning bolt
      const boltLifetime =
        lifetime !== null
          ? lifetime
          : Math.floor(
            Math.random() *
            (this.config.maxLightningLifetime - this.config.minLightningLifetime + 1)
          ) + this.config.minLightningLifetime;

      // Determine color and glow color
      const boltColor = color !== null ? color : this.config.lightningColor;
      const boltGlowColor = glowColor !== null ? glowColor : this.config.lightningGlowColor;
      const boltOpacity = opacity !== null ? opacity : this.config.lightningOpacity;
      const boltThickness = thickness !== null ? thickness : this.config.lightningThickness;
      const boltIntensity = intensity !== null ? intensity : this.config.lightningGlow;

      // Add lightning bolt to array
      this.lightning.push({
        points,
        color: boltColor,
        glowColor: boltGlowColor,
        alpha: boltOpacity,
        lifetime: boltLifetime,
        currentLifetime: 0,
        thickness: boltThickness,
        intensity: boltIntensity, // Add intensity property
      });
    } catch (error) {
      console.error('Error in createLightning:', error);
    }
  }

  /**
   * Draws lightning bolts on the canvas.
   */
  drawLightning() {
    this.ctx.globalCompositeOperation = this.config.lightningBlendMode;

    for (let i = this.lightning.length - 1; i >= 0; i--) {
      const bolt = this.lightning[i];
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(bolt.points[0].x, bolt.points[0].y);

      let segmentCount;
      if (this.config.instantLightning) {
        segmentCount = bolt.points.length;
      } else {
        const progress = bolt.currentLifetime / bolt.lifetime;
        segmentCount = Math.floor(progress * bolt.points.length);
      }

      for (let j = 1; j < segmentCount; j++) {
        this.ctx.lineTo(bolt.points[j].x, bolt.points[j].y);
      }

      this.ctx.shadowColor = bolt.glowColor;
      this.ctx.shadowBlur = bolt.intensity;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;

      bolt.alpha = Math.max(bolt.alpha * (1 - bolt.currentLifetime / bolt.lifetime), 0);

      this.ctx.globalAlpha = bolt.alpha;
      this.ctx.strokeStyle = bolt.color;
      this.ctx.lineWidth = bolt.thickness;
      this.ctx.stroke();
      this.ctx.restore();

      bolt.currentLifetime++;

      if (bolt.currentLifetime >= bolt.lifetime || bolt.alpha <= 0) {
        this.lightning.splice(i, 1);
      }
    }

    // Reset context settings
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Draws the background of the canvas.
   */
  drawBackground() {
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * The main animation loop.
   * @param {DOMHighResTimeStamp} timestamp - The current time
   */
  animate(timestamp) {

    if (!this.isRunning) return;

    requestAnimationFrame(this.animate);

    if (this.isPaused) return;

    // Calculate deltaTime with a maximum cap (e.g., 100ms)
    this.deltaTime = Math.min(timestamp - this.lastTime, 100);

    // Update FPS counter
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsUpdate;

    if (elapsed >= 1000) {
      this.fps = (this.frameCount / elapsed) * 1000;
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      // Adjust particle count based on FPS
      if (
        this.fps < this.config.minFPS &&
        this.particles.length > this.config.minParticleCount
      ) {
        // Reduce particle count
        for (let i = 0; i < this.config.particleAdjustStep; i++) {
          if (this.particles.length > this.config.minParticleCount) {
            this.particles.pop();
          }
        }
      } else if (
        this.fps > this.config.maxFPS &&
        this.particles.length < this.config.maxParticleCount
      ) {
        // Increase particle count
        for (let i = 0; i < this.config.particleAdjustStep; i++) {
          if (this.particles.length < this.config.particleCount) {
            this.createParticle();
          }
        }
      }
    }

    // FPS limit
    if (timestamp - this.lastTime < this.fpsInterval) {
      return;
    }

    this.lastTime = timestamp;

    // Drawing operations
    this.drawBackground();

    // Create and draw lightning
    if (
      this.config.lightningOpacity > 0 &&
      Math.random() < this.config.lightningFrequency
    ) {
      this.createLightning();
    }
    this.drawLightning();

    // Update and draw particles
    if (this.particles.length < this.config.particleCount) this.createParticle();
    this.updateParticles();
    this.connectParticles();
    this.drawParticles();
  }

  /**
   * Updates the configuration and adjusts particles accordingly.
   * @param {object} newConfig - New configuration settings
   */
  updateConfig(newConfig) {
    // Destructure and exclude randomizeDirection from newConfig
    const { randomizeDirection, ...filteredConfig } = newConfig;

    Object.assign(this.config, filteredConfig);
    this.fpsInterval = 1000 / this.config.fpsLimit;
    this.lightning = [];

    // Adjust particle count based on new config
    while (this.particles.length > this.config.particleCount) {
      this.particles.pop();
    }
    while (this.particles.length < this.config.particleCount) {
      this.createParticle();
    }

    // Ensure particle count is within min and max limits
    if (this.particles.length < this.config.minParticleCount) {
      while (this.particles.length < this.config.minParticleCount) {
        this.createParticle();
      }
    } else if (this.particles.length > this.config.maxParticleCount) {
      while (this.particles.length > this.config.maxParticleCount) {
        this.particles.pop();
      }
    }
  }


  /**
   * Pauses the animation.
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resumes the animation.
   */
  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now();

    // Remove or make optional the position reset
    // Option 1: Remove the position reset
    /*
    this.particles.forEach(particle => {
      particle.x = Math.random() * this.canvas.width;
      particle.y = Math.random() * this.canvas.height;
    });
    */

    // Option 2: Make it conditional based on a configuration flag
    if (this.config.resetOnResume) {
      this.particles.forEach(particle => {
        particle.x = Math.random() * this.canvas.width;
        particle.y = Math.random() * this.canvas.height;
      });
    }
  }



  /**
   * Stops the animation and cleans up resources.
   */
  stop() {
    this.isRunning = false;
    this.removeEventListeners();
    this.particles = [];
    this.lightning = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Handles visibility change events.
   */
  handleVisibilityChange() {
    if (document.hidden && this.config.pauseOnBlur) {
      this.pause();
    } else if (!document.hidden && this.config.pauseOnBlur) {
      // Check if the window size has changed before calling resize
      const currentWidth = this.canvas.clientWidth;
      const currentHeight = this.canvas.clientHeight;
      if (this.canvas.width !== currentWidth || this.canvas.height !== currentHeight) {
        this.resize();
      }
      this.lastTime = performance.now(); // Reset lastTime to avoid large delta
      this.resume();
    }
  }


  /**
   * Handles window focus event.
   */
  handleFocus() {
    if (this.config.pauseOnBlur) {
      this.resume();
    }
  }

  /**
   * Handles window blur event.
   */
  handleBlur() {
    if (this.config.pauseOnBlur) {
      this.pause();
    }
  }

  /**
   * Handles the scroll event to pause/resume animation based on canvas visibility.
   */
  handleScroll() {
    const rect = this.canvas.getBoundingClientRect();
    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);

    const isInViewport = !(rect.bottom < 0 || rect.top - viewHeight >= 0);

    if (isInViewport && this.isScrollPaused) {
      this.resume();
      this.isScrollPaused = false;
      console.log('Resumed');
    } else if (!isInViewport && !this.isScrollPaused) {
      this.pause();
      this.isScrollPaused = true;
      console.log('Paused');
    }
  }

  // Check if a particle is inside an avoidable area
  isInsideAvoidableArea(particle) {
    return this.avoidableAreas.some(area =>
      particle.x > area.x &&
      particle.x < area.x + area.width &&
      particle.y > area.y &&
      particle.y < area.y + area.height
    );
  }

  // Function to update avoidable areas based on specific selector query
  updateAvoidableAreas(selector) {
    // Clear the existing avoidable areas
    this.avoidableAreas = [];

    // Query all elements based on the selector (e.g., '.btn' or 'a')
    const elements = document.querySelectorAll(selector);

    // Add each element's position and dimensions to the avoidable areas array
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      // Convert the bounding rectangle coordinates to canvas space
      const canvasRect = this.canvas.getBoundingClientRect();

      this.avoidableAreas.push({
        x: rect.left - canvasRect.left,
        y: rect.top - canvasRect.top,
        width: rect.width,
        height: rect.height,
      });
    });
  }


  /**
   * Determines if a particle has collided with any avoidable area and identifies the collision side.
   * @param {object} particle - The particle object
   * @param {number} prevX - Previous X position of the particle
   * @param {number} prevY - Previous Y position of the particle
   * @returns {object|null} - Returns the collided area, side, and collision point or null if no collision
   */
  getCollidedAvoidableArea(particle, prevX, prevY) {
    for (const area of this.avoidableAreas) {
      // Check if particle is overlapping with the area (considering particle radius)
      const isOverlapping =
        particle.x + particle.radius > area.x &&
        particle.x - particle.radius < area.x + area.width &&
        particle.y + particle.radius > area.y &&
        particle.y - particle.radius < area.y + area.height;

      if (isOverlapping) {
        // Determine the side of collision by comparing distances
        const fromLeft = Math.abs(particle.x - area.x);
        const fromRight = Math.abs(particle.x - (area.x + area.width));
        const fromTop = Math.abs(particle.y - area.y);
        const fromBottom = Math.abs(particle.y - (area.y + area.height));

        const minDist = Math.min(fromLeft, fromRight, fromTop, fromBottom);
        let side = null;

        if (minDist === fromLeft) {
          side = 'left';
        } else if (minDist === fromRight) {
          side = 'right';
        } else if (minDist === fromTop) {
          side = 'top';
        } else if (minDist === fromBottom) {
          side = 'bottom';
        }

        // Determine collision point based on side
        let collisionPoint = { x: particle.x, y: particle.y };
        switch (side) {
          case 'left':
            collisionPoint.x = area.x;
            collisionPoint.y = particle.y;
            break;
          case 'right':
            collisionPoint.x = area.x + area.width;
            collisionPoint.y = particle.y;
            break;
          case 'top':
            collisionPoint.x = particle.x;
            collisionPoint.y = area.y;
            break;
          case 'bottom':
            collisionPoint.x = particle.x;
            collisionPoint.y = area.y + area.height;
            break;
        }

        return { area, side, collisionPoint };
      }
    }
    return null;
  }



  /**
   * Triggers a collision-triggered lightning at the specified point if delay and distance conditions are met.
   * @param {object} collisionPoint - The {x, y} coordinates of the collision.
   */
  triggerCollisionLightning(collisionPoint) {
    if (!this.config.enableLightningOnCollision) return;

    const currentTime = performance.now();

    // Clean up old lightning positions beyond the min distance and delay
    this.collisionLightningPositions = this.collisionLightningPositions.filter(
      (pos) => currentTime - pos.time < this.config.collisionLightningDelay
    );

    // Check time since last lightning
    const timeSinceLastLightning =
      currentTime - this.lastCollisionLightningTime;

    // Check distance from recent lightnings
    const isFarEnough = this.collisionLightningPositions.every(
      (pos) =>
        Math.hypot(collisionPoint.x - pos.x, collisionPoint.y - pos.y) >=
        this.config.collisionLightningMinDistance
    );

    if (
      timeSinceLastLightning >= this.config.collisionLightningDelay &&
      isFarEnough
    ) {
      // Create lightning at collision point with intensity and splitting
      this.createLightning(
        collisionPoint.x,
        collisionPoint.y,
        this.config.collisionLightningLifetime,
        this.config.collisionLightningColor,
        this.config.collisionLightningGlowColor,
        this.config.collisionLightningOpacity,
        this.config.collisionLightningThickness,
        this.config.collisionLightningIntensity, // Pass intensity
        'collision' // Specify type for collision lightning
      );

      // Update tracking variables
      this.lastCollisionLightningTime = currentTime;
      this.collisionLightningPositions.push({
        x: collisionPoint.x,
        y: collisionPoint.y,
        time: currentTime,
      });
    }
  }

}
