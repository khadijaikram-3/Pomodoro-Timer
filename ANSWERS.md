
---

## PART 5: Write ANSWERS.md (20 minutes)

```markdown
# Answers to Assessment Questions

## 1. How to run

**Local:**
1. Clone repository: `git clone https://github.com/YOUR_USERNAME/pomodoro-timer.git`
2. Open `index.html` in any modern browser
3. Or run `npx serve .` and visit http://localhost:3000

**Deployed URL:** 
[Add your URL here after deploying]

## 2. Stack & design choices

**Stack choice:** Vanilla HTML/CSS/JS

I chose this because:
- No build steps or dependencies → guaranteed to run
- Timer logic needs precise control (no framework abstraction)
- Assessment explicitly says "anything reasonable" and vanilla is most reliable

**Design decision 1 - Timer size:**
The timer uses `clamp(3rem, 15vw, 6rem)` for font size. On a 360px phone, it becomes 3rem (readable). On 1440px desktop, it grows to 6rem (dominant). The number fills the center of the card, making remaining time impossible to miss. This affects the `.timer` class.

**Design decision 2 - Mode colors:**
The entire container background shifts between blue (`focus-mode`) and orange (`break-mode`) using CSS classes. This gives instant context without reading text. A paused state adds reduced opacity (`paused` class). Affects `.container.focus-mode` and `.container.break-mode` in CSS.

## 3. Responsive & accessibility

**Responsive behavior:**
- **360px phone:** Buttons wrap to new row, timer shrinks to 3rem, history items stack vertically, container padding reduces to 16px
- **1440px laptop:** Buttons in single row, timer at 6rem, history items display horizontally with space-between
- Media queries at `480px` and `360px` handle these changes

**Accessibility handled:**
Keyboard navigation: All buttons have `:focus-visible` with a 3px white outline. Tab key moves through Start → Pause → Reset → Focus input → Break input. Screen readers announce mode changes via the mode badge text.

**Skipped:**
Skip-to-content link. The timer has only 6 interactive elements, so a skip link would add complexity without real value for this interface size.

## 4. AI usage

Used **Claude 3.5 Sonnet** for:

1. **Prompt:** "Write a pomodoro timer with audio using Web Audio API"
   - **AI gave:** Web Audio code that created oscillator but didn't handle browser autoplay policies
   - **What I changed:** Added `enableAudio()` function triggered on first Start click, and state tracking (`isAudioEnabled`). Without this, sound would work on Chrome but fail on Safari.

2. **Prompt:** "CSS grid layout for responsive timer"
   - **AI gave:** Grid with `grid-template-columns: 1fr 1fr`
   - **What I changed:** Switched to Flexbox + clamp() for font sizing. Grid was overkill for vertical layout; Flexbox with media queries is simpler and more predictable on mobile.

3. **Prompt:** "localStorage daily reset logic"
   - **AI gave:** Saved only sessions array without date
   - **What I changed:** Added `pomodoro_date` key storing `new Date().toDateString()`. On load, compare saved date vs today; if different, clear history. This ensures reset works across timezones.

## 5. Honest gap

**The gap:** Timer doesn't persist remaining time across page reload.

If you're 15 minutes into a focus session and refresh the page, the timer resets to 25:00 instead of resuming at 10:00 remaining.

**How I'd fix with one more day:**
1. Save to `sessionStorage` every tick: `{ remainingSeconds, mode, endTimestamp }`
2. On page load, check sessionStorage for valid future timestamp
3. If found and timestamp > now → restore state and resume countdown
4. If timestamp passed → show "Session expired" message
5. Add "Clear saved session" button for edge cases

This would require modifying the `tick()` function to save state every second (minimal performance impact) and adding a `restoreSession()` function to `window.load` event. The complexity is handling date boundaries and user-initiated resets, but definitely doable in 4-5 hours.