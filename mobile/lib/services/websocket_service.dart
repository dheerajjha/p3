import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class WebSocketService {
  static const String wsUrl = 'ws://localhost:7350/mobile';
  static const _storage = FlutterSecureStorage();

  WebSocketChannel? _channel;
  StreamController<Map<String, dynamic>>? _messageController;
  bool _isConnected = false;
  Timer? _reconnectTimer;
  String? _token;

  Stream<Map<String, dynamic>> get messageStream =>
      _messageController!.stream;

  bool get isConnected => _isConnected;

  Future<void> connect() async {
    _token = await _storage.read(key: 'auth_token');

    if (_token == null) {
      throw Exception('No auth token found');
    }

    _messageController = StreamController<Map<String, dynamic>>.broadcast();

    try {
      // Pass token as query parameter for WebSocket connection
      final uri = Uri.parse('$wsUrl?token=$_token');
      _channel = WebSocketChannel.connect(uri);

      _isConnected = true;

      // Listen to messages
      _channel!.stream.listen(
        (data) {
          try {
            final message = jsonDecode(data as String) as Map<String, dynamic>;
            _messageController!.add(message);
          } catch (e) {
            print('Error parsing WebSocket message: $e');
          }
        },
        onError: (error) {
          print('WebSocket error: $error');
          _handleDisconnect();
        },
        onDone: () {
          print('WebSocket connection closed');
          _handleDisconnect();
        },
      );
    } catch (e) {
      print('WebSocket connection failed: $e');
      _handleDisconnect();
    }
  }

  void _handleDisconnect() {
    _isConnected = false;

    // Attempt reconnect after 5 seconds
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      print('Attempting to reconnect...');
      connect();
    });
  }

  void send(Map<String, dynamic> data) {
    if (_isConnected && _channel != null) {
      _channel!.sink.add(jsonEncode(data));
    }
  }

  void disconnect() {
    _reconnectTimer?.cancel();
    _isConnected = false;
    _channel?.sink.close();
    _messageController?.close();
  }
}
