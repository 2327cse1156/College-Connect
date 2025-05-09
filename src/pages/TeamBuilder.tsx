import { useState, useEffect } from 'react';
import { Search, Filter, Code2, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TeamRequest } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const TeamBuilder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    fetchTeamRequests();
  }, []);

  const fetchTeamRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('team_requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamRequests(data || []);
    } catch (error) {
      console.error('Error fetching team requests:', error);
      toast.error('Failed to load team requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!currentUser) {
      toast.error('Please log in to create a team request');
      return;
    }
    // Implement create request modal/form
  };

  const handleApply = async (requestId: string) => {
    if (!currentUser) {
      toast.error('Please log in to apply');
      return;
    }
    // Implement application logic
    toast.success('Application submitted successfully');
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Team Builder</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find the perfect teammates for your next hackathon project.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by skills, roles, or hackathon..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </button>
        <button 
          onClick={handleCreateRequest}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Create Request
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-6">
          {teamRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <img
                    src={request.profiles?.avatar_url || 'https://via.placeholder.com/40'}
                    alt={request.profiles?.full_name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{request.title}</h3>
                    <p className="text-gray-600">
                      Posted by {request.profiles?.full_name}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {request.spots_available} spot{request.spots_available !== 1 && 's'} left
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Code2 className="h-4 w-4 mr-2" />
                  {request.event}
                </div>
                <p className="text-gray-600 mb-4">{request.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {request.skills_needed?.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </button>
                <button 
                  onClick={() => handleApply(request.id)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Apply to Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamBuilder;