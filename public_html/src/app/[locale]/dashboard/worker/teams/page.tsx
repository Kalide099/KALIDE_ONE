"use client";

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import {
  apiService,
  Project,
  TeamMember,
  TeamProjectSkillTask,
  TeamRecord,
} from '@/services/api';

function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProjectTitle(value: unknown): string {
  if (!value) return 'Project';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return String(record.en || record.fr || Object.values(record)[0] || 'Project');
  }
  return 'Project';
}

export default function TeamManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [currentRole, setCurrentRole] = useState('');
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [invitePermissions, setInvitePermissions] = useState('view_projects,update_tasks');
  const [inviteSkills, setInviteSkills] = useState('');

  const [editDrafts, setEditDrafts] = useState<Record<number, { base_role: string; permissions: string; skills: string }>>({});

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [mapMemberId, setMapMemberId] = useState<number | null>(null);
  const [requiredSkill, setRequiredSkill] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [skillMapTasks, setSkillMapTasks] = useState<TeamProjectSkillTask[]>([]);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) || null,
    [teams, selectedTeamId]
  );

  const selectedTeamMembers: TeamMember[] = selectedTeam?.members || [];

  const teamProjects = useMemo(() => {
    if (!selectedTeam) return [];
    return projects.filter((project) => Number(project.team_id || 0) === selectedTeam.id);
  }, [projects, selectedTeam]);

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser) as { role?: string };
        setCurrentRole(String(parsed.role || '').toLowerCase());
      } catch {
        setCurrentRole('');
      }
    }
  }, []);

  const loadBaseData = async () => {
    setIsLoading(true);
    setError('');

    const [teamsResponse, projectsResponse] = await Promise.all([
      apiService.getTeams(),
      apiService.getProjects(),
    ]);

    if (!teamsResponse.success) {
      setError(teamsResponse.message || 'Unable to load teams right now.');
      setIsLoading(false);
      return;
    }

    const loadedTeams = teamsResponse.data || [];
    setTeams(loadedTeams);
    if (loadedTeams.length > 0) {
      setSelectedTeamId((current) => current ?? loadedTeams[0].id);
    } else {
      setSelectedTeamId(null);
    }

    if (projectsResponse.success) {
      setProjects(projectsResponse.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (teamProjects.length > 0) {
      setSelectedProjectId((current) => {
        if (current && teamProjects.some((project) => project.id === current)) return current;
        return teamProjects[0].id;
      });
    } else {
      setSelectedProjectId(null);
      setSkillMapTasks([]);
    }
  }, [teamProjects]);

  const loadSkillMap = async (teamId: number, projectId: number) => {
    const response = await apiService.getTeamProjectSkillMap(teamId, projectId);
    if (response.success && response.data) {
      setSkillMapTasks(response.data);
    } else {
      setSkillMapTasks([]);
      if (response.message) setError(response.message);
    }
  };

  useEffect(() => {
    if (!selectedTeamId || !selectedProjectId) return;
    loadSkillMap(selectedTeamId, selectedProjectId);
  }, [selectedTeamId, selectedProjectId]);

  const canManageTeams = currentRole === 'team_leader' || currentRole === 'admin';

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!newTeamName.trim() || !newTeamDescription.trim()) {
      setError('Team name and description are required.');
      return;
    }

    const response = await apiService.createTeam({
      name: newTeamName.trim(),
      description: newTeamDescription.trim(),
    });

    if (!response.success) {
      setError(response.message || 'Failed to create team.');
      return;
    }

    setNotice('Team created successfully.');
    setNewTeamName('');
    setNewTeamDescription('');
    await loadBaseData();
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!selectedTeamId) {
      setError('Select a team first.');
      return;
    }

    const response = await apiService.inviteTeamMember(selectedTeamId, {
      email: inviteEmail.trim(),
      base_role: inviteRole.trim() || 'member',
      permissions: parseCsv(invitePermissions),
      skills: parseCsv(inviteSkills),
    });

    if (!response.success) {
      setError(response.message || 'Could not invite team member.');
      return;
    }

    setNotice('Member invited to team.');
    setInviteEmail('');
    await loadBaseData();
  };

  const handleUpdateMember = async (member: TeamMember) => {
    if (!selectedTeamId) return;

    const draft = editDrafts[member.id] || {
      base_role: member.base_role,
      permissions: member.permissions.join(', '),
      skills: member.skills.join(', '),
    };

    const response = await apiService.updateTeamMember(selectedTeamId, member.id, {
      base_role: draft.base_role,
      permissions: parseCsv(draft.permissions),
      skills: parseCsv(draft.skills),
    });

    if (!response.success) {
      setError(response.message || 'Could not update member role.');
      return;
    }

    setNotice(`Updated role setup for ${member.user?.name || 'member'}.`);
    await loadBaseData();
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedTeamId) return;

    const response = await apiService.removeTeamMember(selectedTeamId, memberId);
    if (!response.success) {
      setError(response.message || 'Could not remove team member.');
      return;
    }

    setNotice('Member removed from team.');
    await loadBaseData();
  };

  const handleMapSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!selectedTeamId || !selectedProjectId || !mapMemberId || !requiredSkill.trim()) {
      setError('Select team, project, member and required skill.');
      return;
    }

    const response = await apiService.mapMemberSkillToProject(selectedTeamId, selectedProjectId, {
      member_id: mapMemberId,
      required_skill: requiredSkill.trim(),
      task_title: taskTitle.trim() || undefined,
      task_description: taskDescription.trim() || undefined,
    });

    if (!response.success) {
      setError(response.message || 'Could not map member skill to project.');
      return;
    }

    setNotice('Member skill mapped to project successfully.');
    setRequiredSkill('');
    setTaskTitle('');
    setTaskDescription('');
    await loadSkillMap(selectedTeamId, selectedProjectId);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">Feature 9</p>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Team Management</h1>
            <p className="text-slate-400 text-sm mt-2">
              Invite members, assign roles, set permissions, and map member skills to projects.
            </p>
          </div>
          <Link href="/dashboard/worker" className="px-4 py-2 rounded-xl border border-white/15 text-xs font-black uppercase tracking-widest">
            Back
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs font-bold">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 text-xs font-bold">
            {notice}
          </div>
        )}

        {!canManageTeams && !isLoading && (
          <div className="glass border border-white/10 rounded-3xl p-8 text-center">
            <h2 className="text-xl font-black uppercase tracking-widest mb-3">Company Accounts Only</h2>
            <p className="text-slate-400 text-sm">
              This panel is intended for company team leaders and admins. Switch to a company account to manage teams.
            </p>
          </div>
        )}

        {canManageTeams && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="glass border border-white/10 rounded-3xl p-6 space-y-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Create Team</h2>
              <form onSubmit={handleCreateTeam} className="space-y-3">
                <input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                />
                <textarea
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="What this team specializes in"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-[96px]"
                />
                <button className="w-full py-3 rounded-xl bg-primary font-black uppercase tracking-widest text-xs">
                  Create Team
                </button>
              </form>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Active Team</label>
                <select
                  value={selectedTeamId || ''}
                  onChange={(e) => setSelectedTeamId(Number(e.target.value) || null)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                >
                  {teams.length === 0 && <option value="">No teams yet</option>}
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.members_count})
                    </option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleInviteMember} className="space-y-3 pt-3 border-t border-white/10">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">Invite Member</h3>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                />
                <input
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  placeholder="Role (e.g. site_manager)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                />
                <input
                  value={invitePermissions}
                  onChange={(e) => setInvitePermissions(e.target.value)}
                  placeholder="Permissions (comma separated)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                />
                <input
                  value={inviteSkills}
                  onChange={(e) => setInviteSkills(e.target.value)}
                  placeholder="Skills (comma separated)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                />
                <button className="w-full py-3 rounded-xl bg-secondary text-white font-black uppercase tracking-widest text-xs">
                  Send Invite
                </button>
              </form>
            </section>

            <section className="xl:col-span-2 glass border border-white/10 rounded-3xl p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-300 mb-4">Members and Access</h2>

              {isLoading ? (
                <div className="text-slate-500 text-sm">Loading team data...</div>
              ) : selectedTeamMembers.length === 0 ? (
                <div className="text-slate-500 text-sm">No members in this team yet.</div>
              ) : (
                <div className="space-y-4">
                  {selectedTeamMembers.map((member) => {
                    const draft = editDrafts[member.id] || {
                      base_role: member.base_role,
                      permissions: member.permissions.join(', '),
                      skills: member.skills.join(', '),
                    };

                    return (
                      <div key={member.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-black text-sm uppercase tracking-widest">{member.user?.name || 'Unknown Member'}</p>
                            <p className="text-xs text-slate-400">{member.user?.email || 'No email'}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="px-3 py-2 rounded-lg border border-red-500/30 text-red-300 text-[10px] font-black uppercase tracking-widest"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            value={draft.base_role}
                            onChange={(e) =>
                              setEditDrafts((prev) => ({
                                ...prev,
                                [member.id]: { ...draft, base_role: e.target.value },
                              }))
                            }
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs"
                            placeholder="Role"
                          />
                          <input
                            value={draft.permissions}
                            onChange={(e) =>
                              setEditDrafts((prev) => ({
                                ...prev,
                                [member.id]: { ...draft, permissions: e.target.value },
                              }))
                            }
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs"
                            placeholder="Permissions"
                          />
                          <input
                            value={draft.skills}
                            onChange={(e) =>
                              setEditDrafts((prev) => ({
                                ...prev,
                                [member.id]: { ...draft, skills: e.target.value },
                              }))
                            }
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs"
                            placeholder="Skills"
                          />
                        </div>

                        <button
                          onClick={() => handleUpdateMember(member)}
                          className="px-4 py-2 rounded-lg bg-primary text-[10px] font-black uppercase tracking-widest"
                        >
                          Save Role and Permissions
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="xl:col-span-3 glass border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">Skill Mapping to Projects</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value) || null)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                >
                  {teamProjects.length === 0 && <option value="">No projects linked to this team</option>}
                  {teamProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      #{project.id} - {parseProjectTitle(project.title)}
                    </option>
                  ))}
                </select>
                <select
                  value={mapMemberId || ''}
                  onChange={(e) => setMapMemberId(Number(e.target.value) || null)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                >
                  <option value="">Select member</option>
                  {selectedTeamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.user?.name || `Member ${member.id}`}
                    </option>
                  ))}
                </select>
                <input
                  value={requiredSkill}
                  onChange={(e) => setRequiredSkill(e.target.value)}
                  placeholder="Required skill (e.g. electrical)"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <form onSubmit={handleMapSkill} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title (optional)"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                />
                <input
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Task description (optional)"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                />
                <button className="rounded-xl bg-secondary py-3 text-xs font-black uppercase tracking-widest">
                  Map Skill to Project
                </button>
              </form>

              <div className="space-y-2 pt-2 border-t border-white/10">
                {skillMapTasks.length === 0 ? (
                  <p className="text-xs text-slate-500">No mapped tasks for the selected project yet.</p>
                ) : (
                  skillMapTasks.map((task) => (
                    <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm">{task.title}</p>
                        <p className="text-xs text-slate-400">{task.member?.name || 'Unknown'} · {task.status}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-secondary">Task #{task.id}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
