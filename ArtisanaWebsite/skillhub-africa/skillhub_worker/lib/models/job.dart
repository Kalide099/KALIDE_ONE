class Job {
  final String id;
  final String title;
  final String description;
  final String category;
  final String budget;
  final String location;
  final List<String> requirements;
  final List<String> skills;
  final String duration;
  final String postedDate;

  Job({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.budget,
    required this.location,
    required this.requirements,
    required this.skills,
    required this.duration,
    required this.postedDate,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      category: json['category'] as String,
      budget: json['budget'] as String,
      location: json['location'] as String,
      requirements: List<String>.from(json['requirements'] ?? []),
      skills: List<String>.from(json['skills'] ?? []),
      duration: json['duration'] as String,
      postedDate: json['posted_date'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'budget': budget,
      'location': location,
      'requirements': requirements,
      'skills': skills,
      'duration': duration,
      'posted_date': postedDate,
    };
  }
}
