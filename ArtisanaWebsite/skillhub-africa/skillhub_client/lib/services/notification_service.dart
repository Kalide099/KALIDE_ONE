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
          'skillhub_channel',
          'SkillHub Notifications',
          channelDescription: 'Notifications for SkillHub Africa',
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
      case 'project_proposal':
        // Navigate to project proposals screen
        debugPrint('Navigate to project proposals for project: $id');
        break;
      case 'project_accepted':
        // Navigate to project details
        debugPrint('Navigate to project details: $id');
        break;
      case 'payment_received':
        // Navigate to payments screen
        debugPrint('Navigate to payments screen');
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

  // Topics for different user types and regions
  Future<void> subscribeToUserTopics(
    String userId,
    String userType,
    String region,
  ) async {
    await subscribeToTopic('all_users');
    await subscribeToTopic(userType); // 'client' or 'worker'
    await subscribeToTopic('user_$userId');
    await subscribeToTopic('region_$region');
  }

  Future<void> unsubscribeFromUserTopics(
    String userId,
    String userType,
    String region,
  ) async {
    await unsubscribeFromTopic('all_users');
    await unsubscribeFromTopic(userType);
    await unsubscribeFromTopic('user_$userId');
    await unsubscribeFromTopic('region_$region');
  }
}

// Background message handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('Handling background message: ${message.messageId}');
  // Handle background messages here
  // Note: This function should be top-level or static
}
