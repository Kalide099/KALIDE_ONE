import 'package:flutter/foundation.dart';
import '../models/job.dart';
import '../services/api_service.dart';

class JobProvider with ChangeNotifier {
  final ApiService _apiService;

  JobProvider(this._apiService);

  List<Job> _availableJobs = [];
  bool _isLoading = false;
  bool _isApplying = false;
  String? _errorMessage;

  List<Job> get availableJobs => _availableJobs;
  bool get isLoading => _isLoading;
  bool get isApplying => _isApplying;
  String? get errorMessage => _errorMessage;

  Future<void> loadAvailableJobs() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _availableJobs = await _apiService.getAvailableJobs();
    } catch (e) {
      _errorMessage = 'Failed to load jobs: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> applyForJob(String jobId) async {
    _isApplying = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _apiService.applyForJob(jobId, proposal: 'Default Proposal', proposedRate: 0.0);
      return true;
    } catch (e) {
      _errorMessage = 'Failed to apply for job: $e';
      return false;
    } finally {
      _isApplying = false;
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
