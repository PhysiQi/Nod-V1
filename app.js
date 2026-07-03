// ==========================================
// 1. SERVICE WORKER REGISTRATION
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then((reg) => {
        console.log('NOD Service Worker ready.');[span_11](start_span)[span_11](end_span)
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      });
  });
}

// ==========================================
// 2. NUDGE CONTENT LIBRARY[span_12](start_span)[span_12](end_span)
// ==========================================
const NudgeContent = {
  families: {
    global: [{ intro: "Let's take a brief pause.", cue: "Gently expand your chest and roll your shoulders back.", exit: "Return whenever you are ready." }],[span_13](start_span)[span_13](end_span)
    neck: [{ intro: "A small moment for your neck.", cue: "Slowly look over to one side, then let your gaze return forward.", exit: "Moving on smoothly." }],[span_14](start_span)[span_14](end_span)
    torso: [{ intro: "Time for a quick adjustment.", cue: "Lengthen your spine upward, letting your seat settle comfortably.", exit: "Carry this ease with you." }],[span_15](start_span)[span_15](end_span)
    mixed: [{ intro: "A fresh break.", cue: "Reach your hands forward while turning your head gently from side to side.", exit: "Gently back to your day." }][span_16](start_span)[span_16](end_span)
  },
  getRandomNudge(stateId) {
    let allowedFamilies = ['global', 'neck', 'torso'];[span_17](start_span)[span_17](end_span)
    if (stateId === 1) allowedFamilies.push('mixed'); // Mixed is State 1 only[span_18](start_span)[span_18](end_span)
    const randomFamily = allowedFamilies[Math.floor(Math.random() * allowedFamilies.length)];
    const pool = this.families[randomFamily];
    return pool[Math.floor(Math.random() * pool.length)];
  }
};

// ==========================================
// 3. DAILY STATE ENGINE[span_19](start_span)[span_19](end_span)
// ==========================================
const StateEngine = {
  STORAGE_KEY: 'nod_daily_state',
  
  calculateState(sleep, energy, stiffness) {
    const totalScore = sleep + energy + (stiffness * 1.5);[span_20](start_span)[span_20](end_span)
    if (totalScore >= 7) return { id: 1, name: 'State 1 (Preventive)' };[span_21](start_span)[span_21](end_span)
    if (totalScore <= 4.5) return { id: 3, name: 'State 3 (Gentle)' };[span_22](start_span)[span_22](end_span)
    return { id: 2, name: 'State 2 (Baseline)' }; // Border values[span_23](start_span)[span_23](end_span)
  },

  getTodayString() {
    return new Date().toISOString().split('T')[0];
  },

  saveCheckIn(sleep, energy, stiffness, isManualEdit = false) {
    const today = this.getTodayString();
    const existing = this.getTodayState();

    if (existing && existing.completed && !isManualEdit && !existing.isDefaultFallback) {
      return existing; // Locked for the day[span_24](start_span)[span_24](end_span)
    }

    const evaluation = this.calculateState(sleep, energy, stiffness);[span_25](start_span)[span_25](end_span)
    const statePayload = {
      date: today,
      completed: true,
      isDefaultFallback: false,
      assignedState: evaluation.name,
      stateId: evaluation.id
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(statePayload));
    return statePayload;
  },

  getTodayState() {
    const today = this.getTodayString();
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed;
    }
    // Default fallback to State 2 Lite if skipped[span_26](start_span)[span_26](end_span)
    const fallback = { date: today, completed: false, isDefaultFallback: true, assignedState: 'State 2 Lite', stateId: 2 };[span_27](start_span)[span_27](end_span)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

// ==========================================
// 4. SETTINGS PANEL MANAGMENT[span_28](start_span)[span_28](end_span)
// ==========================================
const NodSettings = {
  SETTINGS_KEY: 'nod_settings',
  defaults: { mode: 'character', reminderTime: '18:00', pauseUntil: null, sleepModeActive: false, sleepStart: '22:00', sleepEnd: '07:00' },[span_29](start_span)[span_29](end_span)

  init() {
    if (!localStorage.getItem(this.SETTINGS_KEY)) {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.defaults));
    }
  },
  get() { return JSON.parse(localStorage.getItem(this.SETTINGS_KEY)); },
  update(updates) { localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({ ...this.get(), ...updates })); },
  setPause(hours) { this.update({ pauseUntil: Date.now() + (hours * 60 * 60 * 1000) }); }[span_30](start_span)[span_30](end_span)
};

// ==========================================
// 5. USAGE-BASED TRIGGER ENGINE[span_31](start_span)[span_31](end_span)
// ==========================================
const TriggerEngine = {
  TWENTY_MINUTES: 20 * 60 * 1000,[span_32](start_span)[span_32](end_span)
  timerId: null,

  init() {
    this.startTracking();
    document.addEventListener('visibilitychange', () => {
      document.visibilityState === 'visible' ? this.startTracking() : this.stopTracking();[span_33](start_span)[span_33](end_span)
    });
  },
  startTracking() {
    this.stopTracking();
    this.timerId = setInterval(() => this.fireNudgeTrigger(), this.TWENTY_MINUTES);[span_34](start_span)[span_34](end_span)
  },
  stopTracking() {
    if (this.timerId) clearInterval(this.timerId);[span_35](start_span)[span_35](end_span)
  },
  fireNudgeTrigger() {
    if (this._isPausedOrSleeping()) return;[span_36](start_span)[span_36](end_span)
    
    const state = StateEngine.getTodayState();
    const nudge = NudgeContent.getRandomNudge(state.stateId);[span_37](start_span)[span_37](end_span)
    const settings = NodSettings.get();

    // 1. Attention Chime[span_38](start_span)[span_38](end_span)
    const audio = new Audio('audio/attention-chime.mp3');[span_39](start_span)[span_39](end_span)
    audio.play().catch(() => {});

    // 2. Visual presentation delay[span_40](start_span)[span_40](end_span)
    setTimeout(() => {
      const container = document.createElement('div');
      if (settings.mode === 'minimal') {[span_41](start_span)[span_41](end_span)
        container.className = 'nod-minimal-banner';[span_42](start_span)[span_42](end_span)
        container.innerHTML = `<div>${nudge.intro} • ${nudge.cue} • ${nudge.exit}</div>`;[span_43](start_span)[span_43](end_span)
      } else {
        container.className = 'nod-character-container';[span_44](start_span)[span_44](end_span)
        container.innerHTML = `
          <div class="nod-character-element glow-worm-animation"></div>
          <div class="nod-overlay-card hidden">
            <p><strong>${nudge.intro}</strong></p><p>${nudge.cue}</p><p><small>${nudge.exit}</small></p>
          </div>`;[span_45](start_span)[span_45](end_span)
        container.addEventListener('click', () => container.querySelector('.nod-overlay-card').classList.toggle('hidden'));[span_46](start_span)[span_46](end_span)
      }
      document.body.appendChild(container);
      setTimeout(() => container.remove(), settings.mode === 'minimal' ? 3000 : 5000);[span_47](start_span)[span_47](end_span)
    }, 750);[span_48](start_span)[span_48](end_span)
  },
  _isPausedOrSleeping() {
    const s = NodSettings.get();
    if (s.pauseUntil && Date.now() < s.pauseUntil) return true;[span_49](start_span)[span_49](end_span)
    if (s.sleepModeActive) {[span_50](start_span)[span_50](end_span)
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (time >= s.sleepStart || time <= s.sleepEnd) return true;[span_51](start_span)[span_51](end_span)
    }
    return false;
  }
};

// Initialize app elements on startup
NodSettings.init();
TriggerEngine.init();
