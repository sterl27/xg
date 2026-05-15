'use client';

import { useState } from 'react';
import { Network, Loader2, Image as ImageIcon } from 'lucide-react';

const DESIGN_SYSTEMS = ['Cyberpunk Obsidian', 'Liquid Noir', 'Walker Blueprint'];
const WORKFLOW_TYPES = ['Cover Art', 'Visualizer Frame', 'Lyric Video Still', 'Moodboard'];

type Props = {
  trackTitle?: string;
  bpm?: number;
  mood?: string;
};

export default function Alic3XComfyAddon({
  trackTitle = 'Untitled Session',
  bpm = 92,
  mood = 'Austere Catharsis',
}: Props) {
  const [designSystem, setDesignSystem] = useState(DESIGN_SYSTEMS[0]);
  const [workflowType, setWorkflowType] = useState(WORKFLOW_TYPES[0]);
  const [status, setStatus]             = useState<'idle' | 'loading' | 'queued' | 'error'>('idle');
  const [promptId, setPromptId]         = useState('');
  const [error, setError]               = useState('');

  const promptPreview =
    `${workflowType.toLowerCase()} for "${trackTitle}", ` +
    `${designSystem.toLowerCase()} design system, ${bpm} BPM, ${mood.toLowerCase()} mood`;

  const queueWorkflow = async () => {
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/comfy/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: {
            trackTitle, designSystem, workflowType, bpm, mood,
            prompt: promptPreview,
            negativePrompt: 'low quality, blurry, noisy, distorted text',
          },
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Queue failed.');
      const data = await res.json();
      setPromptId(data.prompt_id ?? 'queued');
      setStatus('queued');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'ComfyUI not reachable. Ensure it is running at COMFY_URL.'
      );
      setStatus('error');
    }
  };

  const selectCls =
    'w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white ' +
    'outline-none focus:border-cyan-200/40 transition appearance-none';

  return (
    <section className="rounded-[1.75rem] border border-cyan-200/15 bg-black/35 p-5 backdrop-blur-xl font-mono">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-cyan-200/25 bg-cyan-300/10 text-cyan-100">
            <Network className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">ComfyUI Add-On</h2>
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">workflow queue bridge</p>
          </div>
        </div>
        <ImageIcon className="size-5 text-cyan-100/40" />
      </div>

      <div className="grid gap-3">
        <label className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/60">Design System</span>
          <select value={designSystem} onChange={e => setDesignSystem(e.target.value)} className={selectCls}>
            {DESIGN_SYSTEMS.map(s => (
              <option key={s} value={s} className="bg-[#101719]">{s}</option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/60">Workflow Type</span>
          <select value={workflowType} onChange={e => setWorkflowType(e.target.value)} className={selectCls}>
            {WORKFLOW_TYPES.map(t => (
              <option key={t} value={t} className="bg-[#101719]">{t}</option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white/30">Prompt Preview</p>
          <p className="text-xs leading-relaxed text-cyan-50/55">{promptPreview}</p>
        </div>

        <button
          onClick={queueWorkflow}
          disabled={status === 'loading'}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200/25 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {status === 'loading'
            ? <><Loader2 className="size-4 animate-spin" /> Queueing…</>
            : <><Network className="size-4" /> Queue ComfyUI Workflow</>
          }
        </button>

        {status === 'queued' && (
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            Workflow queued.{' '}
            <span className="text-[11px] opacity-70">Prompt ID: </span>
            <span className="font-mono text-[11px]">{promptId}</span>
          </div>
        )}

        {status === 'error' && error && (
          <div role="alert" className="rounded-2xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100 leading-relaxed">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
