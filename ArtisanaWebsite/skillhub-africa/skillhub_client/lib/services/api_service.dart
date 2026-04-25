import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../models/project.dart';

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
      '/auth/login',
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
  }) async {
    final response = await _post(
      '/auth/register',
      body: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'location': location,
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
    final response = await _get('/auth/user');
    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get user: ${response.body}');
    }
  }

  Future<User> updateUser(Map<String, dynamic> userData) async {
    final response = await _put('/auth/user', body: userData);
    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update user: ${response.body}');
    }
  }

  // Project endpoints
  Future<List<Project>> getProjects({int page = 1, int limit = 20}) async {
    final response = await _get('/projects?page=$page&limit=$limit');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['results'] as List)
          .map((project) => Project.fromJson(project))
          .toList();
    } else {
      throw Exception('Failed to get projects: ${response.body}');
    }
  }

  Future<Project> getProject(String projectId) async {
    final response = await _get('/projects/$projectId');
    if (response.statusCode == 200) {
      return Project.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get project: ${response.body}');
    }
  }

  Future<Project> createProject(Map<String, dynamic> projectData) async {
    final response = await _post('/projects', body: projectData);
    if (response.statusCode == 201) {
      return Project.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create project: ${response.body}');
    }
  }

  Future<Project> updateProject(
    String projectId,
    Map<String, dynamic> projectData,
  ) async {
    final response = await _put('/projects/$projectId', body: projectData);
    if (response.statusCode == 200) {
      return Project.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update project: ${response.body}');
    }
  }

  Future<void> deleteProject(String projectId) async {
    final response = await _delete('/projects/$projectId');
    if (response.statusCode != 204) {
      throw Exception('Failed to delete project: ${response.body}');
    }
  }

  // Project proposals
  Future<List<ProjectProposal>> getProjectProposals(String projectId) async {
    final response = await _get('/projects/$projectId/proposals');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data as List)
          .map((proposal) => ProjectProposal.fromJson(proposal))
          .toList();
    } else {
      throw Exception('Failed to get proposals: ${response.body}');
    }
  }

  Future<ProjectProposal> submitProposal(
    String projectId,
    Map<String, dynamic> proposalData,
  ) async {
    final response = await _post(
      '/projects/$projectId/proposals',
      body: proposalData,
    );
    if (response.statusCode == 201) {
      return ProjectProposal.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to submit proposal: ${response.body}');
    }
  }

  Future<void> acceptProposal(String projectId, String proposalId) async {
    final response = await _post(
      '/projects/$projectId/proposals/$proposalId/accept',
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to accept proposal: ${response.body}');
    }
  }

  // Worker search and discovery
  Future<List<User>> searchWorkers({
    String? skill,
    String? location,
    double? minRating,
    int page = 1,
    int limit = 20,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (skill != null) queryParams['skill'] = skill;
    if (location != null) queryParams['location'] = location;
    if (minRating != null) queryParams['min_rating'] = minRating.toString();

    final queryString = queryParams.entries
        .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
        .join('&');

    final response = await _get('/workers/search?$queryString');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['results'] as List)
          .map((worker) => User.fromJson(worker))
          .toList();
    } else {
      throw Exception('Failed to search workers: ${response.body}');
    }
  }

  // Payment endpoints
  Future<Map<String, dynamic>> createPaymentIntent({
    required String projectId,
    required double amount,
    required String currency,
  }) async {
    final response = await _post(
      '/payments/create-intent',
      body: {'project_id': projectId, 'amount': amount, 'currency': currency},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create payment intent: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> getPaymentHistory({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _get('/payments/history?page=$page&limit=$limit');
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
    final response = await _get('/notifications?page=$page&limit=$limit');
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['results']);
    } else {
      throw Exception('Failed to get notifications: ${response.body}');
    }
  }

  Future<void> markNotificationAsRead(String notificationId) async {
    final response = await _put('/notifications/$notificationId/read');
    if (response.statusCode != 200) {
      throw Exception('Failed to mark notification as read: ${response.body}');
    }
  }

  // Review endpoints
  Future<Map<String, dynamic>> submitReview({
    required String projectId,
    required String recipientId,
    required double rating,
    String? comment,
  }) async {
    final response = await _post(
      '/reviews',
      body: {
        'project_id': projectId,
        'recipient_id': recipientId,
        'rating': rating,
        'comment': comment,
      },
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to submit review: ${response.body}');
    }
  }

  Future<List<Map<String, dynamic>>> getReviews(
    String userId, {
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _get(
      '/reviews/user/$userId?page=$page&limit=$limit',
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(data['results']);
    } else {
      throw Exception('Failed to get reviews: ${response.body}');
    }
  }
}
