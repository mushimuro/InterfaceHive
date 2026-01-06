# InterfaceHive Landing Page

A modern, conversion-focused landing page featuring GSAP animations, Lottie integration, and an interactive Three.js honeycomb structure.

## File Structure

```
landing/
├── index.html       # Semantic HTML structure with CDN links
├── style.css        # Modular CSS with custom properties
├── main.js          # All JavaScript with clear function separation
└── README.md        # This file
```

## Features

### 1. Hero Section
- Gradient headline with amber accent
- Lottie animation (with SVG fallback)
- GSAP intro timeline (fade/slide, stagger)
- Primary and secondary CTAs with glow effects

### 2. Feature Section
- 4 feature cards in responsive grid
- Scroll-triggered reveal with stagger
- Hover lift effects with border glow
- Custom SVG icons for each feature

### 3. 3D Visual Section
- Three.js honeycomb structure (7 hexagonal meshes)
- Mouse-reactive rotation with smooth lerping
- Scroll-linked rotation via ScrollTrigger
- Amber/gold directional lighting
- Responsive canvas with resize handling

### 4. CTA Section
- Animated radial gradient background
- Scale entrance animation with back easing
- Large primary button with hover micro-interactions

## Technical Implementation

### GSAP + ScrollTrigger
**Function: `initAnimations()`**
- Hero timeline: Lottie container → headline → subheadline → CTAs
- Floating animation on Lottie container (infinite yoyo)
- Button hover scale effects
- Power2/Power3 easing for smooth motion

**Function: `initScrollTriggers()`**
- Feature cards: Staggered fade-up on scroll (0.15s stagger)
- 3D content: Slide from left with power3 easing
- Canvas: Slide from right with delay
- CTA: Scale up with back.out easing for bounce effect
- Parallax on hero gradient
- Honeycomb scroll rotation (0-360° from trigger start to end)

### Lottie Integration
**Function: `initLottie()`**
- Loads collaboration-themed animation via lottie-web
- Fallback SVG hexagon animation if load fails
- Scroll-controlled playback speed (speeds up as user scrolls)

**Fallback: `createLottieFallback()`**
- Animated SVG hexagon with stroke-width and opacity animations
- Uses CSS filters for amber glow effect

### Three.js Scene
**Function: `initThreeScene()`**

**Geometry:**
- 7 hexagonal extruded meshes arranged in honeycomb pattern
- ExtrudeGeometry with bevels for depth
- EdgeGeometry wireframes for outline detail

**Materials:**
- MeshPhongMaterial with amber color (#f59e0b)
- Emissive glow (emissive: #d97706, intensity: 0.3)
- Wireframe overlays with lighter amber (#fbbf24)

**Lighting:**
- AmbientLight (white, 0.4 intensity)
- Two DirectionalLights with amber tints from opposing angles

**Interactivity:**
- Mouse movement tracked via mousemove listener
- Target rotation calculated from normalized mouse position
- Smooth interpolation (lerp factor: 0.05) for fluid motion
- ScrollTrigger rotates entire group based on scroll progress
- Autonomous gentle rotation (0.002 rad/frame)

**Performance:**
- RequestAnimationFrame loop
- Proper resize handling with debounced recalculation
- PixelRatio capped at 2 for performance
- Cleanup function provided for SPA contexts

**Animation Loop:**
```javascript
honeycombGroup.rotation.x += (targetRotation.x - honeycombGroup.rotation.x) * 0.05; // Lerp
honeycombGroup.rotation.y += (targetRotation.y - honeycombGroup.rotation.y) * 0.05;
honeycombGroup.rotation.y += 0.002; // Autonomous rotation
```

## Running the Page

### Option 1: Direct File Open (Recommended)
Simply open `index.html` in a modern browser. All dependencies are loaded via CDN.

### Option 2: Local Server (Better for Development)
If you encounter CORS issues or want to test in a production-like environment:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Then visit: http://localhost:8000
```

**Using Node.js:**
```bash
# Install serve globally
npm install -g serve

# Run server
serve .

# Visit the URL provided (usually http://localhost:3000)
```

**Using VS Code:**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

## Browser Compatibility

- Chrome/Edge 90+ (recommended)
- Firefox 88+
- Safari 14+

**Required Features:**
- CSS Custom Properties
- ES6 JavaScript
- WebGL (for Three.js)
- RequestAnimationFrame

## Accessibility Features

- Semantic HTML5 structure
- ARIA labels on buttons
- Focus-visible outline styles (2px amber)
- WCAG AA contrast ratios
- Keyboard navigation support
- `prefers-reduced-motion` media query support

## Performance Optimizations

- `will-change` hints on animated elements
- GPU-accelerated properties (transform, opacity)
- PixelRatio capped at 2
- Efficient GSAP selectors
- Lazy ScrollTrigger initialization
- Performance monitoring in console (long tasks > 50ms)

## Customization

### Colors
Edit CSS custom properties in `style.css`:
```css
:root {
    --color-accent: #f59e0b;        /* Primary amber */
    --color-accent-dark: #d97706;   /* Dark amber */
    --color-accent-light: #fbbf24;  /* Light amber */
}
```

### Animations
Adjust timing in `main.js`:
```javascript
// Hero timeline durations
heroTimeline.to('.hero-headline', { duration: 1 /* customize */ });

// ScrollTrigger start/end points
scrollTrigger: { start: 'top 80%' /* customize */ }
```

### 3D Scene
Modify honeycomb structure:
```javascript
// Add more hexagons to positions array
const positions = [
    { x: 0, y: 0, z: 0 },
    // Add more positions here
];

// Change colors
const material = new THREE.MeshPhongMaterial({
    color: 0xf59e0b, // Customize color
});
```

## CDN Dependencies

- **GSAP:** 3.12.5 (core + ScrollTrigger)
- **Lottie:** 5.12.2 (lottie-web)
- **Three.js:** r128
- **Font:** Inter (Google Fonts)

All CDNs use `cdnjs.cloudflare.com` for reliability.

## Notes

- Lottie animation URL is a placeholder - replace with actual LottieFiles URL or local JSON
- For production, consider self-hosting dependencies
- Three.js scene is lightweight but test on target devices
- ScrollTrigger uses `scrub` for scroll-linked effects (smooth, not jumpy)

## Self-Verification Checklist

- [x] All four sections exist and match specifications
- [x] ScrollTrigger animations fire correctly
- [x] Lottie renders with fallback mechanism
- [x] Three.js honeycomb renders, rotates, and responds to mouse/scroll
- [x] Code is modular with required function structure
- [x] Comments explain key implementation details
- [x] Responsive on mobile and desktop
- [x] Basic accessibility implemented (focus, contrast, ARIA)
- [x] CDN links are current and functional
- [x] Instructions for running locally are clear

## Troubleshooting

**Lottie not loading:**
- Replace the Lottie path in `main.js` with a valid LottieFiles URL
- The fallback SVG animation will display automatically

**Three.js scene blank:**
- Check browser console for WebGL errors
- Ensure browser supports WebGL (visit: https://get.webgl.org/)

**Animations not triggering:**
- Ensure you're scrolling the page
- Check browser console for GSAP errors
- Try hard refresh (Ctrl+Shift+R)

**Performance issues:**
- Reduce number of hexagons in Three.js scene
- Disable `will-change` hints in CSS
- Lower ScrollTrigger scrub value for less smooth but faster performance

---

Built with care for InterfaceHive
