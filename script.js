// DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const modeLabel = document.getElementById('modeLabel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const resetBtn = document.getElementById('resetBtn');
const focusValue = document.getElementById('focusValue');
const breakValue = document.getElementById('breakValue');
const todayCountSpan = document.getElementById('todayCount');
const totalTimeSpan = document.getElementById('totalTime');
const historyList = document.getElementById('historyList');
const leftSide = document.querySelector('.left-side');
const circleFill = document.getElementById('circleFill');

// Timer variables
let timerInterval = null;
let currentMode = 'focus'; // 'focus' or 'break'
let timeLeftSeconds = 25 * 60;
let isRunning = false;
let focusMinutes = 25;
let breakMinutes = 5;

// History data
let todaySessions = [];
let totalFocusMinutes = 0;

// Speech synthesis for voice messages
const synth = window.speechSynthesis;

// Load saved data
loadData();

// Update display on load
updateDisplay();
updateStats();

// Button event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resumeBtn.addEventListener('click', resumeTimer);
resetBtn.addEventListener('click', resetTimer);

// Time control buttons
document.querySelectorAll('.time-minus').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target === 'focus') {
            focusMinutes = Math.max(1, focusMinutes - 1);
            focusValue.textContent = focusMinutes;
            if (!isRunning && currentMode === 'focus') {
                timeLeftSeconds = focusMinutes * 60;
                updateDisplay();
            }
        } else {
            breakMinutes = Math.max(1, breakMinutes - 1);
            breakValue.textContent = breakMinutes;
            if (!isRunning && currentMode === 'break') {
                timeLeftSeconds = breakMinutes * 60;
                updateDisplay();
            }
        }
        saveSettings();
    });
});

document.querySelectorAll('.time-plus').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target === 'focus') {
            focusMinutes = Math.min(60, focusMinutes + 1);
            focusValue.textContent = focusMinutes;
            if (!isRunning && currentMode === 'focus') {
                timeLeftSeconds = focusMinutes * 60;
                updateDisplay();
            }
        } else {
            breakMinutes = Math.min(30, breakMinutes + 1);
            breakValue.textContent = breakMinutes;
            if (!isRunning && currentMode === 'break') {
                timeLeftSeconds = breakMinutes * 60;
                updateDisplay();
            }
        }
        saveSettings();
    });
});

// Update circle progress
function updateCircleProgress() {
    const totalSeconds = (currentMode === 'focus' ? focusMinutes : breakMinutes) * 60;
    const circumference = 2 * Math.PI * 125;
    const offset = circumference * (1 - timeLeftSeconds / totalSeconds);
    circleFill.style.strokeDasharray = circumference;
    circleFill.style.strokeDashoffset = offset;
}

// Update display (mm:ss)
function updateDisplay() {
    const minutes = Math.floor(timeLeftSeconds / 60);
    const seconds = timeLeftSeconds % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    updateCircleProgress();
}

// Speak message
function speakMessage(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    synth.speak(utterance);
}

// Play beep sound using Web Audio
function playBeep() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.frequency.value = 880;
    gain.gain.value = 0.3;
    
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    
    setTimeout(() => oscillator.stop(), 500);
}

// Save session to history
function saveSession(durationMinutes) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const session = {
        duration: durationMinutes,
        time: timeString,
        timestamp: now.getTime()
    };
    
    todaySessions.unshift(session);
    totalFocusMinutes += durationMinutes;
    
    filterTodaySessions();
    saveToLocalStorage();
    renderHistory();
    updateStats();
}

// Filter only today's sessions
function filterTodaySessions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    todaySessions = todaySessions.filter(session => {
        const sessionDate = new Date(session.timestamp);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
    });
    
    // Recalculate total minutes
    totalFocusMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
}

// Update stats display
function updateStats() {
    todayCountSpan.textContent = todaySessions.length;
    totalTimeSpan.textContent = totalFocusMinutes;
}

