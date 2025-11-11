import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/message.dart';
import '../models/session.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';
import 'auth_provider.dart';

final websocketProvider = Provider<WebSocketService>((ref) {
  return WebSocketService();
});

final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(
    ref.read(apiServiceProvider),
    ref.read(websocketProvider),
  );
});

class ChatState {
  final Session? currentSession;
  final List<Message> messages;
  final bool isLoading;
  final bool isSending;
  final String? error;
  final bool isTyping;
  final ToolExecution? currentTool;

  ChatState({
    this.currentSession,
    this.messages = const [],
    this.isLoading = false,
    this.isSending = false,
    this.error,
    this.isTyping = false,
    this.currentTool,
  });

  ChatState copyWith({
    Session? currentSession,
    List<Message>? messages,
    bool? isLoading,
    bool? isSending,
    String? error,
    bool? isTyping,
    ToolExecution? currentTool,
  }) {
    return ChatState(
      currentSession: currentSession ?? this.currentSession,
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
      error: error,
      isTyping: isTyping ?? this.isTyping,
      currentTool: currentTool,
    );
  }
}

class ChatNotifier extends StateNotifier<ChatState> {
  final ApiService _api;
  final WebSocketService _ws;

  ChatNotifier(this._api, this._ws) : super(ChatState()) {
    _initWebSocket();
  }

  void _initWebSocket() async {
    await _ws.connect();

    _ws.messageStream.listen((message) {
      _handleWebSocketMessage(message);
    });
  }

  void _handleWebSocketMessage(Map<String, dynamic> message) {
    final type = message['type'] as String;

    switch (type) {
      case 'message':
        _handleMessageUpdate(message);
        break;
      case 'tool_execution':
        _handleToolUpdate(message);
        break;
      case 'error':
        _handleErrorUpdate(message);
        break;
      case 'complete':
        _handleCompleteUpdate();
        break;
    }
  }

  void _handleMessageUpdate(Map<String, dynamic> update) {
    final data = update['data'] as Map<String, dynamic>;

    if (data['role'] == 'assistant') {
      state = state.copyWith(isTyping: false);

      final message = Message(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        sessionId: state.currentSession!.id,
        role: 'assistant',
        content: data['content'] as String,
        createdAt: DateTime.now(),
        type: MessageType.text,
      );

      state = state.copyWith(
        messages: [...state.messages, message],
      );
    }
  }

  void _handleToolUpdate(Map<String, dynamic> update) {
    final data = update['data'] as Map<String, dynamic>;
    final tool = ToolExecution.fromJson(data);

    state = state.copyWith(
      currentTool: tool,
      isTyping: true,
    );
  }

  void _handleErrorUpdate(Map<String, dynamic> update) {
    final errorMessage = update['message'] as String;

    state = state.copyWith(
      error: errorMessage,
      isTyping: false,
      isSending: false,
    );
  }

  void _handleCompleteUpdate() {
    state = state.copyWith(
      isTyping: false,
      isSending: false,
      currentTool: null,
    );
  }

  Future<void> loadSession(String sessionId) async {
    state = state.copyWith(isLoading: true);

    try {
      final session = await _api.getSession(sessionId);
      state = state.copyWith(
        currentSession: session,
        messages: session.messages,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> createNewSession({String? title}) async {
    state = state.copyWith(isLoading: true);

    try {
      final session = await _api.createSession(title: title);
      state = state.copyWith(
        currentSession: session,
        messages: [],
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> sendMessage(String content) async {
    if (content.trim().isEmpty) return;

    state = state.copyWith(isSending: true, isTyping: true);

    try {
      // Add user message optimistically
      final userMessage = Message(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        sessionId: state.currentSession?.id ?? '',
        role: 'user',
        content: content,
        createdAt: DateTime.now(),
        type: MessageType.text,
      );

      state = state.copyWith(
        messages: [...state.messages, userMessage],
      );

      // Send to backend
      final result = await _api.sendMessage(
        sessionId: state.currentSession?.id,
        content: content,
      );

      // Update session ID if new
      if (state.currentSession == null) {
        final session = await _api.getSession(result['sessionId'] as String);
        state = state.copyWith(currentSession: session);
      }

      // WebSocket will handle assistant's response
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isSending: false,
        isTyping: false,
      );
    }
  }

  @override
  void dispose() {
    _ws.disconnect();
    super.dispose();
  }
}
