import request from '@/utils/request'
import type { Prediction, PredictionStats, ModelInfoResponse, PredictionRequest, PaginatedResponse } from '@/types'

interface PredictionListParams {
  page?: number
  pageSize?: number
  deviceId?: number
  riskLevel?: string
}

export const predictionApi = {
  list(params: PredictionListParams = {}): Promise<PaginatedResponse<Prediction>> {
    return request.get<PaginatedResponse<Prediction>>('/predictions', { params })
  },

  getStats(): Promise<PredictionStats> {
    return request.get<PredictionStats>('/predictions/stats')
  },

  getHighRisk(): Promise<Prediction[]> {
    return request.get<Prediction[]>('/predictions/high-risk')
  },

  getModelInfo(): Promise<ModelInfoResponse> {
    return request.get<ModelInfoResponse>('/predictions/model-info')
  },

  getPredictionSeries(id: number): Promise<{ timestamps: string[]; probabilities: number[] }> {
    return request.get<{ timestamps: string[]; probabilities: number[] }>(`/predictions/${id}/series`)
  },

  predict(data: PredictionRequest): Promise<Prediction> {
    return request.post<Prediction>('/predictions/predict', data)
  },

  predictAll(): Promise<{ count: number; message: string }> {
    return request.post<{ count: number; message: string }>('/predictions/predict-all')
  }
}

export default predictionApi
