import 'user.dart';

enum ProjectStatus { draft, posted, inProgress, completed, cancelled }

enum ProjectCategory {
  technology,
  design,
  marketing,
  writing,
  photography,
  music,
  video,
  consulting,
  other,
}

class Project {
  final String id;
  final String title;
  final String description;
  final ProjectCategory category;
  final double budget;
  final String currency;
  final ProjectStatus status;
  final DateTime deadline;
  final String location;
  final List<String> skills;
  final List<String> attachments;
  final User client;
  final User? assignedWorker;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<ProjectProposal> proposals;

  Project({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.budget,
    required this.currency,
    required this.status,
    required this.deadline,
    required this.location,
    required this.skills,
    required this.attachments,
    required this.client,
    this.assignedWorker,
    required this.createdAt,
    required this.updatedAt,
    required this.proposals,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: ProjectCategory.values.firstWhere(
        (e) => e.toString().split('.').last == json['category'],
        orElse: () => ProjectCategory.other,
      ),
      budget: (json['budget'] ?? 0.0).toDouble(),
      currency: json['currency'] ?? 'USD',
      status: ProjectStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => ProjectStatus.draft,
      ),
      deadline: DateTime.parse(
        json['deadline'] ?? DateTime.now().toIso8601String(),
      ),
      location: json['location'] ?? '',
      skills: List<String>.from(json['skills'] ?? []),
      attachments: List<String>.from(json['attachments'] ?? []),
      client: User.fromJson(json['client'] ?? {}),
      assignedWorker: json['assigned_worker'] != null
          ? User.fromJson(json['assigned_worker'])
          : null,
      createdAt: DateTime.parse(
        json['created_at'] ?? DateTime.now().toIso8601String(),
      ),
      updatedAt: DateTime.parse(
        json['updated_at'] ?? DateTime.now().toIso8601String(),
      ),
      proposals:
          (json['proposals'] as List<dynamic>?)
              ?.map((proposal) => ProjectProposal.fromJson(proposal))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category.toString().split('.').last,
      'budget': budget,
      'currency': currency,
      'status': status.toString().split('.').last,
      'deadline': deadline.toIso8601String(),
      'location': location,
      'skills': skills,
      'attachments': attachments,
      'client': client.toJson(),
      'assigned_worker': assignedWorker?.toJson(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'proposals': proposals.map((proposal) => proposal.toJson()).toList(),
    };
  }
}

class ProjectProposal {
  final String id;
  final User worker;
  final String coverLetter;
  final double proposedPrice;
  final String currency;
  final int estimatedDays;
  final List<String> attachments;
  final DateTime createdAt;
  final bool isAccepted;

  ProjectProposal({
    required this.id,
    required this.worker,
    required this.coverLetter,
    required this.proposedPrice,
    required this.currency,
    required this.estimatedDays,
    required this.attachments,
    required this.createdAt,
    required this.isAccepted,
  });

  factory ProjectProposal.fromJson(Map<String, dynamic> json) {
    return ProjectProposal(
      id: json['id'] ?? '',
      worker: User.fromJson(json['worker'] ?? {}),
      coverLetter: json['cover_letter'] ?? '',
      proposedPrice: (json['proposed_price'] ?? 0.0).toDouble(),
      currency: json['currency'] ?? 'USD',
      estimatedDays: json['estimated_days'] ?? 0,
      attachments: List<String>.from(json['attachments'] ?? []),
      createdAt: DateTime.parse(
        json['created_at'] ?? DateTime.now().toIso8601String(),
      ),
      isAccepted: json['is_accepted'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'worker': worker.toJson(),
      'cover_letter': coverLetter,
      'proposed_price': proposedPrice,
      'currency': currency,
      'estimated_days': estimatedDays,
      'attachments': attachments,
      'created_at': createdAt.toIso8601String(),
      'is_accepted': isAccepted,
    };
  }
}
