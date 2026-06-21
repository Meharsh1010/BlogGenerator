import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App.jsx';
import Wizard from '../components/Wizard.jsx';
import { 
  Plus, Search, LogOut, FileText, BarChart2, Clock, 
  Trash2, ArrowRight, Sparkles, Feather, FileCode, CheckCircle 
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [error, setError] = useState('');

  // Fetch blogs on load
  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get('/api/blogs');
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      setError('Failed to retrieve blog listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Stop navigation trigger
    if (!window.confirm('Are you sure you want to delete this blog draft?')) return;
    
    try {
      await axios.delete(`/api/blogs/${id}`);
      setBlogs(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      alert('Failed to delete blog draft.');
    }
  };

  const handleWizardComplete = (newBlog) => {
    setIsWizardOpen(false);
    navigate(`/editor/${newBlog._id}`);
  };

  // Compute metrics
  const totalDocs = blogs.length;
  const totalWords = blogs.reduce((acc, curr) => {
    const text = curr.content || '';
    const cleanText = text.replace(/<[^>]*>/g, ' '); // Strip HTML tags
    const words = cleanText.trim().split(/\s+/).filter(w => w.length > 0);
    return acc + words.length;
  }, 0);
  
  // Active hours estimation: 0.8 hours per draft + some base time
  const activeHours = totalDocs > 0 ? (totalDocs * 0.8 + (totalWords / 250) * 0.15).toFixed(1) : '0.0';

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.configuration.tone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-950/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-950/40 border border-emerald-500/20 rounded-lg text-[#059669]">
              <Feather size={20} />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">EmpathWrite AI</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-200">{user?.name}</span>
              <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
            
            <button 
              onClick={logout}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-800 rounded-xl transition cursor-pointer"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Contents */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        {/* Metric Cards Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#131b2e] border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="p-3.5 bg-slate-900/60 rounded-xl text-slate-400">
              <FileText size={24} />
            </div>
            <div>
              <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Documents</span>
              <span className="text-2xl font-bold text-white mt-1 block">{totalDocs}</span>
            </div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="p-3.5 bg-[#059669]/10 rounded-xl text-[#059669]">
              <BarChart2 size={24} />
            </div>
            <div>
              <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider">Aggregate Words</span>
              <span className="text-2xl font-bold text-white mt-1 block">{totalWords.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-[#131b2e] border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="p-3.5 bg-slate-900/60 rounded-xl text-slate-400">
              <Clock size={24} />
            </div>
            <div>
              <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Drafting Hours</span>
              <span className="text-2xl font-bold text-white mt-1 block">{activeHours}h</span>
            </div>
          </div>
        </section>

        {/* Dashboard Title & Actions */}
        <section className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Active Campaigns</h2>
            <p className="text-slate-500 text-sm mt-1">Manage and edit your current humanized content draft lines</p>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-medium rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-950/20 cursor-pointer text-sm"
          >
            <Plus size={18} />
            New Draft Campaign
          </button>
        </section>

        {/* Filter & Listing Container */}
        <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-6 shadow-xl">
          {/* Search bar */}
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition text-sm"
              placeholder="Search drafts by title, tone preset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin"></div>
              <span>Syncing workspace grid...</span>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-850 rounded-xl bg-[#0b0f19]/20">
              <FileCode className="mx-auto text-slate-700 mb-4" size={44} />
              <h3 className="text-slate-400 font-semibold text-lg">No campaigns found</h3>
              <p className="text-slate-600 text-sm max-w-sm mx-auto mt-1.5">
                {searchQuery ? "No drafts match your active filter parameters." : "You haven't initialized any blog generators yet."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="mt-6 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-medium rounded-lg text-xs cursor-pointer inline-flex items-center gap-1.5 transition"
                >
                  <Plus size={14} /> Create a Draft
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <div 
                  key={blog._id}
                  onClick={() => navigate(`/editor/${blog._id}`)}
                  className="group relative bg-[#0b0f19] border border-slate-850 hover:border-[#059669]/40 rounded-xl p-5 cursor-pointer shadow transition duration-200 hover:-translate-y-0.5 flex flex-col justify-between min-h-[190px]"
                >
                  <div>
                    {/* Header: Status & Actions */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
                        blog.status === 'published' 
                          ? 'bg-emerald-950/20 border-emerald-500/20 text-[#059669]' 
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        {blog.status === 'published' ? (
                          <>
                            <CheckCircle size={10} /> Published
                          </>
                        ) : 'Draft'}
                      </span>

                      <button
                        onClick={(e) => handleDelete(blog._id, e)}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete Campaign"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-2 group-hover:text-emerald-500 transition-colors">
                      {blog.title}
                    </h3>
                  </div>

                  {/* Footer Stats */}
                  <div className="border-t border-slate-850/80 pt-3 mt-4 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md font-medium text-slate-400">
                        {blog.configuration.tone}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md font-medium text-slate-400">
                        {blog.configuration.targetAudience}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#059669] font-medium group-hover:translate-x-1 transition-transform">
                      <span>Write</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Onboarding Stepper Dialog */}
      <Wizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onComplete={handleWizardComplete} 
      />
    </div>
  );
}
