# FitQuest - Technical Requirements Document (TRD)

## 📊 Document Overview
- **Project:** FitQuest - Gamified Fitness Tracker
- **Platform:** React Native (Android-first)
- **Timeline:** 14 days @ 2-3 hours/day (~35 hours total)
- **Budget:** $0/month (100% free-tier tooling)
- **Developer:** Solo builder with web development experience
- **AI Tooling Context:** Optimized for Claude, Cursor, and Bolt workflows
- **Build Philosophy:** Simple, standard patterns AI tools understand well

## 🏗️ System Architecture
```text
┌─────────────────┐
│  React Native   │ ← User Interface (Android App)
│   (Expo Go)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Supabase      │ ← Backend as a Service (BaaS)
│  - Auth         │   • Authentication (Email + Google)
│  - PostgreSQL   │   • Database (users, workouts, friends)
│  - Storage      │   • Avatar images (optional/auto-generated)
│  - Realtime     │   • Not used in MVP (refresh-based)
└─────────────────┘
         │
         ↓
┌─────────────────┐
│  External APIs  │
│  - DiceBear     │ ← Auto-generated avatars (free)
│  - Expo Notif.  │ ← Local notifications (optional)
└─────────────────┘
```

### Data Flow
1. App open → Supabase session/auth token validation.
2. Workout log submit → write workout row → recalculate XP/stats → persist profile updates.
3. Leaderboard load → query user + friends → sort by XP.
4. Friend add by code → lookup user by `friend_code` → create friendship rows.

## 🛠️ Technology Stack
| Component | Technology | Why |
|---|---|---|
| Framework | React Native + Expo SDK 52 | Fast Android delivery with no native setup |
| Language | TypeScript | Type safety and better AI-generated code quality |
| Build Tooling | Expo Managed Workflow | Zero-config startup and cloud build support |
| Backend | Supabase (free tier) | Auth + Postgres + Storage in one service |
| Database | PostgreSQL (Supabase) | Relational model fits users/workouts/friends |
| Authentication | Supabase Auth | Email/password + Google OAuth |
| UI Kit | React Native Paper | Mature Material components, quick velocity |
| Styling | NativeWind | Tailwind-like utility workflow in RN |
| Navigation | React Navigation v6 | Standard tabs + stack routing |
| Animations | Reanimated | Smooth UI-thread animations |
| Icons | `@expo/vector-icons` | Included in Expo and extensive icon set |
| Avatars | DiceBear API | Free, deterministic avatar generation |
| State | React Context + AsyncStorage | Simple MVP approach, lightweight |
| Dates | `date-fns` | Familiar and lightweight date utility |
| Analytics | Supabase dashboard | Free observability for MVP-scale usage |
| Error Tracking | Console + Expo dev tools | Good enough before production scale |
| Deployment | Expo EAS Build (free) | Cloud Android APK builds |

### Explicit Non-Goals (for MVP simplicity)
- No Redux/MobX
- No GraphQL
- No custom native modules
- No non-standard animation framework beyond Reanimated

## 🗄️ Database Schema

### `users`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | Supabase user id |
| email | text | UNIQUE, NOT NULL | Login identity |
| username | text | UNIQUE, NOT NULL | 3-20 chars |
| friend_code | text | UNIQUE, NOT NULL | `FIT-XXXX` |
| total_xp | integer | DEFAULT 0 | Aggregate XP |
| current_level | integer | DEFAULT 0 | Derived from XP |
| total_workouts | integer | DEFAULT 0 | Workout count |
| total_hours | decimal(10,2) | DEFAULT 0.0 | Total workout hours |
| current_streak | integer | DEFAULT 0 | Consecutive workout days |
| longest_streak | integer | DEFAULT 0 | Max streak |
| last_workout_date | date | NULL | Streak calc anchor |
| workout_log_public | boolean | DEFAULT false | Privacy toggle |
| created_at | timestamptz | DEFAULT now() | Audit |
| updated_at | timestamptz | DEFAULT now() | Audit |

**Indexes**
- `idx_users_friend_code` on `friend_code`
- `idx_users_total_xp` on `total_xp DESC`

### `workouts`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | Auto-generated |
| user_id | uuid | FK → users.id | Owner |
| workout_type | text | NOT NULL | `gym`, `cardio`, `custom` |
| duration | integer | NOT NULL | Minutes |
| workout_date | date | NOT NULL | Workout day |
| notes | text | NULL | Max 100 chars in app |
| xp_earned | integer | NOT NULL | Calculated on submit |
| created_at | timestamptz | DEFAULT now() | Insert time |

**Index**
- `idx_workouts_user_date` on `(user_id, workout_date DESC)`

### `friendships`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | Auto-generated |
| user_id | uuid | FK → users.id | Initiator |
| friend_id | uuid | FK → users.id | Friend |
| created_at | timestamptz | DEFAULT now() | Audit |

