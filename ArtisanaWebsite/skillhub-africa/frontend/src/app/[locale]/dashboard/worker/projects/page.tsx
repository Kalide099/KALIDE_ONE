"use client";
import { useEffect, useState } from 'react';
import { apiService, Project } from '@/services/api';

export default function WorkerProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await apiService.getProjects();
      if (res.success && res.data) {
        setProjects(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleUpload = async () => {
    if (!selectedProjectId || !message) return;
    setUploading(true);
    const res = await apiService.uploadProjectUpdate(selectedProjectId, message, file || undefined);
    setUploading(false);
    if (res.success) {
      alert("Progress update submitted successfully!");
      setSelectedProjectId(null);
      setMessage('');
      setFile(null);
    } else {
      alert(res.message || "Failed to upload.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading projects...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <a href="/dashboard/worker" className="text-indigo-600 hover:text-indigo-500">Back to Dashboard</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {projects.length === 0 ? (
             <p className="text-gray-500">No active projects found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {project.title?.en || project.title?.fr || 'Untitled Project'}
                    </h3>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500 capitalize">Status: {project.status.replace('_', ' ')}</span>
                      <span className="text-sm font-medium text-indigo-600">${project.budget}</span>
                    </div>
                    <div className="mt-4 flex flex-col space-y-2">
                      <a
                        href={`/project/${project.id}`}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        View Project
                      </a>
                      <button
                        onClick={() => setSelectedProjectId(project.id)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Upload Progress Photo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {selectedProjectId && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Post Project Update</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Update Message</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What did you complete today?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Progress Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !message}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {uploading ? 'Uploading...' : 'Submit Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}