import 'dart:convert';

class Message {
  final String id;
  final String sessionId;
  final String role; // 'user', 'assistant', 'system'
  final String content;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final MessageType type;
  final ToolExecution? toolExecution;

  Message({
    required this.id,
    required this.sessionId,
    required this.role,
    required this.content,
    this.metadata,
    required this.createdAt,
    this.type = MessageType.text,
    this.toolExecution,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    // Parse metadata - it might be a string (from SQLite) or already a Map
    Map<String, dynamic>? metadata;
    if (json['metadata'] != null) {
      if (json['metadata'] is String) {
        try {
          metadata = jsonDecode(json['metadata']) as Map<String, dynamic>;
        } catch (e) {
          metadata = null;
        }
      } else {
        metadata = json['metadata'] as Map<String, dynamic>?;
      }
    }

    return Message(
      id: json['id'] as String,
      sessionId: json['sessionId'] as String,
      role: json['role'] as String,
      content: json['content'] as String,
      metadata: metadata,
      createdAt: DateTime.parse(json['createdAt'] as String),
      type: MessageType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => MessageType.text,
      ),
      toolExecution: json['toolExecution'] != null
          ? ToolExecution.fromJson(json['toolExecution'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sessionId': sessionId,
      'role': role,
      'content': content,
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
      'type': type.name,
      'toolExecution': toolExecution?.toJson(),
    };
  }

  bool get isUser => role == 'user';
  bool get isAssistant => role == 'assistant';
  bool get isSystem => role == 'system';
}

enum MessageType {
  text,
  tool,
  error,
  system,
}

class ToolExecution {
  final String toolName;
  final String friendlyName;
  final String icon;
  final String status; // 'running', 'success', 'error'
  final Map<String, dynamic>? input;
  final String? output;

  ToolExecution({
    required this.toolName,
    required this.friendlyName,
    required this.icon,
    required this.status,
    this.input,
    this.output,
  });

  factory ToolExecution.fromJson(Map<String, dynamic> json) {
    return ToolExecution(
      toolName: json['tool_name'] as String,
      friendlyName: json['friendlyName'] as String,
      icon: json['icon'] as String,
      status: json['status'] as String,
      input: json['input'] as Map<String, dynamic>?,
      output: json['output'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tool_name': toolName,
      'friendlyName': friendlyName,
      'icon': icon,
      'status': status,
      'input': input,
      'output': output,
    };
  }

  bool get isRunning => status == 'running';
  bool get isSuccess => status == 'success';
  bool get isError => status == 'error';
}
