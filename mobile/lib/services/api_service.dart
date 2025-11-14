import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/user.dart';
import '../models/session.dart';
import '../models/message.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3300/api';
  static const _storage = FlutterSecureStorage();

  final Dio _dio;

  ApiService({String? token})
      : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            headers: {
              'Content-Type': 'application/json',
              if (token != null) 'Authorization': 'Bearer $token',
            },
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 30),
          ),
        ) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add token from storage if not set
          if (!options.headers.containsKey('Authorization')) {
            final token = await _storage.read(key: 'auth_token');
            if (token != null) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          // Handle token expiration
          if (error.response?.statusCode == 401) {
            await _storage.delete(key: 'auth_token');
          }
          return handler.next(error);
        },
      ),
    );
  }

  // Auth methods
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    String? name,
  }) async {
    final response = await _dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      if (name != null) 'name': name,
    });

    final token = response.data['token'] as String;
    await _storage.write(key: 'auth_token', value: token);

    return {
      'user': User.fromJson(response.data['user']),
      'token': token,
    };
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });

    final token = response.data['token'] as String;
    await _storage.write(key: 'auth_token', value: token);

    return {
      'user': User.fromJson(response.data['user']),
      'token': token,
    };
  }

  Future<User> getCurrentUser() async {
    final response = await _dio.get('/auth/me');
    return User.fromJson(response.data['user']);
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
  }

  // Session methods
  Future<List<Session>> getSessions() async {
    final response = await _dio.get('/chat/sessions');
    return (response.data['sessions'] as List)
        .map((s) => Session.fromJson(s))
        .toList();
  }

  Future<Session> createSession({String? title}) async {
    final response = await _dio.post('/chat/sessions', data: {
      if (title != null) 'title': title,
    });
    return Session.fromJson(response.data['session']);
  }

  Future<Session> getSession(String sessionId) async {
    final response = await _dio.get('/chat/history/$sessionId');
    return Session.fromJson(response.data['session']);
  }

  Future<void> deleteSession(String sessionId) async {
    await _dio.delete('/chat/sessions/$sessionId');
  }

  // Message methods
  Future<Map<String, dynamic>> sendMessage({
    String? sessionId,
    required String content,
  }) async {
    final response = await _dio.post('/chat/send', data: {
      if (sessionId != null) 'sessionId': sessionId,
      'content': content,
    });

    return {
      'sessionId': response.data['sessionId'] as String,
      'message': Message.fromJson(response.data['message']),
    };
  }

  // Token management
  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
