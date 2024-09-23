class LightningParticle {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.config = {
      particleColor: config.pparticleColor ?? "#4a4a4a", // Color of the particles
      particleOpacity: config.particleOpacity ?? 0.8, // Opacity of the particles
      particleCount: config.particleCount ?? 350, // Number of particles
      particleMinSize: config.particleMinSize ?? 0.5, // Minimum size of particles
      particleMaxSize: config.particleMaxSize ?? 2, // Maximum size of particles
      particleSpeed: config.particleSpeed ?? 1, // Speed of particle movement
      lineColor: config.lineColor ?? "#ffffff", // Color of the lines connecting particles
      lineOpacity: config.lineOpacity ?? 0.6, // Opacity of the lines connecting particles
      lineThickness: config.lineThickness ?? 0.5, // Thickness of the lines connecting particles
      maxDistance: config.maxDistance ?? 50, // Maximum distance between particles to draw a line
      lightningColor: config.lightningColor ?? "#00ffff", // Color of the lightning
      lightningGlowColor: config.lightningGlowColor ?? "#00ffff", // Glow color of the lightning
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
      instantLightning: config.instantLightning ?? false, // Whether lightning is drawn instantly or with lifetime by steps
      minActiveLightning: config.minActiveLightning ?? 1, // Minimum number of active lightning bolts
      maxActiveLightning: config.maxActiveLightning ?? 5, // Maximum number of active lightning bolts
      backgroundColor: config.backgroundColor ?? "rgba(0, 0, 0, 0.75)", // Background color of the canvas
      particleBlendMode: config.particleBlendMode ?? "screen", // Blend mode for particles
      lightningBlendMode: config.lightningBlendMode ?? "screen", // Blend mode for lightning
      fpsLimit: config.fpsLimit ?? 60, // Frame rate limit for the animation
      pauseOnBlur: config.pauseOnBlur ?? true, // Pause animation when page is not in focus
    };
    this.particles = [];
    this.lightning = [];
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fpsInterval = 1000 / this.config.fpsLimit;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    this.resize();
    window.addEventListener("resize", this.resize);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("focus", this.handleFocus);
    window.addEventListener("blur", this.handleBlur);

    this.isRunning = true;

    requestAnimationFrame(this.animate);
  }

  resize() {
    // Adjust the canvas size to match its offset dimensions
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    // Adjust particle positions if they are outside the new canvas boundaries
    this.particles.forEach(particle => {
      if (particle.x > this.canvas.width) particle.x = this.canvas.width;
      if (particle.y > this.canvas.height) particle.y = this.canvas.height;
    });

    // Ensure the correct number of particles after resizing
    while (this.particles.length < this.config.particleCount) {
      this.createParticle();
    }
  }

  createLightning(startX = null, startY = null, remainingSegments = null) {
    // Return if there are no particles to start the lightning from
    if (this.particles.length === 0) return;

    // Determine the starting point of the lightning
    let x = startX !== null ? startX : this.particles[Math.floor(Math.random() * this.particles.length)].x;
    let y = startY !== null ? startY : this.particles[Math.floor(Math.random() * this.particles.length)].y;
    let points = [{ x, y }];

    // Determine the initial angle and number of segments for the lightning
    let angle = this.config.globalLightningDirection ? this.config.lightningAngle : Math.random() * Math.PI * 2;
    let segments = remainingSegments !== null
      ? remainingSegments
      : Math.floor(Math.random() * (this.config.maxLightningSegments - this.config.minLightningSegments + 1)) + this.config.minLightningSegments;

    // Generate the lightning segments
    for (let i = 0; i < segments; i++) {
      let length = Math.random() * 30 + 20;
      let newX = x + Math.cos(angle) * length;
      let newY = y + Math.sin(angle) * length;

      // Adjust the segment to pass through the closest particle if enabled
      if (this.config.lightningThroughParticles) {
        let closestParticle = this.findClosestParticle(newX, newY);
        if (closestParticle) {
          newX = closestParticle.x;
          newY = closestParticle.y;
        }
      }

      points.push({ x: newX, y: newY });

      // Create split lightning if enabled and conditions are met
      if (this.config.enableSplits && Math.random() < this.config.splitProbability && remainingSegments === null) {
        let splitSegments = Math.floor(Math.random() * (segments - i - this.config.minSplitSegments)) + this.config.minSplitSegments;
        this.createLightning(newX, newY, splitSegments);
      }

      // Adjust the angle for the next segment if not using a global direction
      if (!this.config.globalLightningDirection) {
        angle += ((Math.random() - 0.5) * Math.PI) / 4;
      }

      x = newX;
      y = newY;

      // Break if the segment goes outside the canvas boundaries
      if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) break;
    }

    // Determine the lifetime of the lightning bolt
    const lifetime = Math.floor(Math.random() * (this.config.maxLightningLifetime - this.config.minLightningLifetime + 1)) + this.config.minLightningLifetime;

    // Add the lightning bolt to the array
    this.lightning.push({
      points,
      alpha: this.config.lightningOpacity,
      maxAlpha: Math.random() * 0.5 + 0.5,
      lifetime,
      currentLifetime: 0,
    });
  }

  findClosestParticle(x, y) {
    // Initialize the closest distance to a large number
    let closestDist = Infinity;
    // Initialize the closest particle to null
    let closestParticle = null;

    // Iterate through all particles to find the closest one
    for (let particle of this.particles) {
      // Calculate the distance between the given point and the current particle
      let dist = Math.hypot(particle.x - x, particle.y - y);
      // Update the closest particle if the current one is closer
      if (dist < closestDist) {
        closestDist = dist;
        closestParticle = particle;
      }
    }

    // Return the closest particle found
    return closestParticle;
  }

  drawLightning() {
    // Set the composite operation for lightning drawing
    this.ctx.globalCompositeOperation = this.config.lightningBlendMode;
    // Set the stroke style and line properties for lightning
    this.ctx.strokeStyle = this.config.lightningColor;
    this.ctx.lineWidth = this.config.lightningThickness;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    // Iterate through each lightning bolt
    this.lightning.forEach((bolt, index) => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(bolt.points[0].x, bolt.points[0].y);

      // Determine the number of segments to draw based on the lightning configuration
      let segmentCount;
      if (this.config.instantLightning) {
        segmentCount = bolt.points.length;
      } else {
        const progress = bolt.currentLifetime / bolt.lifetime;
        segmentCount = Math.floor(progress * bolt.points.length);
      }

      // Draw the lightning segments
      for (let i = 1; i < segmentCount; i++) {
        this.ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      }

      // Set the shadow properties for the lightning glow
      this.ctx.shadowColor = this.config.lightningGlowColor;
      this.ctx.shadowBlur = this.config.lightningGlow;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;

      // Set the global alpha for the lightning opacity
      this.ctx.globalAlpha = bolt.alpha;
      this.ctx.stroke();
      this.ctx.restore();

      // Update the lifetime of the lightning bolt
      bolt.currentLifetime++;
      // Remove the lightning bolt if its lifetime is over
      if (bolt.currentLifetime >= bolt.lifetime) {
        this.lightning.splice(index, 1);
      }
    });

    // Reset the global alpha and composite operation
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = "source-over";
  }

  createParticle() {
    // Create a new particle with random properties
    this.particles.push({
      x: Math.random() * this.canvas.width, // Random x position within the canvas
      y: Math.random() * this.canvas.height, // Random y position within the canvas
      radius: Math.random() * (this.config.particleMaxSize - this.config.particleMinSize) + this.config.particleMinSize, // Random radius within the specified range
      color: this.config.particleColor, // Particle color from the configuration
      velocity: {
        x: (Math.random() - 0.5) * this.config.particleSpeed * 2, // Random x velocity within the specified speed range
        y: (Math.random() - 0.5) * this.config.particleSpeed * 2, // Random y velocity within the specified speed range
      },
    });
  }

  updateParticles() {
    // Calculate the scale factor to ensure consistent particle speed across different frame rates
    const scaleFactor = this.deltaTime / (1000 / 60);

    // Update the position of each particle based on its velocity and the scale factor
    this.particles.forEach((particle) => {
      particle.x += particle.velocity.x * scaleFactor;
      particle.y += particle.velocity.y * scaleFactor;

      // Reverse the velocity if the particle hits the canvas boundaries
      if (particle.x < 0 || particle.x > this.canvas.width) particle.velocity.x *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.velocity.y *= -1;
    });
  }

  drawParticles() {
    // Set the blend mode for drawing particles
    this.ctx.globalCompositeOperation = this.config.particleBlendMode;
    // Set the fill style for particles with the specified color and opacity
    this.ctx.fillStyle = `${this.config.particleColor}${Math.floor(this.config.particleOpacity * 255).toString(16).padStart(2, "0")}`;

    // Draw each particle as a filled circle
    this.particles.forEach((particle) => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Reset the blend mode to the default
    this.ctx.globalCompositeOperation = "source-over";
  }

  connectParticles() {
    // Set the stroke style for connecting lines with the specified color and opacity
    this.ctx.strokeStyle = `${this.config.lineColor}${Math.floor(this.config.lineOpacity * 255).toString(16).padStart(2, "0")}`;
    // Set the line width for connecting lines
    this.ctx.lineWidth = this.config.lineThickness;

    // Iterate through each pair of particles to draw connecting lines
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Draw a line if the distance between particles is less than the maximum distance
        if (distance < this.config.maxDistance) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  drawBackground() {
    // Set the fill style for the background
    this.ctx.fillStyle = this.config.backgroundColor;
    // Fill the entire canvas with the background color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate(timestamp) {
    // Stop the animation if the isRunning flag is false
    if (!this.isRunning) return;

    // Request the next animation frame
    requestAnimationFrame(this.animate);

    // Skip the frame if the animation is paused
    if (this.isPaused) return;

    // Skip the frame if the time since the last frame is less than the FPS interval
    if (timestamp - this.lastTime < this.fpsInterval) {
      return;
    }

    // Calculate the time difference since the last frame
    this.deltaTime = timestamp - this.lastTime;
    // Update the last frame time
    this.lastTime = timestamp;

    // Draw the background
    this.drawBackground();

    // Create lightning if the conditions are met
    if (this.config.lightningOpacity > 0 && Math.random() < this.config.lightningFrequency) {
      this.createLightning();
    }
    // Draw the lightning
    this.drawLightning();

    // Create new particles if the current count is less than the specified count
    if (this.particles.length < this.config.particleCount) this.createParticle();
    // Update the particles' positions
    this.updateParticles();
    // Draw lines connecting the particles
    this.connectParticles();
    // Draw the particles
    this.drawParticles();
  }

  updateConfig(newConfig) {
    // Merge the new configuration with the existing configuration
    Object.assign(this.config, newConfig);
    // Update the FPS interval based on the new FPS limit
    this.fpsInterval = 1000 / this.config.fpsLimit;
    // Clear the existing lightning bolts
    this.lightning = [];

    // Adjust the particle count to match the new configuration
    while (this.particles.length > this.config.particleCount) {
      this.particles.pop(); // Remove excess particles
    }
    while (this.particles.length < this.config.particleCount) {
      this.createParticle(); // Add new particles if needed
    }
  }

  destroy() {
    // Stop the animation loop
    this.isRunning = false;
    // Remove event listeners to clean up
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("focus", this.handleFocus);
    window.removeEventListener("blur", this.handleBlur);
  }

  handleVisibilityChange() {
    // Pause the animation if the document is hidden
    if (document.hidden) {
      this.pause();
    } else {
      // Resume the animation if the document is visible
      this.resume();
    }
  }

  handleFocus() {
    // Resume the animation if the focus is regained and pauseOnBlur is enabled
    if (this.config.pauseOnBlur) {
      this.resume();
    }
  }

  handleBlur() {
    // Pause the animation if the focus is lost and pauseOnBlur is enabled
    if (this.config.pauseOnBlur) {
      this.pause();
    }
  }

  pause() {
    // Set the paused flag to true
    this.isPaused = true;
  }

  resume() {
    // Set the paused flag to false
    this.isPaused = false;
    // Reset the last frame time to the current time
    this.lastTime = performance.now();
    // Request the next animation frame to resume the animation loop
    requestAnimationFrame(this.animate);
  }
}