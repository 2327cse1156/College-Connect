import { useState, useEffect } from 'react';
import { Search, BookOpen, ThumbsUp, Download, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Resource } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (resourceId: string) => {
    if (!currentUser) {
      toast.error('Please log in to like resources');
      return;
    }

    try {
      const { error } = await supabase
        .from('likes')
        .insert([
          { user_id: currentUser.id, resource_id: resourceId }
        ]);

      if (error) throw error;
      
      // Update the likes count in the UI
      setResources(resources.map(resource => 
        resource.id === resourceId 
          ? { ...resource, likes: (resource.likes || 0) + 1 }
          : resource
      ));

      toast.success('Resource liked!');
    } catch (error) {
      console.error('Error liking resource:', error);
      toast.error('Failed to like resource');
    }
  };

  const handleDownload = async (resourceId: string, url: string) => {
    if (!currentUser) {
      toast.error('Please log in to download resources');
      return;
    }

    try {
      // Increment download count
      const { error } = await supabase
        .rpc('increment_downloads', { resource_id: resourceId });

      if (error) throw error;

      // Update UI
      setResources(resources.map(resource => 
        resource.id === resourceId 
          ? { ...resource, downloads: (resource.downloads || 0) + 1 }
          : resource
      ));

      // Trigger download
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Failed to download resource');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Learning Resources</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Access and share valuable learning materials with your college community.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="px-4 py-2 border rounded-lg">
          <option>All Categories</option>
          <option>Web Development</option>
          <option>Machine Learning</option>
          <option>Interview Prep</option>
        </select>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Share Resource
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{resource.title}</h3>
                    <p className="text-gray-600">
                      by {resource.profiles?.full_name} · {resource.type}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {resource.category}
                </span>
              </div>

              <p className="mt-4 text-gray-600">{resource.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {resource.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex space-x-6">
                  <button 
                    onClick={() => handleLike(resource.id)}
                    className="flex items-center text-gray-600 hover:text-indigo-600"
                  >
                    <ThumbsUp className="h-5 w-5 mr-1" />
                    {resource.likes || 0}
                  </button>
                  <button 
                    onClick={() => handleDownload(resource.id, resource.url)}
                    className="flex items-center text-gray-600 hover:text-indigo-600"
                  >
                    <Download className="h-5 w-5 mr-1" />
                    {resource.downloads || 0}
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-indigo-600">
                    <Share2 className="h-5 w-5 mr-1" />
                    Share
                  </button>
                </div>
                <button 
                  onClick={() => handleDownload(resource.id, resource.url)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;