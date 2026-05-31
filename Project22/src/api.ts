const API_BASE = '/api';

export async function fetchLineStatuses() {
  const res = await fetch(`${API_BASE}/production-lines/status`);
  return res.json();
}

export async function fetchDefectTypes() {
  const res = await fetch(`${API_BASE}/defect-types`);
  return res.json();
}

export async function fetchInspectionRecords(page = 0, size = 20) {
  const res = await fetch(`${API_BASE}/inspection-records?page=${page}&size=${size}`);
  return res.json();
}

export async function fetchSortingRules() {
  const res = await fetch(`${API_BASE}/sorting-rules`);
  return res.json();
}

export async function fetchSortingStatistics() {
  const res = await fetch(`${API_BASE}/sorting/statistics`);
  return res.json();
}

export async function fetchCameras() {
  const res = await fetch(`${API_BASE}/cameras`);
  return res.json();
}

export async function fetchEdgeNodes() {
  const res = await fetch(`${API_BASE}/edge-nodes`);
  return res.json();
}

export async function fetchModels() {
  const res = await fetch(`${API_BASE}/models`);
  return res.json();
}

export async function fetchDailyReport(date?: string) {
  const url = date
    ? `${API_BASE}/reports/daily?date=${date}`
    : `${API_BASE}/reports/daily`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchWeeklyReport(date?: string) {
  const url = date
    ? `${API_BASE}/reports/weekly?date=${date}`
    : `${API_BASE}/reports/weekly`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchMonthlyReport(month?: string) {
  const url = month
    ? `${API_BASE}/reports/monthly?month=${month}`
    : `${API_BASE}/reports/monthly`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}

export async function fetchSystemSettings() {
  const res = await fetch(`${API_BASE}/system/settings`);
  return res.json();
}

export async function fetchProductionLines() {
  const res = await fetch(`${API_BASE}/production-lines`);
  return res.json();
}

export async function updateSortingRule(rule: any) {
  const res = await fetch(`${API_BASE}/sorting-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  return res.json();
}

export async function deleteSortingRule(id: number) {
  await fetch(`${API_BASE}/sorting-rules/${id}`, { method: 'DELETE' });
}

export async function activateModel(id: number) {
  await fetch(`${API_BASE}/models/${id}/activate`, { method: 'PUT' });
}

export async function updateDefectType(defect: any) {
  const res = await fetch(`${API_BASE}/defect-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defect),
  });
  return res.json();
}

export async function deleteDefectType(id: number) {
  await fetch(`${API_BASE}/defect-types/${id}`, { method: 'DELETE' });
}

export async function updateProductionLine(line: any) {
  const res = await fetch(`${API_BASE}/production-lines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(line),
  });
  return res.json();
}

export async function deleteProductionLine(id: number) {
  await fetch(`${API_BASE}/production-lines/${id}`, { method: 'DELETE' });
}
