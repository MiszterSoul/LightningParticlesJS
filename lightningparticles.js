/**
 * LightningParticles.js v2.0.0
 * A high-performance particle system with lightning effects
 *
 * @author MiszterSoul
 * @license MIT
 * @see https://github.com/MiszterSoul/LightningParticlesJS
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.LightningParticle = factory());
})(this, (function () {
  'use strict';

  /**
   * @class LightningParticle
   * @description High-performance particle system with lightning effects for HTML5 Canvas
   */
  class LightningParticle {
    static VERSION = '2.0.0';

    // Default configuration with type annotations for clarity
    static DEFAULTS = Object.freeze({
      // Particle settings
      particleCount: 350,
      particleColor: '#4a4a4a',
      particleOpacity: 0.8,
      particleMinSize: 0.5,
      particleMaxSize: 2,
      particleSpeed: 1,
      particleBlendMode: 'source-over',
      minParticleCount: 25,
      maxParticleCount: 1500,
      particleAdjustStep: 15,

      // Line settings
      lineColor: '#ffffff',
      lineOpacity: 0.6,
      lineThickness: 0.5,
      maxDistance: 50,

      // Lightning settings
      lightningColor: '#00ffff',
      lightningGlowColor: '#00ffff',
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
      lightningBlendMode: 'source-over',

      // Collision-triggered lightning settings
      enableLightningOnCollision: false,
      collisionLightningColor: '#ff0000',
      collisionLightningGlowColor: '#ff0000',
      collisionLightningOpacity: 0.9,
      collisionLightningThickness: 3,
      collisionLightningLifetime: 50,
      collisionLightningDelay: 1000,
      collisionLightningMinDistance: 15,
      collisionLightningIntensity: 50,
      collisionEnableSplits: true,
      collisionSplitProbability: 0.3,
      collisionMinSplitSegments: 3,
      collisionMaxSplits: 3,

      // General settings
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      fpsLimit: 60,
      pauseOnBlur: true,
      referenceResolution: { width: 1920, height: 1080 },
      referenceParticleCount: 350,
      minFPS: 5,
      maxFPS: 144,
      pauseOnScroll: false,
      borderOffset: 5,
      resetOnResume: false,
    });

    /**
     * Creates a new LightningParticle instance
     * @param {HTMLCanvasElement} canvas - The canvas element to render on
     * @param {Object} config - Configuration options
     */
    constructor(canvas, config = {}) {
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new TypeError('LightningParticle: First argument must be an HTMLCanvasElement');
      }

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true // Hint for performance optimization
      });

      // Merge config with defaults using nullish coalescing
      this.config = { ...LightningParticle.DEFAULTS };
      this._applyConfig(config);

      // Initialize state
      this._initState();

      // Bind methods for event handlers (using arrow functions for cleaner binding)
      this._boundResize = this.resize.bind(this);
      this._boundAnimate = this._animate.bind(this);
      this._boundHandleVisibility = this._handleVisibilityChange.bind(this);
      this._boundHandleFocus = this._handleFocus.bind(this);
      this._boundHandleBlur = this._handleBlur.bind(this);

      // Set up event listeners
      this._setupEventListeners();

      // Initial setup
      this.resize();
      this._rafId = requestAnimationFrame(this._boundAnimate);
    }

    /**
     * Apply configuration, merging with defaults
     * @private
     */
    _applyConfig(config) {
      for (const key in config) {
        if (Object.prototype.hasOwnProperty.call(config, key) && config[key] !== undefined) {
          this.config[key] = config[key];
        }
      }
      // Set reference particle count if not explicitly provided
      if (config.referenceParticleCount === undefined) {
        this.config.referenceParticleCount = this.config.particleCount;
      }
    }

    /**
     * Initialize internal state
     * @private
     */
    _initState() {
      // Particle arrays
      this.particles = [];
      this.lightning = [];
      this._lightningPool = []; // Object pool for lightning reuse

      // Spatial hash grid for optimized particle connections
      this._spatialGrid = new Map();
      this._gridCellSize = this.config.maxDistance;

      // Timing
      this._lastTime = 0;
      this._deltaTime = 0;
      this._fpsInterval = 1000 / this.config.fpsLimit;
      this._targetFrameTime = 1000 / 60; // 60fps reference

      // FPS tracking
      this._fps = 0;
      this._frameCount = 0;
      this._lastFpsUpdate = 0;

      // State flags
      this._isRunning = true;
      this._isPaused = false;
      this._isScrollPaused = false;

      // Collision tracking
      this.avoidableAreas = [];
      this._lastCollisionLightningTime = 0;
      this._collisionLightningPositions = [];

      // Pre-calculate common values
      this._maxDistanceSquared = this.config.maxDistance ** 2;
      this._dampingFactor = 0.9;

      // Reusable objects to reduce GC pressure
      this._tempPoint = { x: 0, y: 0 };
    }

    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners() {
      window.addEventListener('resize', this._boundResize, { passive: true });
      document.addEventListener('visibilitychange', this._boundHandleVisibility);
      window.addEventListener('focus', this._boundHandleFocus);
      window.addEventListener('blur', this._boundHandleBlur);

      if (this.config.pauseOnScroll) {
        this._observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
              this._isScrollPaused = false;
              this.resume();
            } else {
              this._isScrollPaused = true;
              this.pause();
            }
          },
          { threshold: 0 }
        );
        this._observer.observe(this.canvas);
      }
    }

    /**
     * Remove event listeners and cleanup
     * @private
     */
    _removeEventListeners() {
      window.removeEventListener('resize', this._boundResize);
      document.removeEventListener('visibilitychange', this._boundHandleVisibility);
      window.removeEventListener('focus', this._boundHandleFocus);
      window.removeEventListener('blur', this._boundHandleBlur);

      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }

    /**
     * Resize handler - updates canvas and particle count
     */
    resize() {
      const { clientWidth, clientHeight } = this.canvas;

      if (clientWidth === 0 || clientHeight === 0) return;

      this.canvas.width = clientWidth;
      this.canvas.height = clientHeight;

      // Calculate particle density based on reference resolution
      const currentArea = clientWidth * clientHeight;
      const referenceArea = this.config.referenceResolution.width * this.config.referenceResolution.height;
      const particleDensity = this.config.referenceParticleCount / referenceArea;

      // Calculate target particle count
      let targetCount = Math.round(particleDensity * currentArea);
      targetCount = Math.max(
        this.config.minParticleCount,
        Math.min(targetCount, this.config.maxParticleCount)
      );

      this.config.particleCount = targetCount;

      // Adjust particles - clamp positions to bounds
      const len = this.particles.length;
      for (let i = 0; i < len; i++) {
        const p = this.particles[i];
        p.x = Math.max(p.radius, Math.min(p.x, clientWidth - p.radius));
        p.y = Math.max(p.radius, Math.min(p.y, clientHeight - p.radius));
      }

      // Adjust particle count
      this._adjustParticleCount();

      // Update spatial grid cell size
      this._gridCellSize = this.config.maxDistance;
    }

    /**
     * Adjust particle count to match target
     * @private
     */
    _adjustParticleCount() {
      const target = this.config.particleCount;

      while (this.particles.length > target) {
        this.particles.pop();
      }

      while (this.particles.length < target) {
        this._createParticle();
      }
    }

    /**
     * Create a new particle
     * @private
     */
    _createParticle() {
      const { particleMinSize, particleMaxSize, particleSpeed, borderOffset } = this.config;
      const radius = Math.random() * (particleMaxSize - particleMinSize) + particleMinSize;
      const maxX = this.canvas.width - borderOffset - radius;
      const maxY = this.canvas.height - borderOffset - radius;
      const minX = borderOffset + radius;
      const minY = borderOffset + radius;

      const angle = Math.random() * Math.PI * 2;

      this.particles.push({
        x: Math.random() * (maxX - minX) + minX,
        y: Math.random() * (maxY - minY) + minY,
        radius,
        vx: Math.cos(angle) * particleSpeed,
        vy: Math.sin(angle) * particleSpeed
      });
    }

    /**
     * Update spatial hash grid for efficient neighbor lookup
     * @private
     */
    _updateSpatialGrid() {
      this._spatialGrid.clear();
      const cellSize = this._gridCellSize;

      for (let i = 0, len = this.particles.length; i < len; i++) {
        const p = this.particles[i];
        const cellX = Math.floor(p.x / cellSize);
        const cellY = Math.floor(p.y / cellSize);
        const key = `${cellX},${cellY}`;

        if (!this._spatialGrid.has(key)) {
          this._spatialGrid.set(key, []);
        }
        this._spatialGrid.get(key).push(i);
      }
    }

    /**
     * Get potential neighbors from spatial grid
     * @private
     */
    _getNeighborIndices(x, y) {
      const cellSize = this._gridCellSize;
      const cellX = Math.floor(x / cellSize);
      const cellY = Math.floor(y / cellSize);
      const neighbors = [];

      // Check surrounding cells (3x3 grid)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${cellX + dx},${cellY + dy}`;
          const cell = this._spatialGrid.get(key);
          if (cell) {
            neighbors.push(...cell);
          }
        }
      }

      return neighbors;
    }

    /**
     * Update all particles
     * @private
     */
    _updateParticles() {
      const {
        particleSpeed, borderOffset, enableLightningOnCollision,
        collisionLightningDelay, collisionLightningMinDistance
      } = this.config;

      const scaleFactor = this._deltaTime / this._targetFrameTime;
      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;
      const dampingFactor = this._dampingFactor;

      for (let i = 0, len = this.particles.length; i < len; i++) {
        const p = this.particles[i];
        const prevX = p.x;
        const prevY = p.y;

        // Update position
        p.x += p.vx * scaleFactor;
        p.y += p.vy * scaleFactor;

        // Check collision with avoidable areas
        const collision = this._checkAreaCollision(p, prevX, prevY);
        if (collision) {
          this._handleAreaCollision(p, collision, dampingFactor);
        }

        // Boundary checks
        this._handleBoundaryCollision(p, canvasWidth, canvasHeight, borderOffset, dampingFactor);

        // Normalize velocity
        this._normalizeVelocity(p, particleSpeed);
      }
    }

    /**
     * Check collision with avoidable areas
     * @private
     */
    _checkAreaCollision(particle, prevX, prevY) {
      const areas = this.avoidableAreas;
      const len = areas.length;

      for (let i = 0; i < len; i++) {
        const area = areas[i];
        const r = particle.radius;

        if (
          particle.x + r > area.x &&
          particle.x - r < area.x + area.width &&
          particle.y + r > area.y &&
          particle.y - r < area.y + area.height
        ) {
          // Calculate collision side
          const fromLeft = Math.abs(particle.x - area.x);
          const fromRight = Math.abs(particle.x - (area.x + area.width));
          const fromTop = Math.abs(particle.y - area.y);
          const fromBottom = Math.abs(particle.y - (area.y + area.height));

          const minDist = Math.min(fromLeft, fromRight, fromTop, fromBottom);
          let side, collisionPoint;

          if (minDist === fromLeft) {
            side = 'left';
            collisionPoint = { x: area.x, y: particle.y };
          } else if (minDist === fromRight) {
            side = 'right';
            collisionPoint = { x: area.x + area.width, y: particle.y };
          } else if (minDist === fromTop) {
            side = 'top';
            collisionPoint = { x: particle.x, y: area.y };
          } else {
            side = 'bottom';
            collisionPoint = { x: particle.x, y: area.y + area.height };
          }

          return { area, side, collisionPoint };
        }
      }
      return null;
    }

    /**
     * Handle collision with avoidable area
     * @private
     */
    _handleAreaCollision(particle, collision, dampingFactor) {
      const { area, side, collisionPoint } = collision;

      // Reverse velocity component
      if (side === 'left' || side === 'right') {
        particle.vx = -particle.vx * dampingFactor;
        particle.x = side === 'left'
          ? area.x - particle.radius
          : area.x + area.width + particle.radius;
      } else {
        particle.vy = -particle.vy * dampingFactor;
        particle.y = side === 'top'
          ? area.y - particle.radius
          : area.y + area.height + particle.radius;
      }

      // Trigger collision lightning
      if (this.config.enableLightningOnCollision) {
        this._triggerCollisionLightning(collisionPoint);
      }
    }

    /**
     * Handle boundary collision
     * @private
     */
    _handleBoundaryCollision(particle, width, height, offset, dampingFactor) {
      const r = particle.radius;

      if (particle.x - r < offset) {
        particle.vx = -particle.vx * dampingFactor;
        particle.x = offset + r;
        if (this.config.enableLightningOnCollision) {
          this._triggerCollisionLightning({ x: offset, y: particle.y });
        }
      } else if (particle.x + r > width - offset) {
        particle.vx = -particle.vx * dampingFactor;
        particle.x = width - offset - r;
        if (this.config.enableLightningOnCollision) {
          this._triggerCollisionLightning({ x: width - offset, y: particle.y });
        }
      }

      if (particle.y - r < offset) {
        particle.vy = -particle.vy * dampingFactor;
        particle.y = offset + r;
        if (this.config.enableLightningOnCollision) {
          this._triggerCollisionLightning({ x: particle.x, y: offset });
        }
      } else if (particle.y + r > height - offset) {
        particle.vy = -particle.vy * dampingFactor;
        particle.y = height - offset - r;
        if (this.config.enableLightningOnCollision) {
          this._triggerCollisionLightning({ x: particle.x, y: height - offset });
        }
      }
    }

    /**
     * Normalize particle velocity
     * @private
     */
    _normalizeVelocity(particle, targetSpeed) {
      const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);

      if (speed > 0.01) {
        const scale = targetSpeed / speed;
        particle.vx *= scale;
        particle.vy *= scale;
      } else {
        const angle = Math.random() * Math.PI * 2;
        particle.vx = Math.cos(angle) * targetSpeed;
        particle.vy = Math.sin(angle) * targetSpeed;
      }
    }

    /**
     * Draw all particles
     * @private
     */
    _drawParticles() {
      const ctx = this.ctx;
      const { particleBlendMode, particleOpacity, particleColor } = this.config;

      ctx.globalCompositeOperation = particleBlendMode;
      ctx.globalAlpha = particleOpacity;
      ctx.fillStyle = particleColor;

      // Batch draw particles
      ctx.beginPath();
      for (let i = 0, len = this.particles.length; i < len; i++) {
        const p = this.particles[i];
        ctx.moveTo(p.x + p.radius, p.y);
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Connect nearby particles with lines using spatial hashing
     * @private
     */
    _connectParticles() {
      const ctx = this.ctx;
      const { lineOpacity, lineColor, lineThickness } = this.config;
      const maxDistSq = this._maxDistanceSquared;
      const particles = this.particles;

      // Update spatial grid
      this._updateSpatialGrid();

      ctx.globalAlpha = lineOpacity;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineThickness;
      ctx.beginPath();

      const checkedPairs = new Set();

      for (let i = 0, len = particles.length; i < len; i++) {
        const p1 = particles[i];
        const neighbors = this._getNeighborIndices(p1.x, p1.y);

        for (let j = 0, nLen = neighbors.length; j < nLen; j++) {
          const ni = neighbors[j];
          if (ni <= i) continue; // Avoid checking same pair twice

          const pairKey = i < ni ? `${i}-${ni}` : `${ni}-${i}`;
          if (checkedPairs.has(pairKey)) continue;
          checkedPairs.add(pairKey);

          const p2 = particles[ni];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /**
     * Find closest particle to a point
     * @private
     */
    _findClosestParticle(x, y) {
      let closestDistSq = Infinity;
      let closest = null;

      for (let i = 0, len = this.particles.length; i < len; i++) {
        const p = this.particles[i];
        const dx = p.x - x;
        const dy = p.y - y;
        const distSq = dx * dx + dy * dy;

        if (distSq < closestDistSq) {
          closestDistSq = distSq;
          closest = p;
        }
      }

      return closest;
    }

    /**
     * Get or create a lightning bolt from the pool
     * @private
     */
    _getLightningBolt() {
      if (this._lightningPool.length > 0) {
        return this._lightningPool.pop();
      }
      return {
        points: [],
        color: '',
        glowColor: '',
        alpha: 0,
        lifetime: 0,
        currentLifetime: 0,
        thickness: 0,
        intensity: 0
      };
    }

    /**
     * Return a lightning bolt to the pool
     * @private
     */
    _recycleLightningBolt(bolt) {
      bolt.points.length = 0;
      this._lightningPool.push(bolt);
    }

    /**
     * Create a lightning bolt
     * @param {number|null} startX - Starting X coordinate
     * @param {number|null} startY - Starting Y coordinate
     * @param {number|null} lifetime - Bolt lifetime
     * @param {string|null} color - Bolt color
     * @param {string|null} glowColor - Glow color
     * @param {number|null} opacity - Bolt opacity
     * @param {number|null} thickness - Bolt thickness
     * @param {number|null} intensity - Glow intensity
     * @param {string} type - 'general' or 'collision'
     */
    createLightning(
      startX = null,
      startY = null,
      lifetime = null,
      color = null,
      glowColor = null,
      opacity = null,
      thickness = null,
      intensity = null,
      type = 'general'
    ) {
      const config = this.config;

      // Check split limits
      if (type === 'collision' && !config.collisionEnableSplits) return;
      if (type === 'general' && !config.enableSplits && lifetime !== null) return;

      if (this.particles.length === 0 && startX === null) return;

      // Determine starting point
      let x = startX ?? this.particles[Math.floor(Math.random() * this.particles.length)].x;
      let y = startY ?? this.particles[Math.floor(Math.random() * this.particles.length)].y;

      const bolt = this._getLightningBolt();
      bolt.points.push({ x, y });

      // Determine angle and segments
      let angle = config.globalLightningDirection
        ? config.lightningAngle
        : Math.random() * Math.PI * 2;

      const segments = lifetime ?? Math.floor(
        Math.random() * (config.maxLightningSegments - config.minLightningSegments + 1)
      ) + config.minLightningSegments;

      // Split configuration based on type
      const enableSplits = type === 'collision' ? config.collisionEnableSplits : config.enableSplits;
      const splitProbability = type === 'collision' ? config.collisionSplitProbability : config.splitProbability;
      const minSplitSegments = type === 'collision' ? config.collisionMinSplitSegments : config.minSplitSegments;

      // Generate segments
      for (let i = 0; i < segments; i++) {
        const length = Math.random() * 30 + 20;
        let newX = x + Math.cos(angle) * length;
        let newY = y + Math.sin(angle) * length;

        // Snap to nearest particle if enabled
        if (config.lightningThroughParticles) {
          const closest = this._findClosestParticle(newX, newY);
          if (closest) {
            newX = closest.x;
            newY = closest.y;
          }
        }

        bolt.points.push({ x: newX, y: newY });

        // Create split
        if (enableSplits && Math.random() < splitProbability && lifetime === null) {
          const splitSegments = Math.floor(
            Math.random() * (segments - i - minSplitSegments)
          ) + minSplitSegments;

          if (splitSegments > 0) {
            this.createLightning(newX, newY, splitSegments, null, null, null, null, null, type);
          }
        }

        // Adjust angle
        if (!config.globalLightningDirection) {
          angle += (Math.random() - 0.5) * Math.PI / 4;
        }

        x = newX;
        y = newY;

        // Break if out of bounds
        if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) break;
      }

      // Set bolt properties
      bolt.color = color ?? config.lightningColor;
      bolt.glowColor = glowColor ?? config.lightningGlowColor;
      bolt.alpha = opacity ?? config.lightningOpacity;
      bolt.lifetime = lifetime ?? Math.floor(
        Math.random() * (config.maxLightningLifetime - config.minLightningLifetime + 1)
      ) + config.minLightningLifetime;
      bolt.currentLifetime = 0;
      bolt.thickness = thickness ?? config.lightningThickness;
      bolt.intensity = intensity ?? config.lightningGlow;

      this.lightning.push(bolt);
    }

    /**
     * Draw all lightning bolts
     * @private
     */
    _drawLightning() {
      const ctx = this.ctx;
      const { lightningBlendMode, instantLightning } = this.config;

      ctx.globalCompositeOperation = lightningBlendMode;

      for (let i = this.lightning.length - 1; i >= 0; i--) {
        const bolt = this.lightning[i];

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bolt.points[0].x, bolt.points[0].y);

        const segmentCount = instantLightning
          ? bolt.points.length
          : Math.floor((bolt.currentLifetime / bolt.lifetime) * bolt.points.length);

        for (let j = 1; j < segmentCount; j++) {
          ctx.lineTo(bolt.points[j].x, bolt.points[j].y);
        }

        ctx.shadowColor = bolt.glowColor;
        ctx.shadowBlur = bolt.intensity;

        // Calculate fading alpha
        const progress = bolt.currentLifetime / bolt.lifetime;
        const currentAlpha = bolt.alpha * (1 - progress);

        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = bolt.thickness;
        ctx.stroke();
        ctx.restore();

        bolt.currentLifetime++;

        // Remove expired bolts
        if (bolt.currentLifetime >= bolt.lifetime) {
          this._recycleLightningBolt(bolt);
          this.lightning.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Draw background
     * @private
     */
    _drawBackground() {
      this.ctx.fillStyle = this.config.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Trigger collision lightning at a point
     * @private
     */
    _triggerCollisionLightning(point) {
      if (!this.config.enableLightningOnCollision) return;

      const now = performance.now();
      const config = this.config;

      // Cleanup old positions
      this._collisionLightningPositions = this._collisionLightningPositions.filter(
        pos => now - pos.time < config.collisionLightningDelay
      );

      // Check timing
      if (now - this._lastCollisionLightningTime < config.collisionLightningDelay) return;

      // Check distance
      const isFarEnough = this._collisionLightningPositions.every(
        pos => Math.hypot(point.x - pos.x, point.y - pos.y) >= config.collisionLightningMinDistance
      );

      if (!isFarEnough) return;

      // Create lightning
      this.createLightning(
        point.x,
        point.y,
        config.collisionLightningLifetime,
        config.collisionLightningColor,
        config.collisionLightningGlowColor,
        config.collisionLightningOpacity,
        config.collisionLightningThickness,
        config.collisionLightningIntensity,
        'collision'
      );

      this._lastCollisionLightningTime = now;
      this._collisionLightningPositions.push({ x: point.x, y: point.y, time: now });
    }

    /**
     * Main animation loop
     * @private
     */
    _animate(timestamp) {
      if (!this._isRunning) return;

      this._rafId = requestAnimationFrame(this._boundAnimate);

      if (this._isPaused) return;

      // Calculate delta time (capped at 100ms to handle tab switching)
      this._deltaTime = Math.min(timestamp - this._lastTime, 100);

      // FPS tracking
      this._frameCount++;
      const now = performance.now();
      const elapsed = now - this._lastFpsUpdate;

      if (elapsed >= 1000) {
        this._fps = (this._frameCount / elapsed) * 1000;
        this._frameCount = 0;
        this._lastFpsUpdate = now;

        // Dynamic particle adjustment based on FPS
        this._adjustForPerformance();
      }

      // FPS limiting
      if (timestamp - this._lastTime < this._fpsInterval) return;

      this._lastTime = timestamp;

      // Render frame
      this._drawBackground();

      // Lightning
      if (this.config.lightningOpacity > 0 && Math.random() < this.config.lightningFrequency) {
        this.createLightning();
      }
      this._drawLightning();

      // Particles
      if (this.particles.length < this.config.particleCount) {
        this._createParticle();
      }
      this._updateParticles();
      this._connectParticles();
      this._drawParticles();
    }

    /**
     * Adjust particle count based on performance
     * @private
     */
    _adjustForPerformance() {
      const { minFPS, maxFPS, minParticleCount, maxParticleCount, particleAdjustStep } = this.config;

      if (this._fps < minFPS && this.particles.length > minParticleCount) {
        // Reduce particles
        const removeCount = Math.min(particleAdjustStep, this.particles.length - minParticleCount);
        this.particles.length -= removeCount;
      } else if (this._fps > maxFPS && this.particles.length < maxParticleCount) {
        // Can potentially add particles
        const addCount = Math.min(
          particleAdjustStep,
          this.config.particleCount - this.particles.length,
          maxParticleCount - this.particles.length
        );
        for (let i = 0; i < addCount; i++) {
          this._createParticle();
        }
      }
    }

    /**
     * Handle visibility change
     * @private
     */
    _handleVisibilityChange() {
      if (document.hidden && this.config.pauseOnBlur) {
        this.pause();
      } else if (!document.hidden && this.config.pauseOnBlur) {
        const { clientWidth, clientHeight } = this.canvas;
        if (this.canvas.width !== clientWidth || this.canvas.height !== clientHeight) {
          this.resize();
        }
        this._lastTime = performance.now();
        this.resume();
      }
    }

    /**
     * Handle focus event
     * @private
     */
    _handleFocus() {
      if (this.config.pauseOnBlur && !this._isScrollPaused) {
        this.resume();
      }
    }

    /**
     * Handle blur event
     * @private
     */
    _handleBlur() {
      if (this.config.pauseOnBlur) {
        this.pause();
      }
    }

    // ==================== PUBLIC API ====================

    /**
     * Update configuration at runtime
     * @param {Object} newConfig - New configuration values
     */
    updateConfig(newConfig) {
      const { randomizeDirection, ...filtered } = newConfig;

      Object.assign(this.config, filtered);
      this._fpsInterval = 1000 / this.config.fpsLimit;
      this._maxDistanceSquared = this.config.maxDistance ** 2;
      this._gridCellSize = this.config.maxDistance;

      // Clear lightning on config change
      while (this.lightning.length) {
        this._recycleLightningBolt(this.lightning.pop());
      }

      this._adjustParticleCount();
    }

    /**
     * Pause the animation
     */
    pause() {
      this._isPaused = true;
    }

    /**
     * Resume the animation
     */
    resume() {
      if (!this._isPaused) return;

      this._isPaused = false;
      this._lastTime = performance.now();

      if (this.config.resetOnResume) {
        const { width, height } = this.canvas;
        for (let i = 0, len = this.particles.length; i < len; i++) {
          const p = this.particles[i];
          p.x = Math.random() * width;
          p.y = Math.random() * height;
        }
      }
    }

    /**
     * Stop and cleanup the animation
     */
    stop() {
      this._isRunning = false;

      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }

      this._removeEventListeners();
      this.particles.length = 0;
      this.lightning.length = 0;
      this._lightningPool.length = 0;
      this._spatialGrid.clear();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Get current FPS
     * @returns {number} Current frames per second
     */
    getFPS() {
      return Math.round(this._fps);
    }

    /**
     * Get current particle count
     * @returns {number} Number of active particles
     */
    getParticleCount() {
      return this.particles.length;
    }

    /**
     * Update avoidable areas from DOM elements
     * @param {string} selector - CSS selector for elements to avoid
     */
    updateAvoidableAreas(selector) {
      this.avoidableAreas = [];
      const elements = document.querySelectorAll(selector);
      const canvasRect = this.canvas.getBoundingClientRect();

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        this.avoidableAreas.push({
          x: rect.left - canvasRect.left,
          y: rect.top - canvasRect.top,
          width: rect.width,
          height: rect.height
        });
      });
    }

    /**
     * Check if animation is paused
     * @returns {boolean} Whether animation is paused
     */
    isPaused() {
      return this._isPaused;
    }

    /**
     * Check if animation is running
     * @returns {boolean} Whether animation is running
     */
    isRunning() {
      return this._isRunning;
    }
  }

  return LightningParticle;
}));
