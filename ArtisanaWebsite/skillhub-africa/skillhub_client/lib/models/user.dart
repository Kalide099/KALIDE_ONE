class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String profileImage;
  final String location;
  final double rating;
  final int completedProjects;
  final DateTime createdAt;
  final bool isVerified;
  final String bio;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.profileImage,
    required this.location,
    required this.rating,
    required this.completedProjects,
    required this.createdAt,
    required this.isVerified,
    required this.bio,
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
      completedProjects: json['completed_projects'] ?? 0,
      createdAt: DateTime.parse(
        json['created_at'] ?? DateTime.now().toIso8601String(),
      ),
      isVerified: json['is_verified'] ?? false,
      bio: json['bio'] ?? '',
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
      'completed_projects': completedProjects,
      'created_at': createdAt.toIso8601String(),
      'is_verified': isVerified,
      'bio': bio,
    };
  }
}
