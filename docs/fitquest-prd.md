# FitQuest - Product Requirements Document

## 📊 Project Overview
- **Product Name:** FitQuest
- **Tagline:** "Level up your fitness, compete with friends"
- **Platform:** Progressive Web App (PWA) for mobile and desktop browsers
- **Timeline:** MVP in 2 weeks
- **Initial Users:** Friend circle (10-20 people) for validation testing

## 🎯 Product Vision
Transform boring workout tracking into an engaging, game-like experience where friends compete, level up, and celebrate fitness achievements together.

**Core Hook:** Every workout → XP points → Level up → Beat your friends

## 👤 Target User
### Primary Persona: "The Casual Competitor"
- **Age:** 18-35
- **Fitness Level:** Intermediate (2-4 workouts/week)
- **Pain Point:** Finds workout tracking boring and loses motivation
- **Tech Comfort:** Daily smartphone user, familiar with social apps
- **Motivation:** Wants accountability and friendly competition
- **Current Behavior:** Doesn't consistently track workouts or uses Strava inconsistently

## ✨ Core Features (MVP)

### 1) Quick Workout Logging
**Workout Types:** Gym session, Cardio, Custom  
**Required Fields:** Type, Duration (minutes), Date  
**Optional Field:** Notes (100 char max)

**Experience Requirements**
- Log time under 30 seconds from open to save
- Supports logging during or after completion

**XP Point System**
- Gym session: 10 XP per 15 minutes (rounded up)
- Cardio: 8 XP per 15 minutes
- Custom workout: 7 XP per 15 minutes
- Daily streak bonus: +5 XP for working out 3+ days in a row

### 2) Leveling System
- All users start at **Level 0 (0 XP)**
- Formula: **Level N requires (N × 100) total XP**
  - Level 1: 100 XP
  - Level 2: 200 XP
  - Level 3: 300 XP
- Max level for MVP: **50**
- Visual: XP progress bar toward next level
- Level-up animation: Confetti + "LEVEL UP!" modal

### 3) Achievement Badges (7 total)
- First Steps: Log first workout
- Week Warrior: 5 workouts in 7 days
- Iron Will: 10 total workouts
- Century: 100 total workouts
- Marathon: 20 total workout hours
- Streak Master: 7-day workout streak
- Level 10: Reach level 10

**Display**
- Badge icon grid on profile
- Locked badges shown as grayscale silhouettes

### 4) Friend System & Privacy
- Add friends via unique 6-character friend code (e.g., `FIT-A3X9`)
- Permanent friend code generated at signup
- Friend list fields: Username, current level, last workout date
- Privacy toggle for workout logs (default: private)
  - Public logs: Friends can see workout type, duration, date, notes
  - Private logs: Friends see only "Completed a workout" + XP earned
- Rankings always public: username + level + total XP

### 5) Leaderboards
- Default: "All Friends" leaderboard (self + friends)
- Sort: Total XP descending
- Per user display: rank, username, level, total XP
- Highlight current user
- Refreshes on page load
- Post-MVP: private group leaderboards

### 6) User Profile
- Username (3-20 chars, alphanumeric + underscore)
- Friend code (auto-generated, non-editable)
- Stats:
  - Current level
  - Total XP
  - Total workouts logged
  - Total hours worked out
  - Current streak
  - Longest streak
- Achievement badge section
- Privacy toggle

## 📱 Screen Inventory
1. **Welcome/Auth Screen**: logo, tagline, signup CTA, login link
2. **Signup Screen**: username, email, password (min 8), create account
3. **Login Screen**: email, password, forgot password link
4. **Home Dashboard**: level + progress, log CTA, recent workouts, streak, bottom nav
5. **Log Workout**: type, duration, date, notes, XP preview, save
6. **Leaderboard**: ranked list, top-3 podium, pull-to-refresh
7. **Friends**: friend code copy, add friend modal, friend list, profile tap-through
8. **Profile (Self)**: edit username, stat cards, badges, privacy, logout
9. **Friend Profile**: username + level, conditional stats/workouts by privacy setting

## 🔄 Key User Flows
### Flow 1: New User Onboarding
Welcome → Signup → Create account → Friend code generated → Home with first-workout empty state

