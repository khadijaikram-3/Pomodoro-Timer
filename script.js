(() => {
  // ===== State =====
  const state = {
    focusMin: 25,
    breakMin: 5,
    mode: 'focus', // 'focus' | 'break'
    remaining: 25 * 60,
    total: 25 * 60,
    running: false,
    paused: false,
    interval: null,
    task: '',
    sessionStart: null,
  };

  const RING_CIRC = 2 * Math.PI * 140;

  // ===== Quote pools =====
  const quotes = {
    start: [
      "You can do this!", "Small steps every day", "Focus on the present moment",
      "Every session brings you closer", "You're building amazing habits",
      "Stay committed to your goals", "Progress over perfection",
      "One pomodoro at a time", "Your future self will thank you",
      "Greatness is built in these moments", "Time to shine", "Deep work awaits"
    ],
    pause: ["Take a deep breath", "Pause and reset", "Breathe in calm, breathe out tension"],
    resume: ["Welcome back! Let's continue", "Right back into the flow", "Pick up where you left off"],
    complete: [
      "Congratulations! Amazing work!", "Session crushed! Beautifully done.",
      "You showed up — incredible!", "That's how it's done!"
    ],
    breakStart: ["Rest well, you earned it", "Recharge those batteries", "Step away and breathe"],
    breakEnd: ["Ready to crush another focus session?", "Back to the deep work", "Let's go again"]
  };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // ===== DOM =====
  const $ = id => document.getElementById(id);
  const timeDisplay = $('timeDisplay');
  const modeLabel = $('modeLabel');
  const ringFg = $('ringFg');
  const timerBox = $('timerBox');
  const quoteBox = $('quoteBox');
  const taskInput = $('taskInput');
  const currentTaskLabel = $('currentTaskLabel');
  const btnStart = $('btnStart'), btnPause = $('btnPause'),
        btnResume = $('btnResume'), btnReset = $('btnReset');
  const focusVal = $('focusVal'), breakVal = $('breakVal');
  const statSessions = $('statSessions'), statMinutes = $('statMinutes');
  const historyList = $('historyList'), achList = $('achList');
  const themeToggle = $('themeToggle');
  const toastEl = $('toast');

  ringFg.setAttribute('stroke-dasharray', RING_CIRC);

  // ===== Storage =====
  const today = () => new Date().toISOString().slice(0,10);
  const load = () => {
    const raw = localStorage.getItem('pomo_data');
    let data = raw ? JSON.parse(raw) : null;
    if (!data || data.date !== today()) {
      data = { date: today(), sessions: 0, minutes: 0, history: [], achievements: [] };
    }
    return data;
  };
  const save = d => localStorage.setItem('pomo_data', JSON.stringify(d));
  let data = load();

  // ===== Theme =====
  const applyTheme = t => {
    document.body.classList.toggle('light', t === 'light');
    themeToggle.textContent = t === 'light' ? '☀️' : '🌙';
    localStorage.setItem('pomo_theme', t);
  };
  applyTheme(localStorage.getItem('pomo_theme') || 'dark');
  themeToggle.onclick = () =>
    applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');

  // ===== Helpers =====
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const updateDisplay = () => {
    timeDisplay.textContent = fmt(state.remaining);
    const offset = RING_CIRC * (1 - state.remaining / state.total);
    ringFg.style.strokeDashoffset = offset;
    modeLabel.textContent = state.mode === 'focus' ? 'Focus Time' : 'Break Time';
  };
  const setQuote = txt => { quoteBox.textContent = `"${txt}"`; };
  const showToast = msg => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), 3000);
  };

  // ===== Audio =====
  let audioCtx;
  const beep = () => {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 220, 440].forEach(delay => {
        setTimeout(() => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g); g.connect(audioCtx.destination);
          o.frequency.value = 880;
          o.type = 'sine';
          g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
          o.start(); o.stop(audioCtx.currentTime + 0.4);
        }, delay);
      });
    } catch(e){}
  };

  // ===== Voice =====
  const speak = txt => {
    if (!('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt);
      u.rate = 1; u.pitch = 1; u.volume = 0.9;
      speechSynthesis.speak(u);
    } catch(e){}
  };

  // ===== Render =====
  const renderStats = () => {
    statSessions.textContent = data.sessions;
    statMinutes.textContent = data.minutes;
  };
  const renderHistory = () => {
    if (!data.history.length) {
      historyList.innerHTML = '<div class="empty">No sessions yet today.</div>';
      return;
    }
    historyList.innerHTML = data.history.slice().reverse().map(h => `
      <div class="history-card">
        <div class="history-task">${escapeHtml(h.task || 'Focus session')}</div>
        <div class="history-meta">
          <span>${h.start} → ${h.end}</span>
          <span>${h.duration} min</span>
        </div>
      </div>`).join('');
  };
  const renderAch = () => {
    if (!data.achievements.length) {
      achList.innerHTML = '<div class="empty">Complete sessions to earn achievements!</div>';
      return;
    }
    achList.innerHTML = data.achievements.slice().reverse().slice(0,6)
      .map(a => `<div class="ach-item">${escapeHtml(a)}</div>`).join('');
  };
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // ===== Achievements =====
  const achievementChecks = [
    { n:1,  msg:"✨ First session complete! A great start!" },
    { n:3,  msg:"🌱 3 sessions — momentum is building!" },
    { n:5,  msg:"🔥 5 sessions completed! You're on fire!" },
    { n:10, msg:"⭐ 10 sessions! You're a focus master!" },
    { n:15, msg:"🚀 15 sessions! Unstoppable!" },
    { n:25, msg:"🏆 25 sessions! Legendary status!" },
  ];
  const minuteChecks = [
    { m:60,  msg:"💪 1 hour total! Incredible dedication!" },
    { m:120, msg:"💪 2 hours total! Incredible dedication!" },
    { m:240, msg:"👑 4 hours of focus today — wow!" },
  ];
  const checkAchievements = () => {
    achievementChecks.forEach(a => {
      if (data.sessions === a.n) {
        data.achievements.push(a.msg);
        showToast(a.msg);
      }
    });
    minuteChecks.forEach(a => {
      if (data.minutes >= a.m && !data.achievements.includes(a.msg)) {
        data.achievements.push(a.msg);
        showToast(a.msg);
      }
    });
  };

  // ===== Timer logic =====
  const tick = () => {
    if (!state.running || state.paused) return;
    state.remaining--;
    updateDisplay();
    if (state.remaining <= 0) finishSession();
  };

  const startTimer = () => {
    if (state.running) return;
    state.task = taskInput.value.trim();
    currentTaskLabel.textContent = state.task ? `Working on: ${state.task}` : '';
    state.total = (state.mode === 'focus' ? state.focusMin : state.breakMin) * 60;
    state.remaining = state.total;
    state.running = true;
    state.paused = false;
    state.sessionStart = new Date();
    updateDisplay();
    state.interval = setInterval(tick, 1000);
    btnStart.disabled = true; btnPause.disabled = false;
    btnResume.disabled = true; btnReset.disabled = false;
    timerBox.classList.remove('paused');
    setQuote(pick(quotes.start));
    speak("Let's begin! You can do this!");
  };

  const pauseTimer = () => {
    if (!state.running || state.paused) return;
    state.paused = true;
    timerBox.classList.add('paused');
    btnPause.disabled = true; btnResume.disabled = false;
    setQuote(pick(quotes.pause));
    speak("Timer paused. Take a moment.");
  };

  const resumeTimer = () => {
    if (!state.running || !state.paused) return;
    state.paused = false;
    timerBox.classList.remove('paused');
    btnPause.disabled = false; btnResume.disabled = true;
    setQuote(pick(quotes.resume));
    speak("Resumed. Keep going strong!");
  };

  const resetTimer = (silent=false) => {
    clearInterval(state.interval);
    state.running = false; state.paused = false;
    state.mode = 'focus';
    state.total = state.focusMin * 60;
    state.remaining = state.total;
    timerBox.classList.remove('paused');
    btnStart.disabled = false; btnPause.disabled = true;
    btnResume.disabled = true;
    currentTaskLabel.textContent = '';
    updateDisplay();
    if (!silent) {
      setQuote("Fresh start, fresh focus");
      speak("Timer reset. Ready to start fresh?");
    }
  };

  const finishSession = () => {
    clearInterval(state.interval);
    state.running = false; state.paused = false;
    beep();

    if (state.mode === 'focus') {
      const end = new Date();
      const startStr = state.sessionStart.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      const endStr = end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      data.sessions++;
      data.minutes += state.focusMin;
      data.history.push({
        task: state.task || 'Focus session',
        start: startStr, end: endStr, duration: state.focusMin
      });
      save(data);
      renderStats(); renderHistory();
      setQuote(pick(quotes.complete));
      speak("Congratulations! You completed your focus session! Amazing work!");
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 },
        colors: ['#667eea','#764ba2','#11998e','#38ef7d','#f7971e','#ffd200'] });
      checkAchievements();
      renderAch();
      // switch to break
      setTimeout(() => {
        state.mode = 'break';
        state.total = state.breakMin * 60;
        state.remaining = state.total;
        updateDisplay();
        setQuote(pick(quotes.breakStart));
        speak("Break time! Rest well and recharge.");
        state.running = true; state.sessionStart = new Date();
        state.interval = setInterval(tick, 1000);
        btnStart.disabled = true; btnPause.disabled = false;
      }, 1500);
    } else {
      // break done
      setQuote(pick(quotes.breakEnd));
      speak("Break is over! Time to focus again. You've got this!");
      state.mode = 'focus';
      state.total = state.focusMin * 60;
      state.remaining = state.total;
      updateDisplay();
      btnStart.disabled = false; btnPause.disabled = true; btnResume.disabled = true;
    }
  };

  // ===== Steppers =====
  document.querySelectorAll('.stepper button').forEach(b => {
    b.onclick = () => {
      if (state.running) return; // lock during run
      const which = b.dataset.step, dir = +b.dataset.dir;
      if (which === 'focus') {
        state.focusMin = Math.min(60, Math.max(1, state.focusMin + dir));
        focusVal.textContent = state.focusMin;
      } else {
        state.breakMin = Math.min(30, Math.max(1, state.breakMin + dir));
        breakVal.textContent = state.breakMin;
      }
      if (!state.running) {
        state.total = (state.mode === 'focus' ? state.focusMin : state.breakMin) * 60;
        state.remaining = state.total;
        updateDisplay();
      }
    };
  });

  // ===== Buttons =====
  btnStart.onclick = startTimer;
  btnPause.onclick = pauseTimer;
  btnResume.onclick = resumeTimer;
  btnReset.onclick = () => resetTimer(false);

  // ===== Init =====
  updateDisplay();
  renderStats(); renderHistory(); renderAch();
  setQuote(pick(quotes.start));
})();