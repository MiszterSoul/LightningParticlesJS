# Changelog

All notable changes to LightningParticles.js will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-01

### 🚀 Major Performance Improvements
- **Spatial Hashing**: Implemented spatial hash grid for particle connection lookups, reducing complexity from O(n²) to O(n) for nearby particle detection
- **Object Pooling**: Added lightning bolt object pooling to reduce garbage collection pressure and memory allocations
- **Batched Rendering**: Particles are now drawn in a single batched path operation instead of individual draw calls
- **Optimized Animation Loop**: Improved frame timing and delta time calculations with proper capping for tab switching scenarios

### ✨ New Features
- Added UMD module support (works with CommonJS, AMD, and global scope)
- Added `static VERSION` property for version checking
- Added `getFPS()` method to retrieve current frame rate
- Added `getParticleCount()` method to get active particle count
- Added `isPaused()` and `isRunning()` state check methods
- Added `desynchronized` canvas context hint for better performance
- Added frozen `DEFAULTS` object for immutable default configuration

### 🐛 Bug Fixes
- Fixed typo in config: `pparticleColor` → `particleColor`
- Fixed potential memory leak when stopping animation (proper cleanup of event listeners)
- Fixed particle velocity using separate `vx`/`vy` properties instead of nested `velocity` object
- Fixed animation not properly stopping when `stop()` is called (now cancels RAF)
- Improved boundary collision handling precision

### 🔧 Code Quality
- Complete code refactoring with consistent naming conventions (private methods prefixed with `_`)
- Added comprehensive JSDoc documentation for all methods
- Improved error handling with type checking in constructor
- Removed redundant code and unused variables
- Better separation of concerns with dedicated private methods
- Used `const`/`let` consistently, eliminated `var` usage
- Added passive event listeners where applicable

### 💔 Breaking Changes
- Particle objects now use `vx`/`vy` instead of `velocity.x`/`velocity.y`
- Internal state variables are now prefixed with `_` (e.g., `_isPaused`, `_isRunning`)
- Removed `handleScroll` method (functionality merged into IntersectionObserver)

---

## [1.0.7] - 2024-10-04

### Fixed
- Particle Drift Issue: Resolved the issue where particles drifted towards the canvas corners when the page regained focus after being out of focus
