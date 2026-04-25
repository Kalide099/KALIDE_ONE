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
      // TODO: Replace with actual API call
      // For now, using mock data
      await Future.delayed(
        const Duration(seconds: 1),
      ); // Simulate network delay

      _availableJobs = [
        Job(
          id: '1',
          title: 'Mobile App Development',
          description:
              'We need a skilled Flutter developer to build a cross-platform mobile application for our e-commerce platform. The app should have user authentication, product catalog, shopping cart, and payment integration.',
          category: 'Mobile Development',
          budget: '2500',
          location: 'Remote',
          requirements: [
            '3+ years of Flutter development experience',
            'Experience with Firebase integration',
            'Knowledge of state management (Provider/Bloc)',
            'Understanding of REST APIs',
          ],
          skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
          duration: '4 weeks',
          postedDate: '2 days ago',
        ),
        Job(
          id: '2',
          title: 'Website Redesign',
          description:
              'Looking for a creative web designer to redesign our company website. The new design should be modern, responsive, and user-friendly.',
          category: 'Web Design',
          budget: '1200',
          location: 'Nairobi, Kenya',
          requirements: [
            'Portfolio of previous web design projects',
            'Proficiency in Figma/Adobe XD',
            'Understanding of UX/UI principles',
            'Knowledge of HTML/CSS basics',
          ],
          skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Responsive Design'],
          duration: '2 weeks',
          postedDate: '1 week ago',
        ),
        Job(
          id: '3',
          title: 'Data Analysis Project',
          description:
              'Need a data analyst to analyze sales data and create comprehensive reports with insights and recommendations for business growth.',
          category: 'Data Analysis',
          budget: '800',
          location: 'Remote',
          requirements: [
            'Experience with Python and pandas',
            'Knowledge of data visualization tools',
            'Statistical analysis skills',
            'Business intelligence experience',
          ],
          skills: ['Python', 'Pandas', 'Tableau', 'SQL'],
          duration: '1 week',
          postedDate: '3 days ago',
        ),
      ];
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
      // TODO: Replace with actual API call
      await Future.delayed(
        const Duration(seconds: 2),
      ); // Simulate network delay

      // Simulate successful application
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
