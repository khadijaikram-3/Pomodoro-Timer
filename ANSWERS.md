# Answers to Assessment Questions

## 1. How to run

### Local Setup
1. Clone the repository: `git clone https://github.com/khadijaikram-3/Pomodoro-Timer.git`
2. Navigate to folder: `cd Pomodoro-Timer`
3. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
4. No build steps, no dependencies, no installation required

### Deployed URL
**https://khadijaikram-3.github.io/Pomodoro-Timer/**

---

## 2. Stack & design choices

### Stack Choice: Vanilla HTML/CSS/JS

**Why I picked this stack:**
- **Zero dependencies** — The assessment says "We will open your app in a browser" — vanilla ensures it runs everywhere without npm install, build failures, or version conflicts
- **Full control** — Timer logic requires precise timing; frameworks add abstraction that can hide bugs with `setInterval` and state management
- **Performance** — No framework overhead means faster load times and smoother animations

### Design Decision 1 — Split Layout (Left Controls / Right Timer)

**What I did:** Left side contains all settings, stats, history, achievements. Right side contains ONLY the timer and control buttons.

**Why:** The user's primary focus should be the timer. By isolating it on the right with no distractions, the eye naturally goes there. Controls are on the left but still accessible. On mobile (360px), this stacks vertically — timer appears below controls because when using a phone,  first you have to do settings.

**Where it affects:** `.app` CSS grid — `grid-template-columns: minmax(320px, 420px) 1fr`

### Design Decision 2 — Timer Box "Freeze" Effect on Pause

**What I did:** When user clicks Pause, the entire timer box changes: opacity drops to 0.55, grayscale filter applies (0.6), slight blur (1px), and scale shrinks to 0.98.

**Why:** Most timers just stop the countdown but look identical to running state. This gives IMMEDIATE visual feedback that time has stopped — you feel the pause, not just see the numbers stop. When you click Resume, it returns to full opacity, color, and scale — a satisfying "unfreeze" moment.

**Where it affects:** `.timer-box.paused` class in CSS, toggled by `pauseTimer()` and `resumeTimer()` functions.

---

## 3. Responsive & accessibility

### Responsive Behavior

| Screen Size | Behavior |
|-------------|----------|
| **360px (iPhone SE)** | Layout stacks vertically. Timer ring shrinks from 320px → 260px. Buttons wrap to fit. No horizontal scroll. |
| **768px (iPad)** | Still stacked vertically. Timer ring at 280px. History cards use full width. |
| **1440px (Desktop)** | Side-by-side layout. Left panel fixed at 420px. Timer ring at 320px. |

**CSS Implementation:**
```css
/* Desktop */
.app { grid-template-columns: minmax(320px, 420px) 1fr; }

/* Tablet/Mobile */
@media (max-width: 900px) { .app { grid-template-columns: 1fr; } }

/* Small phones */
@media (max-width: 480px) { .ring-wrap { width: 260px; height: 260px; } }
```
Accessibility — HANDLED
Keyboard Navigation: All buttons are focusable via Tab key. Each has :hover and :focus visual states.

Color Contrast: Dark mode uses white text on dark glassmorphism cards (contrast ratio ~8:1). Light mode uses dark text on light glassmorphism cards (~7:1). Both exceed WCAG AA standards.

Voice Feedback: Visual + auditory feedback for all actions (start, pause, resume, reset, session complete).

Accessibility — KNOWINGLY SKIPPED
Toast notifications for screen readers: Achievement toasts appear visually but are not announced by screen readers.

Why skipped: Adding aria-live="polite" would announce every achievement twice. With 48-hour deadline, timer accuracy was higher priority.

How I'd fix: Create a dedicated aria-live="assertive" region that updates only for achievements with debouncing.

## 4. AI usage
Tools Used
Lovable.dev — AI-powered code generation platform
Claude 3.5 Sonnet — For debugging and CSS refinement

Specific AI Interactions
### Interaction 1 — Initial Pomodoro Structure
Prompt: "Create a Pomodoro timer with circle progress ring, split layout, localStorage history"

What AI gave: A working timer with basic circle ring, but pause/resume only stopped the interval — no visual feedback.

What I changed: Added the entire .timer-box.paused class with opacity, grayscale, blur, and scale transform. The AI's version felt lifeless; the freeze effect makes the pause physically noticeable.

### Interaction 2 — Voice Messages with Quotes
Prompt: "Add speech synthesis for start, pause, resume, reset, and session completion with different encouraging messages"

What AI gave: Voice messages that played on every action, but all used the same quote pool.

What I changed: Created separate quote pools (quotes.start, quotes.pause, quotes.resume, quotes.complete, quotes.breakStart, quotes.breakEnd). Each action picks randomly from its specific pool.

### Interaction 3 — Achievement System
Prompt: "Add achievement notifications when user completes sessions or total focus time"

What AI gave: A simple counter that showed "You reached 5 sessions!" as an alert (annoying popup).

What I changed: Replaced alert() with a toast notification system (.toast element with slide-up animation). Added both session-based achievements (1, 3, 5, 10, 15, 25) AND minute-based achievements (60, 120, 240 minutes).

## 5. Honest gap
The Gap: Timer Does NOT Persist Remaining Time on Page Refresh
What happens now: If you're 15 minutes into a 25-minute focus session and refresh the page, the timer resets to 25:00.

Why this is a gap: The assessment requires history to survive page reload (✅ done — localStorage handles this). But a polished app should handle timer state persistence.

What I Would Fix with One More Day
Solution: sessionStorage backup on every tick

javascript
```
// Save state every second
const saveTimerState = () => {
  sessionStorage.setItem('pomo_timer_state', JSON.stringify({
    remaining: state.remaining,
    mode: state.mode,
    total: state.total,
    running: state.running,
    paused: state.paused,
    timestamp: Date.now()
  }));
};

// On page load — restore if valid
const restoreTimerState = () => {
  const saved = sessionStorage.getItem('pomo_timer_state');
  if (!saved) return false;
  
  const savedState = JSON.parse(saved);
  const age = Date.now() - savedState.timestamp;
  
  // Only restore if less than 1 hour old
  if (age > 3600000) return false;
  
  Object.assign(state, savedState);
  updateDisplay();
  
  if (state.running && !state.paused) {
    startTimer();
  }
  return true;
};
```
### Why this works:

sessionStorage clears automatically when tab closes

Timestamp check prevents restoring very old sessions

Restores running/paused state correctly

### Other Minor Gaps
Gap	Severity	Fix Priority
No keyboard shortcuts	Low	Could add in 1 hour
Voice requires first click	Medium	Add "Enable Voice" button
No sound when timer starts	Low	Add subtle "start ding"
Final Notes
This timer was built to be functional, beautiful, and delightful — the freeze effect on pause, confetti on completion, and voice encouragement make it feel alive. The code is clean, modular, and fully responsive.

### Total time spent: ~6 hours

## Repository: 
https://github.com/khadijaikram-3/Pomodoro-Timer

## Live Demo: 
https://khadijaikram-3.github.io/Pomodoro-Timer/
### Submitted for Dev Weekends Fellowship 2026 Assessment
