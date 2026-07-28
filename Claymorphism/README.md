# Claymorphic Kids Learning Website Template

A premium, colorful, and fully responsive **Claymorphism** UI template designed for kids' learning websites or playful educational applications.

## Table of Contents
- [Quick Start](#quick-start)
- [How to Use This Template in Other Projects](#how-to-use-this-template-in-other-projects)
  - [1. Copy the CSS Stylesheet](#1-copy-the-css-stylesheet)
  - [2. Customize the CSS Variables](#2-customize-the-css-variables)
  - [3. Reuse the HTML Components](#3-reuse-the-html-components)
  - [4. Add Playful Sound Effects](#4-add-playful-sound-effects)
- [Design Architecture & Utility Classes](#design-architecture--utility-classes)

---

## Quick Start

To run the local preview server:
1. Ensure you have Node.js installed.
2. Navigate to the project root directory in your terminal.
3. Run:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use This Template in Other Projects

Integrating this playful 3D design system into your existing projects (whether built in React, Vue, Next.js, or plain HTML) is simple and straightforward.

### 1. Copy the CSS Stylesheet
Copy the contents of [style.css](style.css) into your project's main stylesheet (e.g., `index.css`, `global.css`, or a standalone `clay.css`).

Make sure to include the font import at the very top of your stylesheet:
```css
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');
```

### 2. Customize the CSS Variables
In the CSS, all colors and shadows are controlled by CSS variables defined in the `:root`. You can edit these values to change the feel of your site:

```css
:root {
  /* Change the background color */
  --bg-primary: #f0f4f9;

  /* Configure the colors and inner/outer shadows of your clay elements */
  --clay-blue: #4dabf7;
  --clay-blue-inset-light: rgba(255, 255, 255, 0.6);
  --clay-blue-inset-dark: rgba(3, 102, 214, 0.4);
  --clay-blue-shadow: rgba(77, 171, 247, 0.35);
  
  /* Change how round the clay elements are */
  --border-radius-lg: 32px;
  --border-radius-md: 20px;
}
```

### 3. Reuse the HTML Components
This template includes a built-in interactive **Component Style Guide** displaying copyable HTML snippets for:
- **Buttons**: `.clay-btn` (with color modifiers like `.clay-btn-secondary`, `.clay-btn-warning`, `.clay-btn-danger`, `.clay-btn-purple`, `.clay-btn-orange`, or sizes `.clay-btn-sm`, `.clay-btn-lg`)
- **Cards**: `.clay-card` (and colorful wrappers like `.clay-card-blue`, `.clay-card-green`, etc.)
- **Inputs**: Recessed clay-look text inputs (`.clay-input`) and textareas (`.clay-textarea`)
- **Controls**: Custom clay-style switches (`.clay-switch`), checkboxes (`.clay-checkbox-label`), radio buttons (`.clay-radio-label`), and range sliders (`.clay-slider`)
- **Progress Trackers**: `.clay-progress-track` and `.clay-progress-bar`

*Simply copy the respective HTML snippets from the **✨ Style Guide** page (active in navigation) directly into your markup.*

### 4. Add Playful Sound Effects
Sound effects make interfaces feel alive and kid-friendly. We created a **zero-dependency** synthesizer using the browser's built-in **Web Audio API** inside `app.js`.

Copy the following helper function to trigger retro sound effects upon click events:

```javascript
// Initialize audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === 'click') {
    // Soft clay bubble pop
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === 'success') {
    // Joyful chime arpeggio
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
    
    osc.start(now);
    osc.stop(now + 0.35);
  }
}

// Example usage:
// document.getElementById('my-button').addEventListener('click', () => playSound('click'));
```

---

## Design Architecture & Utility Classes

The styling is designed using structural blocks:
- **Base Clay Shadow Rule**:
  `box-shadow: inset [light-highlight] [dark-shadow-depth] [outer-drop-shadow];`
  - Inset 1 (Top-Left): Creates the highlight reflection where light hits the clay object.
  - Inset 2 (Bottom-Right): Creates the darker shadow that curves away from the light.
  - Drop Shadow (Outer): Gives the element depth to float off the screen background.
- **Active State (`:active`)**: Reverses the scale and shifts shadows inward, making it look as though the element was physically squashed by a finger.
