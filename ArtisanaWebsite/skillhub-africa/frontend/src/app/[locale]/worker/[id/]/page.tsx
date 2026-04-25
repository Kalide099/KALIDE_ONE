interface WorkerPageProps {
  params: {
    id: string;
  };
}

export default function WorkerDetail({ params }: WorkerPageProps) {
  // Mock data
  const worker = {
    id: parseInt(params.id),
    name: 'John Doe',
    skills: ['Plumbing', 'Electrical'],
    experience: 5,
    bio: 'Experienced plumber with 5 years in the field.',
    hourlyRate: 25,
    rating: 4.5,
    verified: true,
    portfolio: ['image1.jpg', 'image2.jpg'],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">{worker.name}</h1>
            <a href="/workers" className="text-indigo-600 hover:text-indigo-500">Back to Workers</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{worker.bio}</p>
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Skills: {worker.skills.join(', ')}</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Experience: {worker.experience} years</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Rating: {worker.rating}</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Hourly Rate: ${worker.hourlyRate}</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Verified: {worker.verified ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Portfolio</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {worker.portfolio.map((image, index) => (
                    <img key={index} src={image} alt={`Portfolio ${index + 1}`} className="w-full h-32 object-cover rounded" />
                  ))}
                </div>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Hire Worker
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}