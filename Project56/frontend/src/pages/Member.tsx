import { createSignal, onMount } from 'solid-js';
import { isAuthenticated, user, fetchProfile } from '../stores/auth';
import { apiFetch } from '../api/client';
import { A } from '@solidjs/router';
import { Crown, Gift, CheckCircle, Star, TrendingUp } from 'lucide-solid';

interface Task { id: number; name: string; points: number; completed: boolean; }

const fallbackTasks: Task[] = [
  { id: 1, name: '\u6BCF\u65E5\u7B7E\u5230', points: 10, completed: false },
  { id: 2, name: '\u5206\u4EAB\u5546\u54C1', points: 20, completed: false },
  { id: 3, name: '\u9996\u6B21\u8D2D\u4E70', points: 100, completed: true },
  { id: 4, name: '\u9080\u8BF7\u597D\u53CB', points: 50, completed: false },
  { id: 5, name: '\u8BC4\u4EF7\u5546\u54C1', points: 15, completed: true },
];

const levelNames = ['\u9752\u94DC\u4F1A\u5458', '\u767D\u94F6\u4F1A\u5458', '\u9EC4\u91D1\u4F1A\u5458', '\u94C2\u91D1\u4F1A\u5458', '\u94BB\u77F3\u4F1A\u5458'];
const levelThresholds = [0, 500, 2000, 5000, 10000];

export default function Member() {
  const [signedIn, setSignedIn] = createSignal(false);
  const [tasks, setTasks] = createSignal<Task[]>(fallbackTasks);

  onMount(async () => { if (isAuthenticated()) fetchProfile(); try { const t = await apiFetch<any[]>('/members/tasks/'); setTasks(t); } catch {} });

  const level = () => user()?.level || 1;
  const points = () => user()?.points || 0;
  const growthProgress = () => {
    const lvl = level();
    if (lvl >= 5) return 100;
    const current = levelThresholds[lvl - 1];
    const next = levelThresholds[lvl];
    return Math.min(100, Math.round(((points() - current) / (next - current)) * 100));
  };

  const handleCompleteTask = (taskId: number) => { setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t)); };

  return (
    <div>
      <div class="rounded-xl p-6 mb-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}><Crown size={32} /></div>
          <div>
            <h2 class="text-xl font-bold">{user()?.username || '\u672A\u767B\u5F55'}</h2>
            <p class="text-sm opacity-90">{levelNames[level() - 1]}</p>
          </div>
        </div>
        <div class="mb-2">
          <div class="flex justify-between text-sm mb-1"><span>{'\u6210\u957F\u503C'}</span><span>{points()} / {levelThresholds[level()] || 'MAX'}</span></div>
          <div class="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}><div class="h-full rounded-full transition-all" style={{ width: growthProgress() + '%', background: 'var(--color-accent)' }} /></div>
        </div>
        <div class="flex items-center gap-2 mt-3"><Gift size={16} /><span class="text-sm">{'\u79EF\u5206'}: {points()}</span></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <h3 class="font-bold mb-4 flex items-center gap-2"><Star size={18} style={{ color: 'var(--color-accent)' }} /> {'\u6BCF\u65E5\u7B7E\u5230'}</h3>
          <button onClick={async () => { try { await apiFetch('/members/profiles/checkin/', { method: 'POST' }); setSignedIn(true); } catch { alert('Check-in failed'); } }} disabled={signedIn()} class="w-full py-3 rounded-lg font-medium text-white transition-all" style={{ background: signedIn() ? 'var(--color-text-light)' : 'var(--color-primary)', cursor: signedIn() ? 'default' : 'pointer' }}>{signedIn() ? '\u5DF2\u7B7E\u5230' : '\u7B7E\u5230'}</button>
          <p class="text-xs mt-2 text-center" style={{ color: 'var(--color-text-light)' }}>{'\u6BCF\u65E5\u7B7E\u5230\u53EF\u83B7\u5F9710\u79EF\u5206'}</p>
        </div>
        <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <h3 class="font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} style={{ color: 'var(--color-secondary)' }} /> {'\u4F1A\u5458\u7B49\u7EA7\u8BF4\u660E'}</h3>
          <div class="space-y-2">{levelNames.map((name, i) => <div class="flex justify-between text-sm"><span>{name}</span><span style={{ color: 'var(--color-text-light)' }}>{levelThresholds[i]}{'\u79EF\u5206'}</span></div>)}</div>
        </div>
      </div>

      <div class="rounded-xl p-5 mb-6" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <h3 class="font-bold mb-4 flex items-center gap-2"><Gift size={18} style={{ color: 'var(--color-accent)' }} /> {'\u79EF\u5206\u6982\u89C8'}</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div><p class="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{points()}</p><p class="text-xs" style={{ color: 'var(--color-text-light)' }}>{'\u5F53\u524D\u79EF\u5206'}</p></div>
          <div><p class="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>120</p><p class="text-xs" style={{ color: 'var(--color-text-light)' }}>{'\u7D2F\u8BA1\u83B7\u5F97'}</p></div>
          <div><p class="text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>0</p><p class="text-xs" style={{ color: 'var(--color-text-light)' }}>{'\u5DF2\u4F7F\u7528'}</p></div>
        </div>
      </div>

      <div class="rounded-xl p-5" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <h3 class="font-bold mb-4">{'\u4F1A\u5458\u4EFB\u52A1'}</h3>
        <div class="space-y-3">
          {tasks().map(task => (
            <div class="flex items-center justify-between py-2" style={{ 'border-bottom': '1px solid var(--color-border)' }}>
              <div><p class="text-sm font-medium">{task.name}</p><p class="text-xs" style={{ color: 'var(--color-accent)' }}>+{task.points}{'\u79EF\u5206'}</p></div>
              {task.completed ? <span class="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-light)' }}><CheckCircle size={14} /> {'\u5DF2\u5B8C\u6210'}</span> : <A href="/products" class="text-xs px-3 py-1 rounded text-white" style={{ background: 'var(--color-primary)' }} onClick={() => handleCompleteTask(task.id)}>{'\u53BB\u5B8C\u6210'}</A>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