### Flow 2: Logging a Workout
Home → Log Workout → Enter details → Save → XP updates + possible level-up/badge unlock animations → return home

### Flow 3: Adding a Friend
Friends → Add Friend modal → Enter code → Success state → appears in list + leaderboard inclusion

### Flow 4: Checking Leaderboard
Leaderboard → review rank changes → tap friend profile for activity context

## 📊 Success Metrics
### Week 1 Validation (10 testers)
- Activation: 8/10 create account and log first workout
- Retention: 6/10 log 3+ workouts in first week
- Engagement: Avg 5 workouts per active user
- Social: Avg 3 friends added per user

### Week 2 Product-Market Fit Signals
- Stickiness: 5+ users maintain 3-day streak
- Virality: 2+ invite users outside original circle
- Satisfaction: feedback indicates tracking feels fun

### Qualitative Success
- Founder works out more consistently
- Friends discuss rankings in group chat
- Users open app even without logging (leaderboard checks)

## 🚫 Out of Scope (MVP)
- Nutrition/calorie tracking
- Exercise-level detail (sets/reps/weight)
- Workout programs/coaching
- Wearable integrations
- Social feed/comments
- Direct messaging
- Custom group leaderboards
- Photo/video uploads
- Third-party fitness app integrations
- GPS outdoor tracking
- Push/email notifications

## 🎯 Development Phases
### Phase 1 (Days 1-3): Foundation
- React + Vite setup
- Design system and color palette
- Firebase/Supabase setup (auth + DB)
- Routing and auth flows

### Phase 2 (Days 4-8): Core Features
- Workout logging
- XP and leveling
- Profile stats
- Friend code generation and adding friends

### Phase 3 (Days 9-11): Gamification
- Achievements
- Level-up + badge animations
- Leaderboard logic
- Privacy toggle

### Phase 4 (Days 12-14): Polish & Testing
- Responsive mobile UX
- Error/loading/empty states
- Friend test session
- Bugfix + deploy (Vercel/Netlify)

## 🔐 Privacy & Safety
### Data Collected
- Username, email, password (hashed)
- Workout logs (type, duration, date, notes)
- Friend connections
- Achievement and level data

### Privacy Controls
- User workout log visibility toggle
- Rankings visible to friends
- Profiles only visible to friends
- Unfriend/remove supported

### Safety Rules
- Basic offensive username filter
- Email verification recommended for MVP
- Friend-only data visibility
- No global user search

## ✅ Definition of Done
- 3 friends can create accounts
- Each logs 3 workout types
- XP and level calculations are correct
- Friend code add flow works
- Leaderboard ranks correctly
- At least 3 badges unlockable
- Privacy toggle works
- App responsive on mobile
- No critical crashes
- Founder uses app for 3 consecutive days

## 🎨 Design System
### Colors
- Primary: `#8B5CF6`
- Secondary: `#EC4899`
- Accent: `#10B981`
- Background: `#0F172A`
- Surface: `#1E293B`
- Text Primary: `#F1F5F9`
- Text Secondary: `#94A3B8`
- Error: `#EF4444`
- Warning: `#F59E0B`
- Info: `#3B82F6`

### Typography
- Headings: Inter/Poppins (700)
- Body: Inter/Roboto (400)
- Stats Accent: Orbitron/Rajdhani

### Components
- Buttons: 8px radius, 48px height, bold, gradient primary
- Cards: dark surface, subtle border, 12px radius, soft shadow
- Inputs: dark bg, light border, focused glow in primary color
- Progress bars: purple→pink gradient, 12px, rounded
- Badges: 64×64 circular, glow when unlocked

### Animations
- Level up: 1.5s confetti + scale
- Badge unlock: fade + 360° rotate + glow pulse
- XP gain: number count-up (0.5s)
- Button press: scale to 0.95

### Icons
- Lucide React or Heroicons
- Outlined for secondary actions, filled for primary
- Badge SVG ideas: dumbbell, flame, trophy, etc.

## 🚀 Suggested Tech Stack
### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React

### Backend
- Firebase (Auth + Firestore + Hosting) for fastest MVP
- Alternative: Supabase

### Deployment
- Vercel or Netlify
