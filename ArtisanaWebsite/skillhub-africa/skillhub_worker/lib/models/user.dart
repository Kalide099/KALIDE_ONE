class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String profileImage;
  final String location;
  final double rating;
  final int completedJobs;
  final DateTime createdAt;
  final bool isVerified;
  final String bio;
  final List<String> skills;
  final double hourlyRate;
  final String experienceLevel;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.profileImage,
    required this.location,
    required this.rating,
    required this.completedJobs,
    required this.createdAt,
    required this.isVerified,
    required this.bio,
    required this.skills,
    required this.hourlyRate,
    required this.experienceLevel,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      profileImage: json['profile_image'] ?? '',
      location: json['location'] ?? '',
      rating: (json['rating'] ?? 0.0).toDouble(),
      completedJobs: json['completed_jobs'] ?? 0,
      createdAt: DateTime.parse(
        json['created_at'] ?? DateTime.now().toIso8601String(),
      ),
      isVerified: json['is_verified'] ?? false,
      bio: json['bio'] ?? '',
      skills: List<String>.from(json['skills'] ?? []),
      hourlyRate: (json['hourly_rate'] ?? 0.0).toDouble(),
      experienceLevel: json['experience_level'] ?? 'Beginner',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'profile_image': profileImage,
      'location': location,
      'rating': rating,
      'completed_jobs': completedJobs,
      'created_at': createdAt.toIso8601String(),
      'is_verified': isVerified,
      'bio': bio,
      'skills': skills,
      'hourly_rate': hourlyRate,
      'experience_level': experienceLevel,
    };
  }
}