// Render history
function renderHistory() {
    if (todaySessions.length === 0) {
        historyList.innerHTML = '<div class="empty-history">✨ Complete a focus session to see it here</div>';
        return;
    }
    
    historyList.innerHTML = todaySessions.map(session => `
        <div class="history-item">
            <span class="check">✓</span>
            <span>${session.duration} min focus</span>
            <span class="time">${session.time}</span>
        </div>
    `).join('');
}

// Switch between focus and break
function switchMode() {
    if (currentMode === 'focus') {
        // Focus completed! Save session and give voice message
        saveSession(focusMinutes);
        playBeep();
        speakMessage(`Session completed! Congratulations! Time to take a break for ${breakMinutes} minutes. Take a deep breath.`);
        
        // Switch to break
        currentMode = 'break';
        timeLeftSeconds = breakMinutes * 60;
        modeLabel.textContent = 'BREAK TIME ☕';
        leftSide.classList.add('break-mode');
        leftSide.classList.remove('focus-mode');
    } else {
        // Break completed
        playBeep();
        speakMessage(`Break completed! Time to focus! Let's start a new focus session for ${focusMinutes} minutes. You can do this!`);
        
        // Play 3 beeps for excitement
        setTimeout(() => playBeep(), 200);
        setTimeout(() => playBeep(), 500);
        
        // Switch to focus
        currentMode = 'focus';
        timeLeftSeconds = focusMinutes * 60;
        modeLabel.textContent = 'FOCUS TIME 🎯';
        leftSide.classList.add('focus-mode');
        leftSide.classList.remove('break-mode');
    }
    
    updateDisplay();
}

// Start timer
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    timerInterval = setInterval(() => {
        if (timeLeftSeconds <= 0) {
            switchMode();
        } else {
            timeLeftSeconds--;
            updateDisplay();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerInterval);
    speakMessage("Timer paused.");
}

// Resume timer
function resumeTimer() {
    if (isRunning) return;
    if (timeLeftSeconds <= 0) return;
    
    isRunning = true;
    timerInterval = setInterval(() => {
        if (timeLeftSeconds <= 0) {
            switchMode();
        } else {
            timeLeftSeconds--;
            updateDisplay();
        }
    }, 1000);
    speakMessage("Timer resumed.");
}

// Reset timer
function resetTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
    }
    
    currentMode = 'focus';
    timeLeftSeconds = focusMinutes * 60;
    modeLabel.textContent = 'FOCUS TIME 🎯';
    updateDisplay();
    speakMessage("Timer reset. Ready to focus?");
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('pomodoro_focus', focusMinutes);
    localStorage.setItem('pomodoro_break', breakMinutes);
}

// Save history
function saveToLocalStorage() {
    localStorage.setItem('pomodoro_history', JSON.stringify(todaySessions));
    localStorage.setItem('pomodoro_date', new Date().toDateString());
    localStorage.setItem('pomodoro_total', totalFocusMinutes);
}

// Load all data
function loadData() {
    // Load settings
    const savedFocus = localStorage.getItem('pomodoro_focus');
    const savedBreak = localStorage.getItem('pomodoro_break');
    
    if (savedFocus) {
        focusMinutes = parseInt(savedFocus);
        focusValue.textContent = focusMinutes;
    }
    if (savedBreak) {
        breakMinutes = parseInt(savedBreak);
        breakValue.textContent = breakMinutes;
    }
    
    timeLeftSeconds = focusMinutes * 60;
    
    // Load history
    const savedDate = localStorage.getItem('pomodoro_date');
    const today = new Date().toDateString();
    
    if (savedDate !== today) {
        todaySessions = [];
        totalFocusMinutes = 0;
    } else {
        const savedHistory = localStorage.getItem('pomodoro_history');
        if (savedHistory) {
            todaySessions = JSON.parse(savedHistory);
            totalFocusMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        }
        const savedTotal = localStorage.getItem('pomodoro_total');
        if (savedTotal) totalFocusMinutes = parseInt(savedTotal);
    }
}

// Initial setup
updateDisplay();
renderHistory();
updateStats();