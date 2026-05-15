'use client';

import {
  useState, useRef, useEffect, useCallback,
  type DragEvent, type ChangeEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Square, SkipBack, SkipForward,
  Rewind, FastForward, Volume2, VolumeX, Upload,
  X, Search, Cpu, Mic2, Layers, Zap, Youtube,
  Network, Loader2, SlidersHorizontal,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Track = {
  id: string;
  title: string;
  artist?: string;
  src?: string;
  durationHint?: string;
  bpm?: number;
  mood?: string;
  intent?: string;
  local?: boolean;
  isYouTube?: boolean;
};

// ─── Demo library ─────────────────────────────────────────────────────────────

const DEMO_TRACKS: Track[] = [
  {
    id: 'farm-dayzz',
    title: 'Farm Dayzz',
    artist: 'Sterl',
    src: '/audio/farm-dayzz.mp3',
    bpm: 88,
    mood: 'Country Flow',
    intent: 'Warm Nostalgia',
    durationHint: '--:--',
  },
  {
    id: 'neon-morsecode',
    title: 'Neon Morsecode',
    artist: 'Sterl Audio Lab',
    src: '/audio/neon-morsecode.mp3',
    bpm: 92,
    mood: 'Cinematic Slowburn',
    intent: 'Austere Catharsis',
    durationHint: '3:42',
  },
  {
    id: 'liquid-noir',
    title: 'Liquid Noir',
    artist: 'Alic3X Studio',
    bpm: 118,
    mood: 'Dark Tension',
    intent: 'Visceral Release',
    durationHint: '4:15',
  },
  {
    id: 'walker-blueprint',
    title: 'Walker Blueprint',
    artist: 'Sterl × Alic3X',
    bpm: 140,
    mood: 'Euphoric Drive',
    intent: 'Kinetic Momentum',
    durationHint: '3:58',
  },
  {
    id: 'hollow-signal',
    title: 'Hollow Signal',
    artist: 'Alic3X Studio',
    bpm: 76,
    mood: 'Minimal Weight',
    intent: 'Clinical Silence',
    durationHint: '5:02',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function validateAudio(file: File) {
  const types = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
  const exts = ['.mp3', '.wav'];
  return types.includes(file.type) || exts.some(e => file.name.toLowerCase().endsWith(e));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TapeReel({ isPlaying, side }: { isPlaying: boolean; side: 'L' | 'R' }) {
  const spokes = [0, 60, 120, 180, 240, 300];
  return (
    <div className="relative w-[88px] h-[88px] shrink-0">
      {/* outer casing */}
      <div className="absolute inset-0 rounded-full bg-zinc-900 border border-amber-400/20 shadow-inner shadow-black/60" />
      <motion.svg
        viewBox="0 0 88 88"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ duration: 2.8, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
      >
        {spokes.map(angle => {
          const rad = ((angle - 90) * Math.PI) / 180;
          return (
            <line
              key={angle}
              x1="44" y1="44"
              x2={44 + 28 * Math.cos(rad)}
              y2={44 + 28 * Math.sin(rad)}
              stroke="rgba(251,191,36,0.28)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
        <circle cx="44" cy="44" r="32" fill="none" stroke="rgba(251,191,36,0.12)" strokeWidth="1" />
        <circle cx="44" cy="44" r="10" fill="rgba(251,191,36,0.35)" />
        <circle cx="44" cy="44" r="5"  fill="rgba(251,191,36,0.65)" />
      </motion.svg>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-widest text-amber-400/30 select-none">
        {side}
      </span>
    </div>
  );
}

function VUBar({ level }: { level: number }) {
  const color =
    level > 0.85 ? '#f87171' :
    level > 0.65 ? '#fbbf24' :
    '#d97706';
  return (
    <motion.div
      className="w-[5px] rounded-sm origin-bottom"
      style={{ background: color }}
      animate={{ height: `${Math.max(3, level * 44)}px` }}
      transition={{ duration: 0.09, ease: 'easeOut' }}
    />
  );
}

function VUMeter({ levels, label }: { levels: number[]; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-400/40">{label}</span>
      <div className="flex items-end gap-[3px] h-11">
        {levels.map((l, i) => <VUBar key={i} level={l} />)}
      </div>
    </div>
  );
}

function PillarCard({
  icon: Icon, title, subtitle, accent,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accent: 'amber' | 'cyan';
}) {
  const border = accent === 'amber' ? 'border-amber-400/20 text-amber-300' : 'border-cyan-400/20 text-cyan-300';
  return (
    <div className={`rounded-xl border ${border} bg-black/20 p-3 flex flex-col gap-1.5`}>
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 opacity-60" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">{title}</span>
      </div>
      <span className="text-[9px] leading-relaxed opacity-40">{subtitle}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Alic3XCassetteProducerUI() {
  const [tracks, setTracks]           = useState<Track[]>(DEMO_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [volume, setVolume]           = useState(0.8);
  const [isMuted, setIsMuted]         = useState(false);
  const [progress, setProgress]       = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [isDragOver, setIsDragOver]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab]     = useState<'queue' | 'youtube' | 'protocol'>('queue');
  const [youtubeUrl, setYoutubeUrl]   = useState('');
  const [ytStatus, setYtStatus]       = useState<'idle' | 'loading' | 'error'>('idle');
  const [ytError, setYtError]         = useState('');
  const [vuL, setVuL] = useState<number[]>(Array(8).fill(0));
  const [vuR, setVuR] = useState<number[]>(Array(8).fill(0));

  const audioRef   = useRef<HTMLAudioElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const vuTimer    = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = tracks[currentIndex];

  // ── VU meter animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      vuTimer.current = setInterval(() => {
        setVuL(Array.from({ length: 8 }, () => Math.random() * 0.72 + 0.1));
        setVuR(Array.from({ length: 8 }, () => Math.random() * 0.68 + 0.08));
      }, 95);
    } else {
      if (vuTimer.current) clearInterval(vuTimer.current);
      setVuL(p => p.map(v => v * 0.25));
      setVuR(p => p.map(v => v * 0.25));
    }
    return () => { if (vuTimer.current) clearInterval(vuTimer.current); };
  }, [isPlaying]);

  // ── Audio events ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setCurrentTime(a.currentTime);
      setProgress(a.duration ? a.currentTime / a.duration : 0);
    };
    const onMeta = () => setDuration(a.duration);
    const onEnd  = () => {
      if (currentIndex < tracks.length - 1) setCurrentIndex(i => i + 1);
      else setIsPlaying(false);
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
    };
  }, [currentIndex, tracks.length]);

  // ── Playback control ─────────────────────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) a.play().catch(() => setIsPlaying(false));
    else a.pause();
  }, [isPlaying]);

  // ── Track swap ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const t = tracks[currentIndex];
    if (t?.src) {
      a.src = t.src;
      if (isPlaying) a.play().catch(() => setIsPlaying(false));
    } else {
      a.removeAttribute('src');
      a.load();
    }
    setProgress(0); setCurrentTime(0); setDuration(0);
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Volume ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space')      { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.code === 'ArrowRight') seek(10);
      if (e.code === 'ArrowLeft')  seek(-10);
      if (e.code === 'ArrowUp')    { e.preventDefault(); setVolume(v => Math.min(1, v + 0.05)); }
      if (e.code === 'ArrowDown')  { e.preventDefault(); setVolume(v => Math.max(0, v - 0.05)); }
      if (e.code === 'KeyN')       goNext();
      if (e.code === 'KeyB')       goPrev();
      if (e.code === 'KeyS')       stop();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Controls ──────────────────────────────────────────────────────────────────
  const seek = (sec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + sec));
    }
  };

  const seekTo = (ratio: number) => {
    if (audioRef.current && duration) audioRef.current.currentTime = ratio * duration;
  };

  const stop = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
    setProgress(0); setCurrentTime(0);
  };

  const goNext = () => {
    setCurrentIndex(i => Math.min(i + 1, tracks.length - 1));
    setIsPlaying(true);
  };

  const goPrev = () => {
    if (currentTime > 3 && audioRef.current) { audioRef.current.currentTime = 0; return; }
    setCurrentIndex(i => Math.max(i - 1, 0));
    setIsPlaying(true);
  };

  // ── Upload ───────────────────────────────────────────────────────────────────
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const added: Track[] = [];
    for (const file of Array.from(files)) {
      if (!validateAudio(file)) continue;
      added.push({
        id: `local-${Date.now()}-${file.name}`,
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Local Upload',
        src: URL.createObjectURL(file),
        bpm: 0,
        mood: 'Pending Alic3X Scan',
        intent: 'Untagged',
        local: true,
      });
    }
    if (added.length) {
      setTracks(prev => [...added, ...prev]);
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, []);

  const removeTrack = useCallback((id: string) => {
    setTracks(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const t = prev[idx];
      if (t?.local && t.src) URL.revokeObjectURL(t.src);
      if (idx <= currentIndex && currentIndex > 0) setCurrentIndex(c => c - 1);
      return prev.filter(t => t.id !== id);
    });
  }, [currentIndex]);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ── YouTube bridge ────────────────────────────────────────────────────────────
  const resolveYT = async () => {
    if (!youtubeUrl.trim()) return;
    setYtStatus('loading'); setYtError('');
    try {
      const res = await fetch(`/api/youtube/info?url=${encodeURIComponent(youtubeUrl)}`);
      if (!res.ok) throw new Error((await res.json()).error ?? 'Resolver failed.');
      const data = await res.json();
      setTracks(prev => [{
        id: `yt-${data.video_id}-${Date.now()}`,
        title: data.title,
        artist: data.author ?? 'YouTube',
        src: data.stream_url,
        durationHint: data.duration_fmt ?? '--:--',
        bpm: 128,
        mood: 'YouTube Bridge',
        intent: 'Pending Alic3X Scan',
        isYouTube: true,
      }, ...prev]);
      setCurrentIndex(0);
      setIsPlaying(true);
      setYoutubeUrl('');
      setYtStatus('idle');
      setActiveTab('queue');
    } catch (err) {
      setYtError(err instanceof Error ? err.message : 'Backend resolver not implemented.');
      setYtStatus('error');
    }
  };

  const filtered = tracks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.artist ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabBtn = (tab: typeof activeTab, label: string) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition ${
        activeTab === tab ? 'bg-amber-400/15 text-amber-400' : 'text-white/30 hover:text-white/60'
      }`}
    >
      {label}
    </button>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-white p-4 md:p-6 font-mono selection:bg-amber-400/20">
      <audio ref={audioRef} preload="metadata" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-black tracking-[0.32em] text-amber-400">ALIC3X</span>
          <span className="text-[10px] font-bold text-white/25 tracking-[0.3em] uppercase">Audio Producer</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <span className="text-[9px] tracking-[0.28em] text-amber-400/50 uppercase">Engine Active</span>
        </div>
      </header>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-4">

        {/* ── LEFT: Cassette deck ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Cassette body */}
          <div className="rounded-2xl border border-amber-400/12 bg-zinc-950 p-5 shadow-2xl shadow-black/60">

            {/* Reels + track window */}
            <div className="flex items-center gap-5 mb-5">
              <TapeReel isPlaying={isPlaying} side="L" />

              <div className="flex-1 rounded-xl border border-white/8 bg-black/50 px-4 py-3 min-h-[84px] flex flex-col justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={track?.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <p className="text-sm font-black tracking-wide truncate">
                          {track?.title ?? 'No Track Loaded'}
                        </p>
                        <p className="text-[11px] text-white/40 truncate mt-0.5">
                          {track?.artist ?? '---'}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                        {!!track?.bpm && (
                          <span className="text-[9px] font-bold border border-amber-400/30 text-amber-400 px-1.5 py-0.5 rounded">
                            {track.bpm} BPM
                          </span>
                        )}
                        {track?.local && (
                          <span className="text-[9px] font-bold border border-cyan-400/30 text-cyan-400 px-1.5 py-0.5 rounded">LOCAL</span>
                        )}
                        {track?.isYouTube && (
                          <span className="text-[9px] font-bold border border-red-400/30 text-red-400 px-1.5 py-0.5 rounded">YT</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {track?.mood && (
                        <span className="text-[10px] text-white/30">
                          <span className="text-white/15 mr-1">MOOD</span>{track.mood}
                        </span>
                      )}
                      {track?.intent && (
                        <span className="text-[10px] text-white/30">
                          <span className="text-white/15 mr-1">INTENT</span>{track.intent}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <TapeReel isPlaying={isPlaying} side="R" />
            </div>

            {/* VU meters + step counter */}
            <div className="flex items-end gap-6 mb-5 px-1">
              <VUMeter levels={vuL} label="L" />
              <VUMeter levels={vuR} label="R" />
              <div className="flex-1" />
              <div className="flex flex-col items-end gap-0.5 pb-1">
                <span className="text-[9px] text-white/15 uppercase tracking-widest">Step</span>
                <span className="text-xl font-black text-amber-400/50 tabular-nums leading-none">
                  {String(currentIndex + 1).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div
              role="slider"
              aria-label="Track progress"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 bg-white/8 rounded-full mb-1 cursor-pointer group relative"
              onClick={e => {
                const r = e.currentTarget.getBoundingClientRect();
                seekTo((e.clientX - r.left) / r.width);
              }}
            >
              <div className="h-full bg-amber-400 rounded-full relative transition-all" style={{ width: `${progress * 100}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-300 shadow shadow-amber-400/60 scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>

            {/* Time */}
            <div className="flex justify-between text-[10px] text-white/25 mb-5 tabular-nums px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{duration ? formatTime(duration) : (track?.durationHint ?? '--:--')}</span>
            </div>

            {/* Transport */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <button
                onClick={() => seek(-30)}
                aria-label="Rewind 30 seconds"
                className="p-2 rounded-lg text-white/35 hover:text-amber-400 hover:bg-amber-400/10 transition"
              >
                <Rewind className="w-4 h-4" />
              </button>
              <button
                onClick={goPrev}
                aria-label="Previous track"
                className="p-2 rounded-lg text-white/55 hover:text-white hover:bg-white/8 transition"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(p => !p)}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                aria-pressed={isPlaying}
                className="w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-black flex items-center justify-center shadow-lg shadow-amber-400/20 transition"
              >
                {isPlaying
                  ? <Pause className="w-6 h-6" />
                  : <Play  className="w-6 h-6 translate-x-0.5" />
                }
              </button>

              <button
                onClick={goNext}
                aria-label="Next track"
                className="p-2 rounded-lg text-white/55 hover:text-white hover:bg-white/8 transition"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button
                onClick={() => seek(30)}
                aria-label="Fast forward 30 seconds"
                className="p-2 rounded-lg text-white/35 hover:text-amber-400 hover:bg-amber-400/10 transition"
              >
                <FastForward className="w-4 h-4" />
              </button>
              <button
                onClick={stop}
                aria-label="Stop"
                className="p-2 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-400/10 transition"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(m => !m)}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                aria-pressed={isMuted}
                className="text-white/35 hover:text-white transition shrink-0"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div
                className="flex-1 h-1.5 bg-white/8 rounded-full cursor-pointer relative"
                onClick={e => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
                  setIsMuted(false);
                }}
              >
                <div
                  className="h-full bg-white/35 rounded-full"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-white/25 w-7 text-right tabular-nums">
                {Math.round((isMuted ? 0 : volume) * 100)}
              </span>
            </div>
          </div>

          {/* 4-pillar cards */}
          <div className="grid grid-cols-2 gap-2">
            <PillarCard icon={Layers}           title="Lexical Sifting"  accent="cyan"
              subtitle="160–190 words · hollow space · high imagery density" />
            <PillarCard icon={SlidersHorizontal} title="Structural Tags"  accent="amber"
              subtitle="[Intro] [Build] [Chorus / Drop] [Bridge] [Outro]" />
            <PillarCard icon={Zap}              title="Sonic Synthesis"  accent="amber"
              subtitle="BPM · mood · texture · sidechain · reverb tail" />
            <PillarCard icon={Mic2}             title="Vocal Texture"    accent="cyan"
              subtitle="ethereal · close-mic · breathy · cinematic restraint" />
          </div>
        </div>

        {/* ── RIGHT: Queue / YouTube / Protocol ────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* Tabs */}
          <div className="flex rounded-xl border border-white/8 overflow-hidden">
            {tabBtn('queue',    'Queue')}
            {tabBtn('youtube',  'YouTube')}
            {tabBtn('protocol', 'Protocol')}
          </div>

          {/* ── Queue tab ──────────────────────────────────────────────────── */}
          {activeTab === 'queue' && (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                <input
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  placeholder="Search queue…"
                  className="w-full bg-black/30 border border-white/8 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-amber-400/30 transition"
                />
              </div>

              <div className="flex flex-col gap-0.5 max-h-[300px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-center py-10 text-white/20 text-xs">No tracks found</p>
                ) : filtered.map(t => {
                  const ri = tracks.indexOf(t);
                  const active = ri === currentIndex;
                  return (
                    <div
                      key={t.id}
                      aria-current={active ? 'true' : undefined}
                      onClick={() => { setCurrentIndex(ri); setIsPlaying(true); }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition group ${
                        active
                          ? 'bg-amber-400/12 border border-amber-400/18'
                          : 'hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="w-5 shrink-0 flex items-center justify-center">
                        {active && isPlaying ? (
                          <motion.div
                            className="w-2 h-2 rounded-full bg-amber-400"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 0.75, repeat: Infinity }}
                          />
                        ) : (
                          <span className="text-[10px] text-white/18 tabular-nums">
                            {String(ri + 1).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${active ? 'text-amber-300' : 'text-white/65'}`}>
                          {t.title}
                        </p>
                        <p className="text-[10px] text-white/25 truncate">{t.artist ?? '---'}</p>
                      </div>
                      {!!t.bpm && (
                        <span className="text-[9px] text-white/18 shrink-0 tabular-nums">{t.bpm}</span>
                      )}
                      {t.local && (
                        <button
                          onClick={e => { e.stopPropagation(); removeTrack(t.id); }}
                          aria-label={`Remove ${t.title}`}
                          className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 transition shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Upload zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition ${
                  isDragOver
                    ? 'border-amber-400/55 bg-amber-400/8'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <Upload className={`w-5 h-5 mx-auto mb-2 transition ${isDragOver ? 'text-amber-400' : 'text-white/22'}`} />
                <p className="text-[11px] text-white/35">
                  {isDragOver ? 'Drop to add to queue' : 'Drop .mp3 or .wav here'}
                </p>
                <p className="text-[10px] text-white/18 mt-1">or click to browse</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  multiple
                  className="sr-only"
                  aria-label="Upload audio files"
                  onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
                />
              </div>
            </div>
          )}

          {/* ── YouTube tab ────────────────────────────────────────────────── */}
          {activeTab === 'youtube' && (
            <div className="rounded-xl border border-white/8 bg-black/20 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">YouTube Bridge</span>
              </div>
              <p className="text-[10px] text-white/28 leading-relaxed">
                Paste a YouTube URL. Requires a backend resolver — see{' '}
                <code className="text-white/40">app/api/youtube/info/route.ts</code>.
              </p>
              <input
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && resolveYT()}
                placeholder="https://youtube.com/watch?v=…"
                className="w-full bg-black/30 border border-white/8 rounded-xl px-3 py-2 text-xs text-white placeholder-white/18 outline-none focus:border-red-400/30 transition"
              />
              <button
                onClick={resolveYT}
                disabled={ytStatus === 'loading' || !youtubeUrl.trim()}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-400/22 bg-red-400/8 py-2.5 text-xs font-bold text-red-300 hover:bg-red-400/14 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {ytStatus === 'loading'
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving…</>
                  : <><Youtube className="w-3.5 h-3.5" /> Add to Queue</>
                }
              </button>
              {ytStatus === 'error' && (
                <div role="alert" className="rounded-xl border border-red-400/18 bg-red-400/8 p-3 text-[11px] text-red-300 leading-relaxed">
                  {ytError}
                </div>
              )}
            </div>
          )}

          {/* ── Protocol tab ───────────────────────────────────────────────── */}
          {activeTab === 'protocol' && (
            <div className="rounded-xl border border-white/8 bg-black/20 p-4 flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-1">
                Active Track · Alic3X Analysis
              </p>
              {[
                ['Design System', 'Cyberpunk Obsidian'],
                ['Mood',          track?.mood   ?? '---'],
                ['Intent',        track?.intent ?? '---'],
                ['BPM',           track?.bpm ? `${track.bpm} BPM` : '---'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <p className="text-[9px] text-white/22 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-xs text-white/65">{value}</p>
                </div>
              ))}
              <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                <p className="text-[9px] text-white/22 uppercase tracking-widest mb-1.5">Structure</p>
                {['[Intro]', '[Build]', '[Chorus / Drop]', '[Bridge]', '[Outro]'].map(tag => (
                  <p key={tag} className="text-[10px] text-amber-400/55 font-mono leading-relaxed">{tag}</p>
                ))}
              </div>
            </div>
          )}

          {/* ComfyUI badge */}
          <div className="rounded-xl border border-cyan-400/12 bg-cyan-400/[0.03] p-3 flex items-center gap-3">
            <Network className="w-4 h-4 text-cyan-400/50 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-400/55">ComfyUI Add-On</p>
              <p className="text-[9px] text-white/20 mt-0.5 truncate">Visual workflow bridge · optional module</p>
            </div>
            <Cpu className="w-3.5 h-3.5 text-cyan-400/25 shrink-0" />
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="mt-6 flex items-center justify-between text-[9px] text-white/12 uppercase tracking-[0.22em] select-none">
        <span>Alic3X Audio Producer · v0.1</span>
        <span>Human Intent → Machine Cognition</span>
      </footer>
    </div>
  );
}
