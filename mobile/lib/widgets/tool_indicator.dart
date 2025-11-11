import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../models/message.dart';

class ToolIndicator extends StatelessWidget {
  final ToolExecution tool;

  const ToolIndicator({
    super.key,
    required this.tool,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _getStatusColor(context).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  tool.icon,
                  style: const TextStyle(fontSize: 20),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tool.friendlyName,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                    if (tool.isRunning) ...[
                      const SizedBox(height: 4),
                      SizedBox(
                        width: 100,
                        height: 2,
                        child: LinearProgressIndicator(
                          backgroundColor: Colors.grey.shade200,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getStatusColor(context),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                if (tool.isSuccess) ...[
                  const SizedBox(width: 8),
                  Icon(
                    Icons.check_circle,
                    color: Colors.green,
                    size: 18,
                  ),
                ],
                if (tool.isError) ...[
                  const SizedBox(width: 8),
                  Icon(
                    Icons.error,
                    color: Colors.red,
                    size: 18,
                  ),
                ],
              ],
            ),
          ).animate(onPlay: (controller) => controller.repeat()).shimmer(
                duration: 1500.ms,
                color: _getStatusColor(context).withOpacity(0.3),
              ),
        ],
      ),
    );
  }

  Color _getStatusColor(BuildContext context) {
    if (tool.isSuccess) return Colors.green;
    if (tool.isError) return Colors.red;
    return Theme.of(context).primaryColor;
  }
}