**Constraints/Indexes**
- UNIQUE `(user_id, friend_id)`
- `idx_friendships_user` on `user_id`
- `idx_friendships_friend` on `friend_id`

### `achievements`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | Auto-generated |
| user_id | uuid | FK → users.id | Badge owner |
| badge_id | text | NOT NULL | Badge key |
| unlocked_at | timestamptz | DEFAULT now() | Unlock timestamp |

**Constraints**
- UNIQUE `(user_id, badge_id)`

**MVP Badge IDs**
- `first_steps`
- `week_warrior`
- `iron_will`
- `century`
- `marathon`
- `streak_master`
- `level_10`

## 🔐 Supabase RLS Policy Requirements

### `users`
- SELECT: readable for leaderboard/profile visibility in friend-scoped UX
- UPDATE/DELETE: only own row (`auth.uid() = id`)

### `workouts`
- SELECT: own workouts always; friends only when owner has public logs
- INSERT/UPDATE/DELETE: own rows only

### `friendships`
- SELECT: own relationships
- INSERT/DELETE: own relationship rows only

### `achievements`
- SELECT: own + friends where relevant for profile display
- INSERT: controlled by trusted app/server-side logic

## 🔌 API / Query Contract (Supabase)
1. **Sign Up** via `supabase.auth.signUp()`
2. **Sign In (email)** via `supabase.auth.signInWithPassword()`
3. **Sign In (Google)** via `supabase.auth.signInWithOAuth({ provider: 'google' })`
4. **Sign Out** via `supabase.auth.signOut()`
5. **Get User Profile**: `SELECT * FROM users WHERE id = :user_id`
6. **Get Leaderboard**: user + bidirectional friends, ordered by `total_xp DESC`
7. **Log Workout**: insert workout + update user stats + evaluate level and badges
8. **Get Recent Workouts**: top 5 workouts by date/created_at
9. **Add Friend**: find by friend code; insert both relationship directions
10. **Get Friends List**: join friendships and users, ordered by last activity
11. **Get Friend Profile**: include recent workouts only if `workout_log_public = true`
12. **Get Achievements**: fetch unlocked badges by timestamp desc
13. **Toggle Privacy**: update `workout_log_public`
14. **Update Username**: validated update with uniqueness check

## 🧮 App-Side Logic Requirements

```ts
function calculateXP(workoutType: 'gym'|'cardio'|'custom', duration: number): number {
  const rates = { gym: 10, cardio: 8, custom: 7 };
  const blocks = Math.ceil(duration / 15);
  return blocks * rates[workoutType];
}

function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 100);
}

function getNextLevelXP(currentLevel: number): number {
  return (currentLevel + 1) * 100;
}
```

- Streak logic: same day = unchanged, +1 day = increment, else reset to 1.
- Badge logic: evaluate deterministic rules and insert only missing badges.
- Friend code generation: `FIT-` + 4 chars from unambiguous alphabet (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`).

## 🔒 Security, Validation, and Rate Limits

### Security
- Passwords handled by Supabase auth security defaults.
- Session token persistence via AsyncStorage.
- RLS enforced on all user-generated data tables.

### Input Validation
- Username: 3-20 chars, `[A-Za-z0-9_]+`, unique
- Duration: integer 1-600
- Notes: ≤100 chars
- Friend code: strict `FIT-XXXX` uppercase format

### App-Side Throttling
- Log workout: max 1 request / 5 seconds
- Add friend: max 5 requests / minute
- Leaderboard refresh: max 1 request / 10 seconds

## 🚀 Deployment Strategy

### Phase 1: Supabase Setup (Day 1)
- Create project, store URL + anon key
- Enable Google OAuth
- Run schema + RLS SQL
- Validate with sample data

### Phase 2: App Setup (Days 1-2)
- Create Expo TS app
- Install dependencies
- Configure environment and Supabase client
- Verify on physical Android device via Expo Go

### Phase 3: Development (Days 3-12)
- Auth flows
- Dashboard + navigation
- Workout logging + XP/level updates
- Friends + leaderboard
- Achievements + animations

### Phase 4: Build & Test (Days 13-14)
- Configure EAS build
- Produce Android preview APK
- Device test + friend validation
- Bugfix and rebuild

### Sharing Strategy
- Distribute APK directly for MVP tests, or
- Use Expo Go during active local dev sessions

## 📊 Performance Requirements
- Cold launch: < 3s
- Screen navigation: < 300ms perceived
- Workout submit: < 2s
- Leaderboard load: < 3s
- Animation target: 60 FPS (Reanimated)

### Offline Behavior (Low Priority)
- Cache last leaderboard payload in AsyncStorage
- Render cached state with “last updated” timestamp

## 💰 Cost Expectations
- Target operating cost: **$0/month** for MVP validation cohort (10-20 users)
- Supabase free tier should remain sufficient until substantial growth
- Upgrade trigger: sustained usage nearing free tier limits (active users, DB size, bandwidth)
