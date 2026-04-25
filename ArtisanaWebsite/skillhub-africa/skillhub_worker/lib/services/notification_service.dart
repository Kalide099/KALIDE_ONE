import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;

  NotificationService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    // Request permission for iOS
    await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Initialize local notifications
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
        );

    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      settings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_onMessageReceived);

    // Handle notification taps when app is in background
    FirebaseMessaging.onMessageOpenedApp.listen(_onMessageOpenedApp);

    // Get FCM token
    final token = await _firebaseMessaging.getToken();
    debugPrint('FCM Token: $token');

    // Send token to backend
    if (token != null) {
      await _sendTokenToServer(token);
    }

    // Listen for token refresh
    _firebaseMessaging.onTokenRefresh.listen(_sendTokenToServer);
  }

  Future<String?> getFCMToken() async {
    return await _firebaseMessaging.getToken();
  }

  Future<void> _sendTokenToServer(String token) async {
    // TODO: Implement API call to send FCM token to backend
    debugPrint('Sending FCM token to server: $token');
    // await ApiService().updateFCMToken(token);
  }

  void _onMessageReceived(RemoteMessage message) {
    debugPrint('Received foreground message: ${message.notification?.title}');

    if (message.notification != null) {
      _showLocalNotification(
        title: message.notification!.title ?? 'Notification',
        body: message.notification!.body ?? '',
        payload: message.data.toString(),
      );
    }
  }

  void _onMessageOpenedApp(RemoteMessage message) {
    debugPrint(
      'Message opened from background: ${message.notification?.title}',
    );
    // Handle navigation based on message data
    _handleNotificationNavigation(message.data);
  }

  void _onNotificationTapped(NotificationResponse response) {
    debugPrint('Notification tapped: ${response.payload}');
    if (response.payload != null) {
      // Parse payload and navigate
      final data = _parsePayload(response.payload!);
      _handleNotificationNavigation(data);
    }
  }

  Future<void> _showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
          'skillhub_worker_channel',
          'SkillHub Worker Notifications',
          channelDescription: 'Notifications for SkillHub Africa Workers',
          importance: Importance.high,
          priority: Priority.high,
          showWhen: true,
        );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      details,
      payload: payload,
    );
  }

  void _handleNotificationNavigation(Map<String, dynamic> data) {
    final type = data['type'];
    final id = data['id'];

    switch (type) {
      case 'job_application':
        // Navigate to job applications screen
        debugPrint('Navigate to job applications');
        break;
      case 'job_accepted':
        // Navigate to active jobs
        debugPrint('Navigate to active jobs');
        break;
      case 'job_completed':
        // Navigate to job details
        debugPrint('Navigate to job details: $id');
        break;
      case 'payment_received':
        // Navigate to earnings screen
        debugPrint('Navigate to earnings screen');
        break;
      case 'new_job_available':
        // Navigate to available jobs
        debugPrint('Navigate to available jobs');
        break;
      case 'message':
        // Navigate to messages screen
        debugPrint('Navigate to messages');
        break;
      case 'review_received':
        // Navigate to reviews screen
        debugPrint('Navigate to reviews screen');
        break;
      default:
        debugPrint('Unknown notification type: $type');
    }
  }

  Map<String, dynamic> _parsePayload(String payload) {
    try {
      // Assuming payload is JSON string
      return Map<String, dynamic>.from(jsonDecode(payload));
    } catch (e) {
      debugPrint('Error parsing notification payload: $e');
      return {};
    }
  }

  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }

  // Topics for workers
  Future<void> subscribeToWorkerTopics(
    String workerId,
    String region,
    List<String> skills,
  ) async {
    await subscribeToTopic('all_users');
    await subscribeToTopic('workers');
    await subscribeToTopic('worker_$workerId');
    await subscribeToTopic('region_$region');

    // Subscribe to skill-specific topics
    for (final skill in skills) {
      await subscribeToTopic(
        'skill_${skill.toLowerCase().replaceAll(' ', '_')}',
      );
    }
  }

  Future<void> unsubscribeFromWorkerTopics(
    String workerId,
    String region,
    List<String> skills,
  ) async {
    await unsubscribeFromTopic('all_users');
    await unsubscribeFromTopic('workers');
    await unsubscribeFromTopic('worker_$workerId');
    await unsubscribeFromTopic('region_$region');

    // Unsubscribe from skill-specific topics
    for (final skill in skills) {
      await unsubscribeFromTopic(
        'skill_${skill.toLowerCase().replaceAll(' ', '_')}',
      );
    }
  }
}

// Background message handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Handling background message: ${message.messageId}');
  // Handle background messages here
  // Note: This function should be top-level or static
}
