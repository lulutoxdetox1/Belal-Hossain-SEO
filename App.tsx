
import React, { useState, useRef } from 'react';
import { LANGUAGES, PREBUILT_VOICES } from './constants';
import { generateSpeech } from './services/geminiService';
import { GenerationHistory, Language, Voice } from './types';
import AudioVisualizer from './components/AudioVisualizer';

const App: React.FC = () => {
  const [text, setText] = useState('স্বাগতম! এটি এম ডি বেলাল হোসেনের তৈরি করা একটি উচ্চমানের AI টেক্সট টু স্পিচ সাইট। এটি ৭০টির বেশি ভাষা এবং ২০টির বেশি কণ্ঠে কথা বলতে পারে।');
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES.find(l => l.code === 'bn-BD') || LANGUAGES[0]);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(PREBUILT_VOICES.find(v => v.id === 'kore') || PREBUILT_VOICES[0]);
  const [genderFilter, setGenderFilter] = useState<'Male' | 'Female'>('Female');
  const [mood, setMood] = useState('Friendly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const filteredVoices = PREBUILT_VOICES.filter(v => v.gender === genderFilter);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("দয়া করে কিছু টেক্সট লিখুন।");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateSpeech(text, selectedLang.name, selectedVoice.id, mood);
      setAudioUrl(result.audioUrl);
      setAudioBuffer(result.buffer);
      
      const newHistory: GenerationHistory = {
        id: Date.now().toString(),
        text: text.length > 60 ? text.substring(0, 60) + "..." : text,
        language: selectedLang.name,
        voice: selectedVoice.name,
        timestamp: Date.now(),
        audioUrl: result.audioUrl
      };
      
      setHistory(prev => [newHistory, ...prev].slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'ভয়েস জেনারেট করতে সমস্যা হচ্ছে। আপনার API Key চেক করুন।');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert('টেক্সট কপি করা হয়েছে!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Banner/Nav */}
      <nav className="sticky top-0 z-50 glass-morphism border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-2.5 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <i className="fas fa-wave-square text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 leading-none">
                ai <span className="text-blue-600">Vox</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Premium TTS Service</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:flex items-center px-4 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100 text-[10px] font-black uppercase tracking-wider">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
               System Ready
             </div>
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs font-bold text-blue-600 hover:underline">Free Tier Active</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto mt-10 px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Editor Section (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex space-x-2">
              <button 
                onClick={copyToClipboard}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                title="Copy Text"
              >
                <i className="far fa-copy"></i>
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-10 h-1 border-b-4 border-blue-600 rounded-full mr-3"></div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Input Area</h2>
            </div>

            <textarea
              className="w-full h-72 text-xl font-medium bg-transparent border-none focus:ring-0 outline-none resize-none placeholder-slate-200 leading-relaxed text-slate-700"
              placeholder="আপনার যা মনে আসে তা এখানে লিখুন..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className={`w-full sm:flex-1 flex items-center justify-center space-x-3 py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98] ${
                  isGenerating 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-300'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-bolt-lightning text-yellow-400"></i>
                    <span>ভয়েস তৈরি করুন</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={() => { setText(''); setAudioUrl(null); setAudioBuffer(null); }}
                className="w-full sm:w-auto px-8 py-5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition font-black text-sm uppercase tracking-widest"
              >
                Clear
              </button>
            </div>
            
            {error && (
              <div className="mt-6 p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start space-x-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-red-100 p-2 rounded-lg">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider mb-1">Error Occurred</h4>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Player & Visualization Area */}
          {(audioUrl || audioBuffer) && (
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/20 text-white animate-in slide-in-from-bottom-10 duration-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="bg-blue-600/20 p-2 rounded-lg mr-3">
                    <i className="fas fa-volume-high text-blue-400"></i>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Audio Processing Engine</h3>
                </div>
                <div className="text-[10px] font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  {selectedVoice.name} | 24kHz PCM
                </div>
              </div>

              <AudioVisualizer audioBuffer={audioBuffer} isPlaying={isPlaying} currentTime={currentTime} />

              <div className="mt-8 flex items-center space-x-6">
                <button 
                  onClick={togglePlay}
                  className="w-20 h-20 flex items-center justify-center bg-white text-slate-900 rounded-full hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-90"
                >
                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-2xl`}></i>
                </button>
                
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">
                    <span>{currentTime.toFixed(1)}s</span>
                    <span>{audioBuffer?.duration.toFixed(1)}s</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer group" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const pct = x / rect.width;
                    if (audioRef.current) audioRef.current.currentTime = pct * (audioBuffer?.duration || 0);
                  }}>
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-300 relative" 
                      style={{ width: `${(currentTime / (audioBuffer?.duration || 1)) * 100}%` }}
                    >
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                  </div>
                </div>

                <a 
                  href={audioUrl || ''} 
                  download={`aivox-belal-${Date.now()}.wav`}
                  className="w-14 h-14 flex items-center justify-center bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-2xl transition-all border border-slate-700"
                  title="Download HQ Audio"
                >
                  <i className="fas fa-download"></i>
                </a>
              </div>

              <audio 
                ref={audioRef} 
                src={audioUrl || ''} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={onTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Sidebar Settings (4/12) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center">
               <i className="fas fa-sliders mr-2 text-blue-600"></i>
               Engine Configuration
            </h3>
            
            <div className="space-y-8">
              {/* Language Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Global Language</label>
                <div className="relative group">
                  <select 
                    value={selectedLang.code}
                    onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
                    className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 cursor-pointer text-sm font-bold transition-all hover:bg-white"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-transform group-hover:translate-y-0.5">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 px-1 italic">Supporting 70+ dialects via Gemini-2.5-Flash</p>
              </div>

              {/* Gender Switch */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Voice Profile</label>
                <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                  {(['Female', 'Male'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => { setGenderFilter(g); setSelectedVoice(PREBUILT_VOICES.find(v => v.gender === g)!); }}
                      className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${genderFilter === g ? 'bg-white text-blue-600 shadow-md translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <i className={`fas fa-${g === 'Female' ? 'venus' : 'mars'} mr-2`}></i>
                      {g === 'Female' ? 'নারী' : 'পুরুষ'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Selection Grid */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Voice Model (20+ Available)</label>
                <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredVoices.map(voice => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                        selectedVoice.id === voice.id 
                        ? 'bg-blue-50 border-blue-600 text-blue-900' 
                        : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-sm font-black">{voice.name}</span>
                        {selectedVoice.id === voice.id && <i className="fas fa-check-circle text-blue-600"></i>}
                      </div>
                      <div className={`text-[10px] font-bold mt-1 relative z-10 ${selectedVoice.id === voice.id ? 'text-blue-500' : 'text-slate-400'}`}>
                        {voice.description}
                      </div>
                      {selectedVoice.id === voice.id && (
                        <div className="absolute inset-0 bg-blue-600/5 animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Chips */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Vocal Dynamics</label>
                <div className="flex flex-wrap gap-2">
                  {['Friendly', 'Professional', 'Whisper', 'Excited', 'Narrative'].map(m => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                        mood === m 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <h4 className="font-black text-lg mb-3 relative z-10 italic">Pro Tip</h4>
            <p className="text-xs text-blue-50/80 leading-relaxed relative z-10 font-medium">
              সঠিক উচ্চারণের জন্য বিরাম চিহ্ন (দাঁড়ি, কমা) ব্যবহার করুন। এটি AI-কে আরও প্রাকৃতিকভাবে কথা বলতে সাহায্য করে। লম্বা টেক্সটের জন্য বিরতি ব্যবহার করা ভালো।
            </p>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 px-6">
        <div className="w-full h-px bg-slate-200 mb-12"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
              <i className="fas fa-fingerprint text-xs"></i>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">
              MD Belal Hossain
            </p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            &copy; 2025 ai Vox Engine. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <i className="fab fa-github hover:text-blue-600 cursor-pointer transition-colors"></i>
            <i className="fab fa-twitter hover:text-blue-600 cursor-pointer transition-colors"></i>
            <i className="fab fa-linkedin hover:text-blue-600 cursor-pointer transition-colors"></i>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-soft {
          animation: pulse-soft 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
