import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../models/job.dart';

class ApiService {
  static const String baseUrl = 'https://api.skillhub-africa.com/api';
  static const String authTokenKey = 'auth_token';

  final http.Client _client;
  final FlutterSecureStorage _storage;

  ApiService({http.Client? client, FlutterSecureStorage? storage})
    : _client = client ?? http.Client(),
      _storage = storage ?? const FlutterSecureStorage();

  // Authentication methods
  Future<String?> getAuthToken() async {
    return await _storage.read(key: authTokenKey);
  }

  Future<void> setAuthToken(String token) async {
    await _storage.write(key: authTokenKey, value: token);
  }

  Future<void> clearAuthToken() async {
    await _storage.delete(key: authTokenKey);
  }

  // HTTP request helpers
  Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      final token = await getAuthToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<http.Response> _get(String endpoint, {bool includeAuth = true}) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders(includeAuth: includeAuth);
    return await _client.get(url, headers: headers);
  }

  Future<http.Response> _post(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders(includeAuth: includeAuth);
    return await _client.post(
      url,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );
  }

  Future<http.Response> _put(
    String endpoint, {
    Map<String, dynamic>? body,
    bool includeAuth = true,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders(includeAuth: includeAuth);
    return await _client.put(
      url,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );
  }

  Future<http.Response> _delete(
    String endpoint, {
    bool includeAuth = true,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders(includeAuth: includeAuth);
    return await _client.delete(url, headers: headers);
  }

  // Authentication endpoints
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _post(
      '/auth/worker/login',
      body: {'email': email, 'password': password},
      includeAuth: false,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['token'] != null) {
        await setAuthToken(data['token']);
      }
      return data;
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    String? location,
    List<String>? skills,
  }) async {
    final response = await _post(
      '/auth/worker/register',
      body: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'location': location,
        'skills': skills,
      },
      includeAuth: false,
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Registration failed: ${response.body}');
    }
  }

  Future<void> logout() async {
    await clearAuthToken();
  }

  // User endpoints
  Future<User> getCurrentUser() async {
    final response = await _get('/auth/worker/user');
    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get user: ${response.body}');
    }
  }

  Future<User> updateUser(Map<String, dynamic> userData) async {
    final response = await _put('/auth/worker/user', body: userData);
    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update user: ${response.body}');
    }
  }

  // Job endpoints
  Future<List<Job>> getAvailableJobs({
    int page = 1,
    int limit = 20,
    String? skill,
    String? location,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (skill != null) queryParams['skill'] = skill;
    if (location != null) queryParams['location'] = location;

    final queryString = queryParams.entries
        .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
        .join('&');

    final response = await _get('/jobs/available?$queryString');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['results'] as List).map((job) => Job.fromJson(job)).toList();
    } else {
      throw Exception('Failed to get jobs: ${response.body}');
    }
  }

  Future<Job> getJob(String jobId) async {
    final response = await _get('/jobs/$jobId');
    if (response.statusCode == 200) {
      return Job.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get job: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> applyForJob(
    String jobId, {
    String? proposal,
    double? proposedRate,
  }) async {
    final response = await _post(
      '/jobs/$jobId/apply',
      body: {'proposal': proposal, 'proposed_rate': proposedRate},
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to apply for job: ${response.body}');
    }
  }

  // Worker applications
  Future<List<Map<String, dynamic>>> getMyApplications({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _get('/worker/applications?page=$page&limit=$limit');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['results']);
    } else {
      throw Exception('Failed to get applications: ${response.body}');
    }
  }

  // Active jobs
  Future<List<Map<String, dynamic>>> getMyActiveJobs({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _get('/worker/active-jobs?page=$page&limit=$limit');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['results']);
    } else {
      throw Exception('Failed to get active jobs: ${response.body}');
    }
  }

  // Location tracking
  Future<void> updateLocation(double latitude, double longitude) async {
    final response = await _post(
      '/worker/location',
      body: {'latitude': latitude, 'longitude': longitude},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update location: ${response.body}');
    }
  }

  // Earnings and payments
  Future<Map<String, dynamic>> getEarnings() async {
    final response = await _get('/worker/earnings');
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get earnings: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> getPaymentHistory({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _get('/worker/payments?page=$page&limit=$limit');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['results']);
    } else {
      throw Exception('Failed to get payment history: ${response.body}');
    }
  }

  // Notification endpoints
  Future<List<Map<String, dynamic>>> getNotifications({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _get(
      '/worker/notifications?page=$page&limit=$limit',
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['results']);
    } else {
      throw Exception('Failed to get notifications: ${response.body}');
    }
  }

  Future<void> markNotificationAsRead(String notificationId) async {
    final response = await _put('/worker/notifications/$notificationId/read');
    if (response.statusCode != 200) {
      throw Exception('Failed to mark notification as read: ${response.body}');
    }
  }

  // Review endpoints
  Future<List<Map<String, dynamic>>> getReviews({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _get('/worker/reviews?page=$page&limit=$limit');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['results']);
    } else {
      throw Exception('Failed to get reviews: ${response.body}');
    }
  }
}
