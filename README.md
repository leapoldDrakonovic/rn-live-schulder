# Scheluder - Personal Productivity App

A personal productivity application for iOS and Android built with React Native and Expo. Manage tasks, habits, goals, and track your finances all in one place.

## Features

### Tasks
- Create and manage tasks with priorities (low, medium, high, critical)
- Set due dates and reminders
- Organize with subtasks
- Filter by today, tomorrow, week, overdue, or no date

### Calendar
- Schedule events with start/end times
- Categorize events (work, personal, health, social)
- Time blocking for focused work sessions

### Habits
- Track daily and weekly habits
- Keep track of streaks
- Set difficulty levels (easy, medium, hard)

### Goals
- Set yearly, quarterly, monthly, or long-term goals
- Break goals into milestones
- Track progress percentage

### Notes
- Quick notes linked to tasks and goals
- Tag-based organization

### Finance
- Track income and expenses
- Organize by categories
- View analytics and spending patterns
- Monthly budget tracking

### Focus Mode
- Pomodoro-style focus sessions
- Track time spent on tasks

## Tech Stack

- React Native with Expo
- TypeScript
- Zustand for state management
- Expo Router for navigation
- Expo SQLite for local database
- React Native Reanimated for animations

## Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Project Structure

```
src/
├── features/          # Feature modules
│   ├── tasks/       # Task management
│   ├── habits/      # Habit tracking
│   ├── goals/       # Goal tracking
│   ├── calendar/    # Calendar & events
│   ├── notes/       # Notes
│   ├── finance/     # Finance module
│   └── ...
├── store/            # Zustand state management
├── database/        # SQLite database operations
├── types/           # TypeScript interfaces
└── ...
```

## Database

The app uses SQLite for local data persistence. All data is stored on-device.

## License

MIT
