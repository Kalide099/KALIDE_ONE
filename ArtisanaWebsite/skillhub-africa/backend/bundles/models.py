from django.db import models
from users.models import User
from artisans.models import SkillCategory

class Team(models.Model):
    name = models.JSONField(default=dict, help_text='{"en": "Team Name", "fr": "Nom de l équipe"}')
    description = models.JSONField(default=dict)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'marketplace_teams'

    def __str__(self):
        return str(self.name.get('en', 'Team'))


class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    professional = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.JSONField(default=dict, help_text='{"en": "Role", "fr": "Role"}')

    class Meta:
        db_table = 'marketplace_team_members'

    def __str__(self):
        return f"{self.professional.name} in {self.team}"


class TeamTemplate(models.Model):
    name = models.JSONField(default=dict)
    description = models.JSONField(default=dict)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE)

    class Meta:
        db_table = 'marketplace_team_templates'

    def __str__(self):
        return str(self.name.get('en', 'Team Template'))


class TeamRole(models.Model):
    team_template = models.ForeignKey(TeamTemplate, on_delete=models.CASCADE, related_name='roles')
    role_name = models.JSONField(default=dict)
    required_skill = models.CharField(max_length=100)  # Reference to Skill identifier

    class Meta:
        db_table = 'marketplace_team_roles'

    def __str__(self):
        return str(self.role_name.get('en', 'Team Role'))
