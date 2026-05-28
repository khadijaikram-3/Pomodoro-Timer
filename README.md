# Pomodoro Timer — Focus & Flow

A beautiful, feature-rich Pomodoro timer designed to enhance productivity with task tracking, voice encouragement, achievements, and dark mode.

**Live Demo:** [https://khadijaikram-3.github.io/Pomodoro-Timer/](https://khadijaikram-3.github.io/Pomodoro-Timer/)

## 📸 Screenshots

| Dark Mode | Light Mode (Paused) |
|:---------:|:-------------------:|
| ![Dark Mode](Dark%20Mode.png) | ![Light Mode Pause Screen](Light%20Mode%20Pause%20Screen.png) |

## Features

| Feature | Description |
|---------|-------------|
| ⏱️ **Customizable Timer** | Set focus (1-60 min) and break (1-30 min) durations |
| 📝 **Task Tracking** | Name your current task, appears in session history |
| 🎨 **Dark/Light Mode** | Toggle between themes, preference saved |
| 🗣️ **Voice Encouragement** | Motivational voice messages for start, pause, resume, reset, and session completion |
| 🎉 **Confetti Celebration** | Colorful confetti bursts when you complete a focus session |
| 📊 **Daily History** | Track all sessions with start/end times and task names |
| 🏆 **Achievements** | Unlock milestones at 1, 3, 5, 10, 15, 25 sessions and 1, 2, 4 hours |
| 💬 **Motivational Quotes** | Random encouraging quotes that change based on your action |
| 🔄 **Auto Transition** | Automatically switches between focus and break modes |
| 💾 **Local Storage** | All data persists across page reloads, resets daily |
| 📱 **Responsive** | Works perfectly on mobile (360px) to desktop (1440px) |

## How to Run Locally

### Option 1: Direct (Easiest)
1. Download all files: `index.html`, `styles.css`, `script.js`
2. Make sure all 3 files are in the **same folder**
3. Double-click `index.html` to open in your browser

### Option 2: Clone & Open

```bash
git clone https://github.com/khadijaikram-3/Pomodoro-Timer.git
cd Pomodoro-Timer
open index.html  # macOS
start index.html # Windows
```

### How to Use
Set your times - Use +/- buttons to adjust focus and break duration

Name your task - Type what you're working on

Click START - Timer begins countdown with voice encouragement

Use PAUSE/RESUME/RESET as needed

Complete a session - Confetti bursts, session saved to history

Toggle dark mode - Click 🌙/☀️ in top left corner

### Tech Stack
HTML5 - Semantic structure

CSS3 - Glassmorphism design, CSS Grid, Flexbox, responsive media queries

Vanilla JavaScript - No frameworks

Canvas Confetti - Celebration animations

Web Speech API - Voice messages

LocalStorage - Data persistence

### Responsive Breakpoints
Device	Screen Width	Layout
Mobile	360px - 480px	Stacked layout, smaller timer ring
Tablet	481px - 900px	Stacked layout, medium spacing
Desktop	901px - 1440px	Side-by-side layout, full features

 ### Known Limitations
Timer does NOT persist remaining time on page refresh

Voice requires user interaction first (browser autoplay policy)

🔜 Future Improvements
Persist remaining time on page refresh

Keyboard shortcuts (Space to pause/resume)

Export history as CSV
