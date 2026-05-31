import { createSignal, onMount } from 'solid-js';

const Alerts = () => {
  const [alerts, setAlerts] = createSignal([]);
  const [filter, setFilter] = createSignal('all');
  const [severityFilter, setSeverityFilter] = createSignal('all');

  onMount(() => {
    fetchAlerts();
    setInterval(fetchAlerts, 30000);
  });

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (filter() === 'unresolved') {
        params.append('resolved', 'false');
      }
      if (severityFilter() !== 'all') {
        params.append('severity', severityFilter());
      }
      
      const res = await fetch(`/api/alerts?${params.toString()}`);
      const data = await res.json();
      setAlerts(data);
    } catch (e) {
      console.error('Failed to fetch alerts');
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST'
      });
      fetchAlerts();
    } catch (e) {
      console.error('Failed to resolve alert');
    }
  };

  const resolveAll = async () => {
    if (!confirm('确定要标记所有告警为已处理吗？')) return;
    try {
      for (const alert of alerts().filter(a => !a.resolved)) {
        await fetch(`/api/alerts/${alert.id}/resolve`, { method: 'POST' });
      }
      fetchAlerts();
    } catch (e) {
      console.error('Failed to resolve all alerts');
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'warning': return '警告';
      case 'error': return '错误';
      case 'critical': return '严重';
      default: return severity;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'low_battery': return '低电量';
      case 'device_offline': return '设备离线';
      case 'feeding_failed': return '投喂失败';
      default: return type;
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      case 'critical': return 'bg-red-200 text-red-900 border-red-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
      default: return 'ℹ️';
    }
  };

  const unresolvedCount = () => alerts().filter(a => !a.resolved).length;

  return (
    <div>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-800">告警中心</h1>
        <div class="flex flex-wrap gap-3">
          <div class="flex rounded-md overflow-hidden border">
            <button
              onClick={() => { setFilter('all'); fetchAlerts(); }}
              class={`px-4 py-2 ${filter() === 'all' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
            >
              全部
            </button>
            <button
              onClick={() => { setFilter('unresolved'); fetchAlerts(); }}
              class={`px-4 py-2 ${filter() === 'unresolved' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
            >
              未处理 ({unresolvedCount()})
            </button>
          </div>
          <select
            value={severityFilter()}
            onChange={(e) => { setSeverityFilter(e.target.value); fetchAlerts(); }}
            class="px-3 py-2 border rounded-md"
          >
            <option value="all">全部级别</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
            <option value="critical">严重</option>
          </select>
          {unresolvedCount() > 0 && (
            <button onClick={resolveAll} class="btn btn-success">
              全部标记已处理
            </button>
          )}
        </div>
      </div>

      {alerts().length === 0 ? (
        <div class="card text-center py-12">
          <span class="text-6xl">✅</span>
          <p class="mt-4 text-gray-500">暂无告警记录</p>
        </div>
      ) : (
        <div class="space-y-4">
          {alerts().map(alert => (
            <div
              class={`card border-l-4 ${
                alert.resolved ? 'opacity-60' : ''
              } ${
                alert.severity === 'critical' ? 'border-red-600' :
                alert.severity === 'error' ? 'border-red-400' : 'border-yellow-400'
              }`}
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <span class="text-2xl">{getSeverityIcon(alert.severity)}</span>
                    <span class={`status-badge ${getSeverityClass(alert.severity)}`}>
                      {getSeverityLabel(alert.severity)}
                    </span>
                    <span class="status-badge bg-blue-100 text-blue-800">
                      {getTypeLabel(alert.alert_type)}
                    </span>
                    {alert.resolved && (
                      <span class="status-badge bg-green-100 text-green-800">
                        已处理
                      </span>
                    )}
                  </div>
                  <p class="text-gray-700 text-lg">{alert.message}</p>
                  <div class="mt-2 text-sm text-gray-500 flex flex-wrap gap-4">
                    <span>创建时间: {new Date(alert.created_at).toLocaleString('zh-CN')}</span>
                    {alert.device_id && <span>设备ID: {alert.device_id}</span>}
                    {alert.pet_id && <span>宠物ID: {alert.pet_id}</span>}
                    {alert.resolved_at && (
                      <span>处理时间: {new Date(alert.resolved_at).toLocaleString('zh-CN')}</span>
                    )}
                  </div>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    class="btn btn-success text-sm ml-4 whitespace-nowrap"
                  >
                    标记已处理
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
