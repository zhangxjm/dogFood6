import { useEffect, useState } from 'react';
import { TrendingUp, Edit3, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Modal from '@/components/Modal';

export default function Progress() {
  const {
    subjects,
    studyRecords,
    studyStats,
    fetchSubjects,
    fetchStudyRecords,
    fetchStudyStats,
    updateSubjectProgress,
    addStudyRecord,
    loading,
  } = useStore();

  const [editSubject, setEditSubject] = useState<{ id: number; name: string; progress: number } | null>(null);
  const [editProgress, setEditProgress] = useState(0);

  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [recordSubjectId, setRecordSubjectId] = useState<number>(0);
  const [recordMinutes, setRecordMinutes] = useState(30);
  const [recordNote, setRecordNote] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchStudyRecords(30);
    fetchStudyStats(7);
  }, [fetchSubjects, fetchStudyRecords, fetchStudyStats]);

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (progress: number) => {
    if (progress >= 70) return 'text-green-600';
    if (progress >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const openEditModal = (subject: { id: number; name: string; progress: number }) => {
    setEditSubject(subject);
    setEditProgress(subject.progress);
  };

  const handleUpdateSubject = async () => {
    if (!editSubject) return;
    await updateSubjectProgress(editSubject.id, {
      progress: editProgress,
    });
    setEditSubject(null);
  };

  const handleAddRecord = async () => {
    if (!recordSubjectId || recordMinutes <= 0) return;
    await addStudyRecord({
      subject_id: recordSubjectId,
      duration: recordMinutes,
      note: recordNote || undefined,
    });
    setAddRecordOpen(false);
    setRecordSubjectId(0);
    setRecordMinutes(30);
    setRecordNote('');
  };

  const maxHours = studyStats.length > 0
    ? Math.max(...studyStats.map((d) => d.hours), 1)
    : 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">进度追踪</h2>
        <button onClick={() => setAddRecordOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加学习记录
        </button>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">科目进度</h3>
        {subjects.length === 0 ? (
          <p className="text-gray-400 text-center py-8">暂无科目数据</p>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="p-4 rounded-lg bg-gray-50 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{subject.total_hours}小时</span>
                      <span className={`text-sm font-semibold ${getProgressTextColor(subject.progress)}`}>
                        {subject.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(subject.progress)}`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => openEditModal(subject)}
                  className="p-2 rounded-lg hover:bg-white transition-colors text-gray-400 hover:text-primary-600"
                  title="编辑进度"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">近7天学习时长</h3>
          {studyStats.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-40">
              {studyStats.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{day.hours}h</span>
                  <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                    <div
                      className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-500"
                      style={{ height: `${(day.hours / maxHours) * 100}%`, minHeight: day.hours > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(day.date + 'T00:00:00').getDate()}日
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">暂无数据</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">学习记录</h3>
          {studyRecords.length === 0 ? (
            <p className="text-gray-400 text-center py-8">暂无记录</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {studyRecords.map((record) => (
                <div key={record.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700">{record.subject_name || '未知科目'}</div>
                    <div className="text-xs text-gray-400">
                      {record.created_at ? new Date(record.created_at).toLocaleDateString('zh-CN') : ''} · {record.duration}分钟
                      {record.note && ` · ${record.note}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!editSubject}
        onClose={() => setEditSubject(null)}
        title={`编辑进度 - ${editSubject?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学习进度: {editProgress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={editProgress}
              onChange={(e) => setEditProgress(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <button
            onClick={handleUpdateSubject}
            disabled={loading.updateSubject}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading.updateSubject ? '保存中...' : '保存'}
          </button>
        </div>
      </Modal>

      <Modal
        open={addRecordOpen}
        onClose={() => setAddRecordOpen(false)}
        title="添加学习记录"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择科目 *</label>
            <select
              value={recordSubjectId}
              onChange={(e) => setRecordSubjectId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm"
            >
              <option value={0}>选择科目</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学习时长（分钟） *</label>
            <input
              type="number"
              value={recordMinutes}
              onChange={(e) => setRecordMinutes(Number(e.target.value))}
              min="1"
              step="5"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              value={recordNote}
              onChange={(e) => setRecordNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm resize-none"
              placeholder="今日学习内容（可选）"
            />
          </div>

          <button
            onClick={handleAddRecord}
            disabled={!recordSubjectId || recordMinutes <= 0 || loading.addStudyRecord}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {loading.addStudyRecord ? '添加中...' : '添加记录'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
