const STORAGE_KEY = 'fitquest_mvp_state_v1';

const XP_RATES = { gym: 10, cardio: 8, custom: 7 };
const BADGES = [
  { id: 'first_steps', label: 'First Steps', rule: (s) => s.totalWorkouts >= 1 },
  { id: 'week_warrior', label: 'Week Warrior', rule: (_, workouts) => countWorkoutsInLastDays(workouts, 7) >= 5 },
  { id: 'iron_will', label: 'Iron Will', rule: (s) => s.totalWorkouts >= 10 },
  { id: 'century', label: 'Century', rule: (s) => s.totalWorkouts >= 100 },
  { id: 'marathon', label: 'Marathon', rule: (s) => s.totalHours >= 20 },
  { id: 'streak_master', label: 'Streak Master', rule: (s) => s.currentStreak >= 7 },
  { id: 'level_10', label: 'Level 10', rule: (s) => s.level >= 10 },
];

const state = loadState();

const el = {
  form: document.getElementById('workout-form'),
  type: document.getElementById('workout-type'),
  duration: document.getElementById('duration'),
  date: document.getElementById('workout-date'),
  notes: document.getElementById('notes'),
  xpPreview: document.getElementById('xp-preview'),
  saveMessage: document.getElementById('save-message'),
  badgeUnlocks: document.getElementById('badge-unlocks'),
  leaderboard: document.getElementById('leaderboard-list'),
  recentWorkouts: document.getElementById('recent-workouts'),
  achievements: document.getElementById('achievement-grid'),
  privacyToggle: document.getElementById('privacy-toggle'),
  privacyStatus: document.getElementById('privacy-status'),
  friendCode: document.getElementById('friend-code'),
  profileUsername: document.getElementById('profile-username'),
  totalXP: document.getElementById('total-xp'),
  currentLevel: document.getElementById('current-level'),
  currentStreak: document.getElementById('current-streak'),
  totalWorkouts: document.getElementById('total-workouts'),
  heroLevel: document.getElementById('hero-level'),
  heroXP: document.getElementById('hero-xp'),
  heroProgressBar: document.getElementById('hero-progress-bar'),
  heroNext: document.getElementById('hero-next'),
  heroStreak: document.getElementById('hero-streak'),
  heroWorkouts: document.getElementById('hero-workouts'),
  heroHours: document.getElementById('hero-hours'),
  resetBtn: document.getElementById('reset-btn'),
};

init();

function init() {
  if (!state.workouts.length) {
    el.date.value = todayISO();
  } else {
    el.date.value = state.workouts[0].workoutDate;
  }

  el.privacyToggle.checked = state.workoutLogPublic;
  el.profileUsername.textContent = state.username;
  el.friendCode.textContent = state.friendCode;

  el.type.addEventListener('change', updatePreview);
  el.duration.addEventListener('input', updatePreview);
  el.form.addEventListener('submit', saveWorkout);
  el.privacyToggle.addEventListener('change', () => {
    state.workoutLogPublic = el.privacyToggle.checked;
    persist();
    render();
  });
  el.resetBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  updatePreview();
  render();
}

function loadState() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return JSON.parse(existing);

  return {
    username: 'you',
    friendCode: generateFriendCode(),
    workoutLogPublic: false,
    totalXP: 0,
    level: 0,
    totalWorkouts: 0,
    totalHours: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    workouts: [],
    achievements: [],
  };
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updatePreview() {
  const duration = Number(el.duration.value);
  const type = el.type.value;
  if (!Number.isFinite(duration) || duration < 1) {
    el.xpPreview.textContent = 'Enter a valid duration to preview XP.';
    return;
  }
  const xp = calculateXP(type, duration);
  el.xpPreview.textContent = `This workout will earn ~${xp} XP`;
}

function saveWorkout(event) {
  event.preventDefault();
  const type = el.type.value;
  const duration = Number(el.duration.value);
  const workoutDate = el.date.value;
  const notes = el.notes.value.trim();

  if (!workoutDate) {
    el.saveMessage.textContent = 'Please pick a workout date.';
    return;
  }

  if (!Number.isFinite(duration) || duration < 1 || duration > 600) {
    el.saveMessage.textContent = 'Duration must be between 1 and 600 minutes.';
    return;
  }

  const xp = calculateXP(type, duration);
  const streak = updateStreak(state.lastWorkoutDate, workoutDate, state.currentStreak);
  const streakBonus = streak >= 3 && !hasWorkoutOnDate(state.workouts, workoutDate) ? 5 : 0;
  const totalEarned = xp + streakBonus;

  const previousLevel = state.level;

  state.workouts.unshift({ type, duration, workoutDate, notes, xpEarned: totalEarned });
  state.totalXP += totalEarned;
  state.level = calculateLevel(state.totalXP);
  state.totalWorkouts += 1;
  state.totalHours = roundToOneDecimal(state.totalHours + duration / 60);
  state.currentStreak = streak;
  state.longestStreak = Math.max(state.longestStreak, streak);
  state.lastWorkoutDate = maxDate(state.lastWorkoutDate, workoutDate);

  const newlyUnlocked = unlockBadges();
  persist();
  render();

  const parts = [`Saved! +${totalEarned} XP`];
  if (streakBonus) parts.push('(includes +5 streak bonus)');
  if (state.level > previousLevel) parts.push(`🎉 Level up to ${state.level}!`);
  el.saveMessage.textContent = parts.join(' ');

  renderBadgeChips(newlyUnlocked);
  el.notes.value = '';
}

