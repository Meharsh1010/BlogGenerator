import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, X, BookOpen, User, Volume2, AlignLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';

const STEPS = [
  { id: 'title', name: 'Topic' },
  { id: 'audience', name: 'Audience & Goal' },
  { id: 'tone', name: 'Voice & Tone' },
  { id: 'grounding', name: 'Reference Context' }
];

const AUDIENCE_OPTIONS = ['Casual Readers', 'Tech Enthusiasts', 'Corporate Executives', 'Students'];
const OBJECTIVE_OPTIONS = ['Inform/Educate', 'Persuade/Sell', 'Entertain', 'Storytelling'];
const TONE_OPTIONS = ['Empathetic', 'Conversational', 'Witty', 'Academic', 'Highly Technical'];

export default function Wizard({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState(AUDIENCE_OPTIONS[0]);
  const [objective, setObjective] = useState(OBJECTIVE_OPTIONS[0]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [groundingContext, setGroundingContext] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 0 && !title.trim()) {
      setError('A working title or topic is required to continue.');
      return;
    }
    setError('');
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError('');
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        title,
        configuration: {
          targetAudience,
          objective,
          tone,
          groundingContext
        }
      };

      const { data } = await axios.post('/api/blogs', payload);
      if (data.success) {
        onComplete(data.blog);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create blog project.');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-[#131b2e] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b0f19]/50">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Sparkles size={18} className="text-[#059669]" />
            <span>Workspace Alignment Profiler</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress Map */}
        <div className="flex px-8 py-4 bg-[#0b0f19]/35 border-b border-slate-800/50 justify-between items-center text-xs">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-medium border ${
                idx <= currentStep 
                  ? 'bg-[#059669]/20 border-[#059669] text-[#059669]' 
                  : 'border-slate-800 text-slate-500'
              }`}>
                {idx < currentStep ? <Check size={10} strokeWidth={3} /> : idx + 1}
              </span>
              <span className={idx === currentStep ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                {step.name}
              </span>
              {idx < STEPS.length - 1 && <div className="w-6 h-[1px] bg-slate-800 hidden sm:block mx-1"></div>}
            </div>
          ))}
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/30 border border-red-500/20 text-red-300 text-sm rounded-lg flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Step Body */}
        <div className="flex-1 p-8 overflow-y-auto min-h-[250px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full flex flex-col justify-center"
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <BookOpen size={20} className="text-[#059669]" />
                    <h3 className="text-lg font-medium text-slate-200">Define your topic</h3>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Enter the topic, prompt context, or tentative headline you wish to create.
                  </p>
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Working Title / Theme</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#0b0f19] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition"
                      placeholder="e.g., The Future of Agentic Software Architectures"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setError('');
                      }}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <User size={20} className="text-[#059669]" />
                    <h3 className="text-lg font-medium text-slate-200">Who is this for?</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Target Demographic</label>
                      <select
                        className="w-full px-4 py-3 bg-[#0b0f19] border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                      >
                        {AUDIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Primary Objective</label>
                      <select
                        className="w-full px-4 py-3 bg-[#0b0f19] border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                      >
                        {OBJECTIVE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <Volume2 size={20} className="text-[#059669]" />
                    <h3 className="text-lg font-medium text-slate-200">Align voice and tone</h3>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Narrative Style Preset</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {TONE_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setTone(opt)}
                          className={`px-4 py-3 rounded-xl border text-sm font-medium transition cursor-pointer text-left ${
                            tone === opt 
                              ? 'bg-[#059669]/10 border-[#059669] text-white' 
                              : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <AlignLeft size={20} className="text-[#059669]" />
                    <h3 className="text-lg font-medium text-slate-200">Grounding sources (Optional)</h3>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Paste up to 8,000 characters of facts, raw data or URLs. The Groq agent uses this to minimize hallucinations.
                  </p>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Reference context</label>
                      <span className={`text-[10px] ${groundingContext.length > 8000 ? 'text-red-400' : 'text-slate-500'}`}>
                        {groundingContext.length} / 8000 characters
                      </span>
                    </div>
                    <textarea
                      maxLength={8200}
                      rows={6}
                      className="w-full px-4 py-3 bg-[#0b0f19] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition resize-none font-mono text-xs"
                      placeholder="Paste bullet notes, stats, or reference data here..."
                      value={groundingContext}
                      onChange={(e) => setGroundingContext(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center px-8 py-4 border-t border-slate-800 bg-[#0b0f19]/30">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
            className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || groundingContext.length > 8000}
              className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-medium rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Aligning Workspace...
                </>
              ) : (
                <>
                  Create Workspace
                  <Sparkles size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
