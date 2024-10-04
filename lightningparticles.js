class LightningParticle {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Configuration settings for the LightningParticle class
    this.config = {
      particleColor: config.particleColor ?? '#4a4a4a', // Color of the particles
      particleOpacity: config.particleOpacity ?? 0.8, // Opacity of the particles
      particleMinSize: config.particleMinSize ?? 0.5, // Minimum size of particles
      particleMaxSize: config.particleMaxSize ?? 2, // Maximum size of particles
      particleSpeed: config.particleSpeed ?? 1, // Speed of particle movement
      lineColor: config.lineColor ?? '#ffffff', // Color of the lines connecting particles
      lineOpacity: config.lineOpacity ?? 0.6, // Opacity of the lines connecting particles
      lineThickness: config.lineThickness ?? 0.5, // Thickness of the lines connecting particles
      maxDistance: config.maxDistance ?? 50, // Maximum distance between particles to draw a line
      lightningColor: config.lightningColor ?? '#00ffff', // Color of the lightning
      lightningGlowColor: config.lightningGlowColor ?? '#00ffff', // Glow color of the lightning
      lightningOpacity: config.lightningOpacity ?? 0.8, // Opacity of the lightning
      lightningThickness: config.lightningThickness ?? 2, // Thickness of the lightning
      lightningFrequency: config.lightningFrequency ?? 0.03, // Frequency of lightning creation
      lightningGlow: config.lightningGlow ?? 100, // Glow intensity of the lightning
      globalLightningDirection: config.globalLightningDirection ?? false, // Whether lightning follows a global direction
      lightningAngle: config.lightningAngle ?? Math.PI / 2, // Angle of the lightning if global direction is enabled
      lightningThroughParticles: config.lightningThroughParticles ?? true, // Whether lightning can pass through particles
      minLightningSegments: config.minLightningSegments ?? 3, // Minimum number of segments in a lightning bolt
      maxLightningSegments: config.maxLightningSegments ?? 20, // Maximum number of segments in a lightning bolt
      enableSplits: config.enableSplits ?? true, // Whether lightning can split into multiple bolts
      minSplitSegments: config.minSplitSegments ?? 3, // Minimum number of segments in a split lightning bolt
      maxSplits: config.maxSplits ?? 3, // Maximum number of splits in a lightning bolt
      splitProbability: config.splitProbability ?? 0.3, // Probability of a lightning bolt splitting
      minLightningLifetime: config.minLightningLifetime ?? 30, // Minimum lifetime of a lightning bolt
      maxLightningLifetime: config.maxLightningLifetime ?? 60, // Maximum lifetime of a lightning bolt
      instantLightning: config.instantLightning ?? false, // Whether lightning is drawn instantly or over time
      backgroundColor: config.backgroundColor ?? 'rgba(0, 0, 0, 0.75)', // Background color of the canvas
      particleBlendMode: config.particleBlendMode ?? 'source-over', // Blend mode for particles
      lightningBlendMode: config.lightningBlendMode ?? 'source-over', // Blend mode for lightning
      fpsLimit: config.fpsLimit ?? 60, // Frame rate limit for the animation
      pauseOnBlur: config.pauseOnBlur ?? true, // Pause animation when page is not in focus
      referenceResolution: config.referenceResolution ?? { width: 1920, height: 1080 }, // Reference resolution for scaling
      referenceParticleCount: config.referenceParticleCount ?? 350, // Reference particle count for scaling
      minParticleCount: config.minParticleCount ?? 25, // Minimum particle count for scaling
      maxParticleCount: config.maxParticleCount ?? 1500, // Maximum particle count for scaling
      minFPS: config.minFPS ?? 5, // FPS threshold below which particles are reduced
      maxFPS: config.maxFPS ?? 144, // FPS threshold above which particles can be increased
      particleAdjustStep: config.particleAdjustStep ?? 15, // Particle count adjustment step
      pauseOnScroll: config.pauseOnScroll ?? false, // New option to enable/disable pause on scroll
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
    this.handleScroll = this.handleScroll.bind(this); // Bind handleScroll method

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
    this.particles.push({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      radius:
        Math.random() * (this.config.particleMaxSize - this.config.particleMinSize) +
        this.config.particleMinSize,
      color: this.config.particleColor,
      velocity: {
        x: (Math.random() - 0.5) * this.config.particleSpeed * 2,
        y: (Math.random() - 0.5) * this.config.particleSpeed * 2,
      },
    });
  }

  /**
   * Updates particle positions and handles edge collisions.
   */
  updateParticles() {
    const scaleFactor = this.deltaTime / (1000 / 60);

    this.particles.forEach((particle) => {
      particle.x += particle.velocity.x * scaleFactor;
      particle.y += particle.velocity.y * scaleFactor;

      // Reverse velocity and correct position if particle hits canvas edge
      if (particle.x < 0) {
        particle.x = 0;
        particle.velocity.x *= -1;
      }
      if (particle.x > this.canvas.width) {
        particle.x = this.canvas.width;
        particle.velocity.x *= -1;
      }
      if (particle.y < 0) {
        particle.y = 0;
        particle.velocity.y *= -1;
      }
      if (particle.y > this.canvas.height) {
        particle.y = this.canvas.height;
        particle.velocity.y *= -1;
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
   * @param {number|null} remainingSegments - Remaining segments for recursive calls
   */
  createLightning(startX = null, startY = null, remainingSegments = null) {
    try {
      if (this.particles.length === 0) return;

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
        remainingSegments !== null
          ? remainingSegments
          : Math.floor(
            Math.random() *
            (this.config.maxLightningSegments - this.config.minLightningSegments + 1)
          ) + this.config.minLightningSegments;

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
          this.config.enableSplits &&
          Math.random() < this.config.splitProbability &&
          remainingSegments === null
        ) {
          const splitSegments =
            Math.floor(Math.random() * (segments - i - this.config.minSplitSegments)) +
            this.config.minSplitSegments;
          this.createLightning(newX, newY, splitSegments);
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
      const lifetime =
        Math.floor(
          Math.random() *
          (this.config.maxLightningLifetime - this.config.minLightningLifetime + 1)
        ) + this.config.minLightningLifetime;

      // Add lightning bolt to array
      this.lightning.push({
        points,
        alpha: this.config.lightningOpacity,
        lifetime,
        currentLifetime: 0,
      });
    } catch (error) {
      console.error('Error in createLightning:', error);
    }
  }

  /**
   * Draws lightning bolts on the canvas.
   */
  drawLightning() {
    try {
      this.ctx.globalCompositeOperation = this.config.lightningBlendMode;
      this.ctx.strokeStyle = this.config.lightningColor;
      this.ctx.lineWidth = this.config.lightningThickness;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.lightning.forEach((bolt, index) => {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(bolt.points[0].x, bolt.points[0].y);

        // Determine number of segments to draw
        let segmentCount;
        if (this.config.instantLightning) {
          segmentCount = bolt.points.length;
        } else {
          const progress = bolt.currentLifetime / bolt.lifetime;
          segmentCount = Math.floor(progress * bolt.points.length);
        }

        // Draw lightning segments
        for (let i = 1; i < segmentCount; i++) {
          this.ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
        }

        // Set lightning glow
        this.ctx.shadowColor = this.config.lightningGlowColor;
        this.ctx.shadowBlur = this.config.lightningGlow;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Reduce alpha over time
        bolt.alpha =
          this.config.lightningOpacity * (1 - bolt.currentLifetime / bolt.lifetime);

        // Set global alpha and draw
        this.ctx.globalAlpha = bolt.alpha;
        this.ctx.stroke();
        this.ctx.restore();

        // Update lifetime and remove if expired
        bolt.currentLifetime++;
        if (bolt.currentLifetime >= bolt.lifetime) {
          this.lightning.splice(index, 1);
        }
      });

      // Reset context settings
      this.ctx.globalAlpha = 1;
      this.ctx.globalCompositeOperation = 'source-over';
    } catch (error) {
      console.error('Error in drawLightning:', error);
    }
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
    try {
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
    } catch (error) {
      console.error('Error in animate:', error);
    }
  }


  /**
   * Updates the configuration and adjusts particles accordingly.
   * @param {object} newConfig - New configuration settings
   */
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
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

    // Optionally reset particle positions
    this.particles.forEach(particle => {
      particle.x = Math.random() * this.canvas.width;
      particle.y = Math.random() * this.canvas.height;
    });
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
}