function render() {
  el.totalXP.textContent = String(state.totalXP);
  el.currentLevel.textContent = String(state.level);
  el.currentStreak.textContent = `${state.currentStreak} days`;
  el.totalWorkouts.textContent = String(state.totalWorkouts);

  el.heroLevel.textContent = `Level ${state.level}`;
  el.heroXP.textContent = `${state.totalXP} XP`;
  el.heroStreak.textContent = String(state.currentStreak);
  el.heroWorkouts.textContent = String(state.totalWorkouts);
  el.heroHours.textContent = state.totalHours.toFixed(1);

  const currentLevelXP = state.level * 100;
  const nextLevelXP = (state.level + 1) * 100;
  const withinLevel = state.totalXP - currentLevelXP;
  const neededThisLevel = nextLevelXP - currentLevelXP;
  const pct = neededThisLevel === 0 ? 100 : Math.min(100, Math.round((withinLevel / neededThisLevel) * 100));

  el.heroProgressBar.style.width = `${pct}%`;
  el.heroNext.textContent = `${Math.max(0, nextLevelXP - state.totalXP)} XP to Level ${state.level + 1}`;

  el.privacyStatus.textContent = state.workoutLogPublic
    ? 'Your workout details are visible to friends.'
    : 'Your workout details are private.';

  renderRecentWorkouts();
  renderLeaderboard();
  renderAchievements();
}

function renderRecentWorkouts() {
  el.recentWorkouts.innerHTML = '';
  const recent = state.workouts.slice(0, 5);
  if (!recent.length) {
    el.recentWorkouts.innerHTML = '<li class="muted">No workouts yet. Log your first one.</li>';
    return;
  }

  for (const workout of recent) {
    const li = document.createElement('li');
    const detail = state.workoutLogPublic && workout.notes ? ` · ${escapeHtml(workout.notes)}` : '';
    li.innerHTML = `<strong>${labelForType(workout.type)}</strong> · ${workout.duration} min · +${workout.xpEarned} XP · ${workout.workoutDate}${detail}`;
    el.recentWorkouts.appendChild(li);
  }
}

function renderLeaderboard() {
  const friends = [
    { username: 'mia_fit', totalXP: 470 },
    { username: 'sam_lifts', totalXP: 390 },
    { username: 'jules_run', totalXP: 280 },
    { username: 'alex_core', totalXP: 190 },
  ];

  const users = [
    ...friends.map((f) => ({ ...f, level: calculateLevel(f.totalXP), you: false })),
    { username: state.username, totalXP: state.totalXP, level: state.level, you: true },
  ].sort((a, b) => b.totalXP - a.totalXP);

  el.leaderboard.innerHTML = '';
  users.forEach((user, index) => {
    const li = document.createElement('li');
    if (user.you) li.classList.add('you-row');
    li.innerHTML = `<span class="rank">#${index + 1}</span><strong>@${user.username}</strong><span>Lvl ${user.level}</span><span>${user.totalXP} XP</span>`;
    el.leaderboard.appendChild(li);
  });
}

function renderAchievements() {
  el.achievements.innerHTML = '';
  BADGES.forEach((badge) => {
    const div = document.createElement('div');
    const unlocked = state.achievements.includes(badge.id);
    div.className = `badge${unlocked ? ' unlocked' : ''}`;
    div.textContent = unlocked ? `✅ ${badge.label}` : `🔒 ${badge.label}`;
    el.achievements.appendChild(div);
  });
}

function renderBadgeChips(ids) {
  el.badgeUnlocks.innerHTML = '';
  ids.forEach((id) => {
    const badge = BADGES.find((b) => b.id === id);
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = `Unlocked: ${badge.label}`;
    el.badgeUnlocks.appendChild(chip);
  });
}

function unlockBadges() {
  const unlocked = [];
  for (const badge of BADGES) {
    if (state.achievements.includes(badge.id)) continue;
    if (badge.rule(state, state.workouts)) {
      state.achievements.push(badge.id);
      unlocked.push(badge.id);
    }
  }
  return unlocked;
}

function calculateXP(workoutType, duration) {
  const blocks = Math.ceil(duration / 15);
  return blocks * XP_RATES[workoutType];
}

function calculateLevel(totalXP) {
  return Math.floor(totalXP / 100);
}

function updateStreak(lastWorkoutDate, nextWorkoutDate, currentStreak) {
  if (!lastWorkoutDate) return 1;

  const diff = dayDiff(lastWorkoutDate, nextWorkoutDate);
  if (diff === 0) return currentStreak;
  if (diff === 1) return currentStreak + 1;
  if (diff > 1) return 1;
  return currentStreak;
}

function dayDiff(fromISO, toISO) {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function hasWorkoutOnDate(workouts, date) {
  return workouts.some((w) => w.workoutDate === date);
}

function labelForType(type) {
  return { gym: 'Gym', cardio: 'Cardio', custom: 'Custom' }[type] || 'Workout';
}

function maxDate(a, b) {
  if (!a) return b;
  return a > b ? a : b;
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function countWorkoutsInLastDays(workouts, days) {
  const now = new Date(`${todayISO()}T00:00:00`);
  return workouts.filter((w) => {
    const dt = new Date(`${w.workoutDate}T00:00:00`);
    const diff = Math.round((now - dt) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff < days;
  }).length;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function generateFriendCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FIT-';
  for (let i = 0; i < 4; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
