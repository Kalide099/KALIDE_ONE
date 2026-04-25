class Worker {
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
  final List<String> skills;
  final List<String> certifications;
  final double hourlyRate;
  final String currency;
  final Map<String, dynamic> availability;
  final List<PortfolioItem> portfolio;

  Worker({
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
    required this.skills,
    required this.certifications,
    required this.hourlyRate,
    required this.currency,
    required this.availability,
    required this.portfolio,
  });

  factory Worker.fromJson(Map<String, dynamic> json) {
    return Worker(
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
      skills: List<String>.from(json['skills'] ?? []),
      certifications: List<String>.from(json['certifications'] ?? []),
      hourlyRate: (json['hourly_rate'] ?? 0.0).toDouble(),
      currency: json['currency'] ?? 'USD',
      availability: Map<String, dynamic>.from(json['availability'] ?? {}),
      portfolio:
          (json['portfolio'] as List<dynamic>?)
              ?.map((item) => PortfolioItem.fromJson(item))
              .toList() ??
          [],
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
      'skills': skills,
      'certifications': certifications,
      'hourly_rate': hourlyRate,
      'currency': currency,
      'availability': availability,
      'portfolio': portfolio.map((item) => item.toJson()).toList(),
    };
  }
}

class PortfolioItem {
  final String id;
  final String title;
  final String description;
  final List<String> images;
  final List<String> tags;
  final String projectUrl;
  final DateTime createdAt;

  PortfolioItem({
    required this.id,
    required this.title,
    required this.description,
    required this.images,
    required this.tags,
    required this.projectUrl,
    required this.createdAt,
  });

  factory PortfolioItem.fromJson(Map<String, dynamic> json) {
    return PortfolioItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      tags: List<String>.from(json['tags'] ?? []),
      projectUrl: json['project_url'] ?? '',
      createdAt: DateTime.parse(
        json['created_at'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'images': images,
      'tags': tags,
      'project_url': projectUrl,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
