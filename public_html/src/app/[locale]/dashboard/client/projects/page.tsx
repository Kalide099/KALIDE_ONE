export default function ClientProjects() {
  // Mock data
  const projects = [
    { id: 1, title: 'House Construction', status: 'in_progress', budget: 50000, milestones: 3 },
    { id: 2, title: 'Car Repair', status: 'completed', budget: 2000, milestones: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <a href="/dashboard/client" className="text-indigo-600 hover:text-indigo-500">Back to Dashboard</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status: {project.status}</span>
                    <span className="text-sm text-gray-500">Budget: ${project.budget}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Milestones: {project.milestones}</span>
                  </div>
                  <div className="mt-4">
                    <a
                      href={`/project/${project.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      View Project
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}