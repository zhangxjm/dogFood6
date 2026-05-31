export type DataStatus = 'RECEIVED' | 'PROCESSED' | 'ERROR';

export interface SatelliteData {
  id: number;
  satelliteId: string;
  satelliteName: string;
  dataType: string;
  rawData: string;
  parsedData: Record<string, any>;
  receivedTime: string;
  processedTime: string;
  dataSize: number;
  checksum: string;
  status: DataStatus;
  errorMessage?: string;
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED';

export interface SystemStatus {
  kafkaStatus: ConnectionStatus;
  databaseStatus: ConnectionStatus;
  uptime: number;
  totalRecords: number;
  todayRecords: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export interface DataStatistics {
  timestamp: string;
  receivedCount: number;
  processedCount: number;
  errorCount: number;
  throughput: number;
}

export interface RealtimeStats {
  statistics: DataStatistics;
  queueSize: number;
  throughput: number;
  totalRecords: number;
  todayRecords: number;
  errorCount: number;
  processedCount: number;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface SimulatorStatus {
  running: boolean;
  status?: string;
}
