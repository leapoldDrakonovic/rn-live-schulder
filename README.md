# Scheluder - AI-Powered Productivity App

<p align="center">
  <strong>Fully AI-Powered Application</strong>
</p>

Scheluder is a modern, AI-driven productivity application built with React Native and Expo. It helps you manage tasks, goals, habits, and more with intelligent automation and smart suggestions.

## Features

### AI-Powered Task Management
- Smart task creation with natural language input
- Intelligent priority suggestions
- Automated scheduling based on your patterns

### Smart Goals
- AI-generated goal recommendations
- Progress tracking with predictive analytics
- Quarterly, monthly, and long-term goal planning

### Intelligent Habits
- Habit tracking with AI insights
- Personalized reminders based on your behavior
- Difficulty and frequency optimization

### Calendar Integration
- Smart event scheduling
- AI-powered time blocking
- Automatic task-to-calendar conversion

### Focus Mode
- AI-optimized focus sessions
- Smart break suggestions
- Productivity pattern analysis

### Analytics & Insights
- AI-generated productivity reports
- Performance predictions
- Personalized recommendations

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation (Expo Router)
- **Database**: Expo SQLite
- **UI Components**: Custom components with react-native-safe-area-context
- **Animations**: React Native Reanimated
- **Icons**: @expo/vector-icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd scheluder

# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
scheluder/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── modal.tsx          # Modal screen
│   └── ...                # Additional screens
├── src/
│   ├── features/         # Feature modules
│   │   ├── tasks/        # Task management
│   │   ├── goals/        # Goal tracking
│   │   ├── habits/       # Habit tracking
│   │   ├── calendar/     # Calendar & events
│   │   ├── notes/        # Notes
│   │   ├── analytics/    # Analytics & insights
│   │   ├── notifications/# Focus mode
│   │   └── settings/     # App settings
│   ├── components/       # Reusable UI components
│   ├── store/            # Zustand state management
│   ├── services/         # External services
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── constants/        # App constants
├── hooks/                # Global hooks
├── constants/            # Theme & constants
└── package.json
```

## AI Capabilities

This application is fully AI-powered, featuring:

- **Natural Language Processing**: Create tasks and goals using natural language
- **Smart Predictions**: AI predicts optimal times for tasks and meetings
- **Behavioral Analysis**: Learns your patterns to provide personalized insights
- **Automated Optimization**: AI continuously optimizes your schedule and priorities
- **Intelligent Reminders**: Context-aware notifications based on your habits
- **Productivity Insights**: Deep analytics powered by machine learning

## License

MIT License

---

<p align="center">
  Built with AI. Powered by Scheluder.
</p>
