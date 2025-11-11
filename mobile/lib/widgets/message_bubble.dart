import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../models/message.dart';
import '../theme/app_theme.dart';

class MessageBubble extends StatelessWidget {
  final Message message;

  const MessageBubble({
    super.key,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
              child: Icon(
                Icons.smart_toy_outlined,
                size: 18,
                color: Theme.of(context).primaryColor,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
              decoration: BoxDecoration(
                color: isUser
                    ? (isDark
                        ? AppTheme.userMessageDark
                        : AppTheme.userMessageLight)
                    : (isDark
                        ? AppTheme.assistantMessageDark
                        : AppTheme.assistantMessageLight),
                borderRadius: BorderRadius.circular(16),
              ),
              child: message.type == MessageType.text
                  ? MarkdownBody(
                      data: message.content,
                      styleSheet: MarkdownStyleSheet(
                        p: TextStyle(
                          color: isUser
                              ? Colors.white
                              : (isDark ? Colors.white : Colors.black87),
                          fontSize: 15,
                        ),
                        code: TextStyle(
                          backgroundColor: Colors.black.withOpacity(0.1),
                          fontFamily: 'monospace',
                        ),
                      ),
                    )
                  : Text(
                      message.content,
                      style: TextStyle(
                        color: isUser
                            ? Colors.white
                            : (isDark ? Colors.white : Colors.black87),
                        fontSize: 15,
                      ),
                    ),
            ),
          )
              .animate()
              .fadeIn(duration: 300.ms)
              .slideY(begin: 0.2, end: 0, duration: 300.ms),
          if (isUser) ...[
            const SizedBox(width: 8),
            CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.primaryLight.withOpacity(0.2),
              child: Icon(
                Icons.person_outline,
                size: 18,
                color: Theme.of(context).primaryColor,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
