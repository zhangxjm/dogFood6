const VALID_STATUSES = ['draft', 'prepared', 'running', 'collecting', 'analyzing', 'completed', 'abnormal'];

const TRANSITIONS = {
  draft: ['prepared', 'abnormal'],
  prepared: ['running', 'abnormal'],
  running: ['collecting', 'abnormal'],
  collecting: ['analyzing', 'abnormal'],
  analyzing: ['completed', 'abnormal'],
  completed: ['abnormal'],
  abnormal: ['draft', 'prepared']
};

const STATUS_LABELS = {
  draft: '草稿',
  prepared: '已准备',
  running: '进行中',
  collecting: '采集中',
  analyzing: '分析中',
  completed: '已完成',
  abnormal: '异常'
};

function validateTransition(currentStatus, newStatus) {
  if (!VALID_STATUSES.includes(currentStatus)) {
    return { valid: false, message: `当前状态无效: ${currentStatus}` };
  }
  if (!VALID_STATUSES.includes(newStatus)) {
    return { valid: false, message: `目标状态无效: ${newStatus}` };
  }
  const allowed = TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      message: `不允许从"${STATUS_LABELS[currentStatus]}"转换到"${STATUS_LABELS[newStatus]}"`
    };
  }
  return { valid: true, message: '状态转换有效' };
}

function getAvailableTransitions(currentStatus) {
  if (!VALID_STATUSES.includes(currentStatus)) return [];
  return (TRANSITIONS[currentStatus] || []).map(s => ({
    status: s,
    label: STATUS_LABELS[s]
  }));
}

module.exports = {
  VALID_STATUSES,
  STATUS_LABELS,
  TRANSITIONS,
  validateTransition,
  getAvailableTransitions
};
