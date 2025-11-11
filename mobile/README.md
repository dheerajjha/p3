# Claude Mobile - Flutter App

Beautiful, beginner-friendly mobile interface for Claude Code.

## Overview

A modern Flutter app that provides an intuitive chat interface for interacting with Claude AI. Designed to abstract technical complexity and provide a delightful user experience for both beginners and experienced developers.

## Features

- **Beautiful UI/UX**: Modern, clean interface with smooth animations
- **Beginner-Friendly**: Simple, conversational interface with friendly language
- **Real-time Streaming**: Live updates as Claude processes your requests
- **Tool Visualization**: Visual indicators for file operations and commands
- **Dark/Light Themes**: Automatic theme switching based on system preferences
- **Secure Authentication**: JWT-based auth with secure token storage
- **Chat History**: Browse and resume previous conversations
- **Offline Support**: (Coming soon)

## Tech Stack

- **Flutter 3.x**: Cross-platform mobile framework
- **Riverpod**: State management
- **Dio**: HTTP client
- **WebSocket**: Real-time communication
- **Flutter Markdown**: Rich text rendering
- **Flutter Animate**: Smooth animations
- **Google Fonts**: Beautiful typography

## Installation

### Prerequisites

- Flutter SDK 3.0 or higher
- Dart SDK 3.0 or higher
- iOS: Xcode 14+ (for iOS development)
- Android: Android Studio with SDK 21+ (for Android development)

### Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
# iOS
flutter run -d ios

# Android
flutter run -d android

# Specific device
flutter devices
flutter run -d <device-id>
```

## Configuration

### Backend URL

Update the backend URL in `lib/services/api_service.dart` and `lib/services/websocket_service.dart`:

```dart
// api_service.dart
static const String baseUrl = 'http://your-backend-url:3000/api';

// websocket_service.dart
static const String wsUrl = 'ws://your-backend-url:3000/mobile';
```

For production, use environment variables or build-time configuration.

## Project Structure

```
mobile/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── models/                   # Data models
│   │   ├── message.dart
│   │   ├── session.dart
│   │   └── user.dart
│   ├── providers/                # State management (Riverpod)
│   │   ├── auth_provider.dart
│   │   └── chat_provider.dart
│   ├── screens/                  # UI screens
│   │   ├── splash_screen.dart
│   │   ├── auth/
│   │   │   └── login_screen.dart
│   │   └── home/
│   │       ├── home_screen.dart
│   │       ├── chat_screen.dart
│   │       ├── sessions_screen.dart
│   │       └── settings_screen.dart
│   ├── services/                 # API & WebSocket
│   │   ├── api_service.dart
│   │   └── websocket_service.dart
│   ├── theme/                    # App theming
│   │   └── app_theme.dart
│   └── widgets/                  # Reusable widgets
│       ├── message_bubble.dart
│       ├── tool_indicator.dart
│       └── typing_indicator.dart
└── pubspec.yaml                  # Dependencies
```

## UI/UX Design

### Design Philosophy

**Beginner-Friendly Language:**
- Technical jargon → Friendly terms
- "Tool execution" → "Working on it..."
- "File write operation" → "Creating file..."
- "Error: ENOENT" → "Oops! I couldn't find that file."

**Visual Feedback:**
- Typing indicators with smooth animations
- Tool execution with icons and progress
- Color-coded message bubbles
- Smooth transitions and micro-interactions

### Color Scheme

**Light Theme:**
- Primary: Indigo (#6366F1)
- Background: Light gray (#FAFAFA)
- User messages: Indigo gradient
- Assistant messages: Light gray

**Dark Theme:**
- Primary: Lighter indigo (#818CF8)
- Background: Dark (#121212)
- User messages: Lighter indigo
- Assistant messages: Dark gray

### Typography

- Font: Inter (via Google Fonts)
- Headings: Bold weights
- Body: Regular weights
- Code: Monospace

## Screens

### 1. Splash Screen
- Animated logo
- Auto-navigation based on auth status

### 2. Login/Register
- Email/password authentication
- Form validation
- Error handling with friendly messages
- Smooth animations

### 3. Chat Screen
- Message list with auto-scroll
- Markdown support for rich text
- Code syntax highlighting
- Tool execution indicators
- Typing animations
- Message input with send button

### 4. History Screen
- List of previous chats
- Search and filter
- Resume conversations
- Delete chats

### 5. Settings Screen
- User profile
- Theme preferences
- Notification settings
- About & help
- Sign out

## State Management

Using **Riverpod** for clean, testable state management:

```dart
// Providers
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>
final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>

// Usage in widgets
final authState = ref.watch(authProvider);
ref.read(chatProvider.notifier).sendMessage(content);
```

## WebSocket Communication

Real-time updates from backend:

```dart
// Connect
await websocketService.connect();

// Listen to messages
websocketService.messageStream.listen((message) {
  // Handle message, tool execution, errors, etc.
});

// Disconnect
websocketService.disconnect();
```

## Building for Production

### iOS

1. Update bundle identifier in `ios/Runner.xcworkspace`
2. Configure signing in Xcode
3. Build:
```bash
flutter build ios --release
```

### Android

1. Update package name in `android/app/build.gradle`
2. Generate keystore for signing
3. Build:
```bash
flutter build apk --release
# or
flutter build appbundle --release
```

## Testing

```bash
# Run tests
flutter test

# Run integration tests
flutter test integration_test/

# Code coverage
flutter test --coverage
```

## Future Enhancements

- [ ] Voice input/output
- [ ] Code snippet sharing
- [ ] Offline mode with sync
- [ ] Multi-workspace support
- [ ] Collaborative sessions
- [ ] Custom themes
- [ ] Widgets for quick access
- [ ] iPad/tablet optimization
- [ ] File browser integration

## Troubleshooting

### Build Issues

If you encounter build issues:

```bash
flutter clean
flutter pub get
flutter run
```

### WebSocket Connection Issues

- Check backend URL configuration
- Ensure backend is running
- Check network connectivity
- Review authentication token

### Authentication Issues

- Clear app data and re-login
- Check backend API key configuration
- Verify token expiration settings

## License

MIT
