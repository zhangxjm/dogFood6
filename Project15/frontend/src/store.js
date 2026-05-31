import { writable } from 'svelte/store';

export const page = writable('dashboard');

export const elderlyList = writable([]);

export const healthDataList = writable([]);

export const alertsList = writable([]);

export const emergencyCallsList = writable([]);

export const devicesList = writable([]);

export const selectedElderly = writable(null);

export const websocketStatus = writable('DISCONNECTED');

export const realtimeHealthData = writable({});

export const realtimeAlerts = writable([]);

export const realtimeEmergencyCalls = writable([]);
