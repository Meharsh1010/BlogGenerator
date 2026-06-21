import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axios from 'axios';
import { 
  ArrowLeft, Save, CheckCircle, Sparkles, Plus, Trash2, 
  ArrowUp, ArrowDown, ChevronRight, Edit2, Play, Eye, EyeOff, HelpCircle
} from 'lucide-react';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved' | 'Unsaved Changes' | 'Saving...'
  const [error, setError] = useState('');
  
  // Custom bubble menu states
  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  const [bubbleMenuPos, setBubbleMenuPos] = useState({ top: 0, left: 0 });
  const [highlightedText, setHighlightedText] = useState('');
  const [inlineLoading, setInlineLoading] = useState(false);

  // New heading states
  const [newHeadingTitle, setNewHeadingTitle] = useState('');
  const [newHeadingLevel, setNewHeadingLevel] = useState(2);

  // Initialize TipTap
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setSaveStatus('Unsaved Changes');
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setShowBubbleMenu(false);
        return;
      }

      const text = editor.state.doc.textBetween(from, to, ' ');
      if (!text.trim()) {
        setShowBubbleMenu(false);
        return;
      }
      setHighlightedText(text);

      // Calculate position of bubble menu
      try {
        const { view } = editor;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        
        // Compute positioning centered above the highlighted block
        const editorContainer = view.dom.getBoundingClientRect();
        const top = start.top - editorContainer.top + view.dom.parentElement.scrollTop - 48;
        const left = (start.left + end.left) / 2 - editorContainer.left;

        setBubbleMenuPos({ top, left: Math.max(10, left) });
        setShowBubbleMenu(true);
      } catch (err) {
        console.error('Error computing bubble menu coords:', err);
      }
    }
  });

  // Fetch blog data
  const fetchBlog = async () => {
    try {
      const { data } = await axios.get(`/api/blogs/${id}`);
      if (data.success) {
        setBlog(data.blog);
        if (editor && data.blog.content) {
          editor.commands.setContent(data.blog.content);
        }
      }
    } catch (err) {
      setError('Failed to fetch blog workspace settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id, editor]);

  // Handle Save
  const handleSave = async (silent = false) => {
    if (!silent) setSaveStatus('Saving...');
    try {
      const payload = {
        title: blog.title,
        content: editor.getHTML(),
        outline: blog.outline,
        status: blog.status
      };
      await axios.put(`/api/blogs/${id}/save`, payload);
      setSaveStatus('Saved');
    } catch (err) {
      setSaveStatus('Unsaved Changes');
      if (!silent) alert('Failed to auto-save editor contents.');
    }
  };

  // Auto-Save interval
  useEffect(() => {
    if (saveStatus === 'Unsaved Changes') {
      const timer = setTimeout(() => {
        handleSave(true);
      }, 5000); // Auto save after 5s of inactivity
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Generate Outline blueprint
  const generateOutline = async () => {
    setOutlineLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`/api/blogs/${id}/outline`);
      if (data.success) {
        setBlog(data.blog);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate outline.');
    } finally {
      setOutlineLoading(false);
    }
  };

  // Start content generation stream
  const startGenerationStream = () => {
    if (streaming) return;
    setStreaming(true);
    setError('');
    editor.commands.setContent('<p className="shimmer-text">Aligning cognitive models and initializing streams...</p>');

    let accumulatedHtml = '';
    const eventSource = new EventSource(`/api/blogs/${id}/stream`, { withCredentials: true });

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close();
        setStreaming(false);
        // Sync final content to local state and DB
        setBlog(prev => ({ ...prev, content: accumulatedHtml }));
        setSaveStatus('Unsaved Changes');
      } else {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setError(data.error);
            eventSource.close();
            setStreaming(false);
            return;
          }
          
          if (accumulatedHtml === '') {
            // Clear the placeholder shimmer text on first token
            editor.commands.setContent('');
          }

          accumulatedHtml += data.text;
          editor.commands.setContent(accumulatedHtml);
        } catch (e) {
          console.error('SSE token parse error:', e);
        }
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setError('Text streaming interrupted.');
      eventSource.close();
      setStreaming(false);
    };
  };

  // Inline action handler
  const handleInlineEdit = async (action, tonePreset = null) => {
    setInlineLoading(true);
    setShowBubbleMenu(false);
    try {
      const payload = {
        text: highlightedText,
        action,
        tone: tonePreset
      };
      
      const { data } = await axios.post('/api/blogs/inline-edit', payload);
      if (data.success && data.text) {
        const { from, to } = editor.state.selection;
        editor.chain().focus().insertContentAt({ from, to }, data.text).run();
        setSaveStatus('Unsaved Changes');
      }
    } catch (err) {
      alert('Inline modification failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setInlineLoading(false);
    }
  };

  // Outline builders helper methods
  const addOutlineSection = () => {
    if (!newHeadingTitle.trim()) return;
    const newSection = {
      heading: newHeadingTitle,
      level: parseInt(newHeadingLevel),
      brief_intent: 'Manually added blueprint block.'
    };
    const updatedOutline = [...blog.outline, newSection];
    setBlog(prev => ({ ...prev, outline: updatedOutline }));
    setNewHeadingTitle('');
    setSaveStatus('Unsaved Changes');
  };

  const deleteOutlineSection = (index) => {
    const updatedOutline = blog.outline.filter((_, idx) => idx !== index);
    setBlog(prev => ({ ...prev, outline: updatedOutline }));
    setSaveStatus('Unsaved Changes');
  };

  const moveOutlineSection = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blog.outline.length - 1) return;
    
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updatedOutline = [...blog.outline];
    const temp = updatedOutline[index];
    updatedOutline[index] = updatedOutline[targetIdx];
    updatedOutline[targetIdx] = temp;

    setBlog(prev => ({ ...prev, outline: updatedOutline }));
    setSaveStatus('Unsaved Changes');
  };

  const toggleSectionLevel = (index) => {
    const updatedOutline = [...blog.outline];
    updatedOutline[index].level = updatedOutline[index].level === 2 ? 3 : 2;
    setBlog(prev => ({ ...prev, outline: updatedOutline }));
    setSaveStatus('Unsaved Changes');
  };

  const togglePublishStatus = () => {
    const nextStatus = blog.status === 'published' ? 'draft' : 'published';
    setBlog(prev => ({ ...prev, status: nextStatus }));
    setSaveStatus('Unsaved Changes');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-slate-400">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span>Configuring creator workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col max-h-screen overflow-hidden">
      {/* Editor Header Navigation */}
      <header className="h-16 border-b border-slate-800 bg-[#131b2e] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          
          <input
            type="text"
            className="bg-transparent border-none text-white font-bold text-lg focus:outline-none focus:ring-0 w-64 sm:w-96 truncate"
            value={blog?.title || ''}
            onChange={(e) => {
              setBlog(prev => ({ ...prev, title: e.target.value }));
              setSaveStatus('Unsaved Changes');
            }}
          />

          <span className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
            saveStatus === 'Saved' 
              ? 'bg-[#059669]/10 border-[#059669]/20 text-[#059669]' 
              : 'bg-amber-950/20 border-amber-500/20 text-amber-400'
          }`}>
            <CheckCircle size={12} />
            {saveStatus}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePublishStatus}
            className={`px-4 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
              blog?.status === 'published' 
                ? 'bg-emerald-950/20 border-emerald-500/30 text-[#059669] hover:bg-emerald-950/35' 
                : 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'
            }`}
          >
            {blog?.status === 'published' ? 'Published' : 'Mark Published'}
          </button>

          <button
            onClick={() => handleSave(false)}
            className="px-4 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save size={14} />
            Save Draft
          </button>
        </div>
      </header>

      {/* Main Workspace split panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Sidebar - Outline Config */}
        <aside className="w-[350px] border-r border-slate-800 bg-[#131b2e]/60 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-800 bg-[#0b0f19]/30 flex justify-between items-center shrink-0">
            <span className="text-sm font-bold text-white tracking-wide">Workspace Outline</span>
            {blog?.outline?.length > 0 && (
              <button
                onClick={generateOutline}
                disabled={outlineLoading}
                className="text-xs text-[#059669] hover:text-[#047857] font-semibold flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <Sparkles size={12} /> Regenerate
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 m-3 bg-red-950/30 border border-red-500/20 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Outline lists */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {outlineLoading ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#059669] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Generating Outline with Groq...</span>
              </div>
            ) : (!blog?.outline || blog.outline.length === 0) ? (
              <div className="py-16 text-center">
                <Sparkles size={36} className="mx-auto text-slate-700 mb-3" />
                <h4 className="text-slate-400 font-semibold text-sm">No outline generated</h4>
                <p className="text-slate-600 text-xs px-4 mt-1.5 mb-6">
                  Before streaming contents, build a dynamic sections blueprint.
                </p>
                <button
                  onClick={generateOutline}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles size={12} className="text-[#059669]" />
                  Build Blueprint
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {blog.outline.map((section, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-[#0b0f19]/80 border border-slate-850 hover:border-slate-800 rounded-xl flex items-start justify-between group transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          section.level === 2 
                            ? 'bg-emerald-950/30 text-[#059669] border border-emerald-500/10' 
                            : 'bg-indigo-950/30 text-indigo-400 border border-indigo-500/10'
                        }`}>
                          H{section.level}
                        </span>
                        
                        <input
                          type="text"
                          className="bg-transparent border-none text-slate-200 text-xs font-bold focus:outline-none focus:ring-0 p-0 w-48"
                          value={section.heading}
                          onChange={(e) => {
                            const updatedOutline = [...blog.outline];
                            updatedOutline[idx].heading = e.target.value;
                            setBlog(prev => ({ ...prev, outline: updatedOutline }));
                            setSaveStatus('Unsaved Changes');
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{section.brief_intent}</p>
                    </div>

                    {/* Actions on outline hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => toggleSectionLevel(idx)}
                        className="p-1 text-slate-500 hover:text-slate-350 cursor-pointer"
                        title="Toggle Header Level"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button 
                        onClick={() => moveOutlineSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-slate-350 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowUp size={10} />
                      </button>
                      <button 
                        onClick={() => moveOutlineSection(idx, 'down')}
                        disabled={idx === blog.outline.length - 1}
                        className="p-1 text-slate-500 hover:text-slate-350 disabled:opacity-20 cursor-pointer"
                      >
                        <ArrowDown size={10} />
                      </button>
                      <button 
                        onClick={() => deleteOutlineSection(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add heading section */}
          {blog?.outline?.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-[#0b0f19]/20 space-y-3 shrink-0">
              <span className="text-xs font-semibold text-slate-400 block">Append Blueprint Section</span>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Heading title..."
                  className="flex-1 px-3 py-1.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#059669] transition"
                  value={newHeadingTitle}
                  onChange={(e) => setNewHeadingTitle(e.target.value)}
                />
                
                <select
                  className="px-2 py-1.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-[#059669] transition"
                  value={newHeadingLevel}
                  onChange={(e) => setNewHeadingLevel(e.target.value)}
                >
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                </select>
              </div>

              <button
                type="button"
                onClick={addOutlineSection}
                className="w-full py-1.5 bg-[#131b2e] hover:bg-[#1a253f] border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus size={14} /> Add Section
              </button>
            </div>
          )}

          {/* Generate Draft button block */}
          {blog?.outline?.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-[#0b0f19]/40 shrink-0">
              <button
                type="button"
                onClick={startGenerationStream}
                disabled={streaming || outlineLoading}
                className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Play size={14} fill="currentColor" />
                {streaming ? 'Streaming AI Draft...' : 'Generate AI Draft'}
              </button>
            </div>
          )}
        </aside>

        {/* Right Workspace - Editor Panel */}
        <main className="flex-1 bg-[#0b0f19] p-8 overflow-y-auto relative flex justify-center">
          
          <div className="w-full max-w-3xl relative">
            {inlineLoading && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/20 text-[#059669] px-3 py-1.5 rounded-lg text-xs backdrop-blur shadow z-10">
                <div className="w-3.5 h-3.5 border-2 border-[#059669] border-t-transparent rounded-full animate-spin"></div>
                <span>Executing AI inline optimization...</span>
              </div>
            )}

            {/* Selection Popup Menu */}
            {showBubbleMenu && editor && (
              <div 
                style={{ top: bubbleMenuPos.top, left: bubbleMenuPos.left }}
                className="absolute z-30 flex items-center bg-[#131b2e] border border-slate-800 rounded-xl shadow-2xl p-1.5 gap-1 shrink-0 -translate-x-1/2 backdrop-blur-md"
              >
                <button
                  onClick={() => handleInlineEdit('humanize')}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-850 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles size={11} className="text-[#059669]" />
                  Humanize
                </button>
                
                <button
                  onClick={() => handleInlineEdit('expand')}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-850 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                >
                  Expand
                </button>

                <button
                  onClick={() => handleInlineEdit('condense')}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-850 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                >
                  Condense
                </button>

                <div className="w-[1px] h-4 bg-slate-800 mx-1"></div>

                <div className="relative group/tone">
                  <button
                    className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-850 rounded-lg text-[11px] font-semibold transition flex items-center gap-0.5 cursor-pointer"
                  >
                    Tone
                    <ChevronRight size={10} />
                  </button>
                  <div className="hidden group-hover/tone:flex flex-col absolute left-full top-0 ml-1 bg-[#131b2e] border border-slate-800 rounded-xl p-1 gap-0.5 shadow-2xl z-40 w-28">
                    {['Witty', 'Conversational', 'Highly Technical'].map(t => (
                      <button
                        key={t}
                        onClick={() => handleInlineEdit('tone', t)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg text-[10px] text-left font-medium transition cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rich Editor Canvas */}
            <div className="bg-[#131b2e]/30 border border-slate-850/60 rounded-2xl p-8 shadow-xl min-h-[500px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
