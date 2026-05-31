'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Trash2,
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react'
import { quantumApi } from '@/lib/api'

interface Experiment {
  id: number
  name: string
  description: string
  circuitType: string
  numQubits: number
  createdAt: string
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [experimentSteps, setExperimentSteps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadExperiments()
  }, [])

  const loadExperiments = async () => {
    try {
      const response = await quantumApi.getAllExperiments()
      setExperiments(response.data)
    } catch (error) {
      console.error('Failed to load experiments:', error)
      setExperiments([
        { id: 1, name: 'Bell态制备实验', description: '两量子比特纠缠态制备', circuitType: 'bell', numQubits: 2, createdAt: '2024-01-15 10:30:00' },
        { id: 2, name: 'Grover搜索算法', description: '三量子比特Grover搜索', circuitType: 'grover', numQubits: 3, createdAt: '2024-01-15 14:20:00' },
        { id: 3, name: 'Hadamard叠加态', description: '单量子比特叠加态演示', circuitType: 'custom', numQubits: 1, createdAt: '2024-01-16 09:15:00' },
      ])
    }
  }

  const loadExperimentSteps = async (id: number) => {
    setIsLoading(true)
    try {
      const response = await quantumApi.getExperimentSteps(id)
      setExperimentSteps(response.data)
    } catch (error) {
      console.error('Failed to load experiment steps:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteExperiment = async (id: number) => {
    if (!confirm('确定要删除这个实验吗？')) return
    try {
      await quantumApi.deleteExperiment(id)
      loadExperiments()
      if (selectedExperiment?.id === id) {
        setSelectedExperiment(null)
        setExperimentSteps([])
      }
    } catch (error) {
      console.error('Failed to delete experiment:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <FlaskConical className="w-6 h-6 text-green-400" />
              <span className="text-xl font-bold text-white">实验记录</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="quantum-card">
              <h3 className="text-lg font-semibold text-white mb-4">实验列表</h3>
              {experiments.length === 0 ? (
                <p className="text-slate-400 text-center py-8">暂无实验记录</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {experiments.map((exp) => (
                    <div
                      key={exp.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedExperiment?.id === exp.id
                          ? 'bg-green-600/20 border-green-500'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => {
                        setSelectedExperiment(exp)
                        loadExperimentSteps(exp.id)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{exp.name}</h4>
                          <p className="text-slate-400 text-xs mt-1">{exp.description}</p>
                          <div className="flex items-center space-x-3 mt-2 text-xs">
                            <span className="text-slate-500 flex items-center">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              {exp.numQubits} 量子比特
                            </span>
                            <span className="text-slate-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(exp.createdAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteExperiment(exp.id)
                          }}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedExperiment ? (
              <>
                <div className="quantum-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {selectedExperiment.name}
                      </h3>
                      <p className="text-slate-400">{selectedExperiment.description}</p>
                      <div className="flex items-center space-x-4 mt-4 text-sm">
                        <span className="text-slate-400">
                          电路类型: <span className="text-green-400">{selectedExperiment.circuitType}</span>
                        </span>
                        <span className="text-slate-400">
                          量子比特数: <span className="text-purple-400">{selectedExperiment.numQubits}</span>
                        </span>
                        <span className="text-slate-400">
                          创建时间: <span className="text-cyan-400">{formatDate(selectedExperiment.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="quantum-card">
                  <h3 className="text-lg font-semibold text-white mb-4">执行步骤</h3>
                  {isLoading ? (
                    <div className="text-center py-8 text-slate-400">加载中...</div>
                  ) : experimentSteps.length === 0 ? (
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400">暂无步骤数据</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {experimentSteps.map((step, index) => (
                        <div
                          key={index}
                          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-2 py-1 bg-green-600/30 text-green-400 text-xs rounded">
                              步骤 {step.stepNumber}
                            </span>
                            <span className="text-white font-medium">{step.gateName}</span>
                          </div>
                          {step.probabilities && (
                            <div className="text-slate-300 text-sm font-mono mt-2">
                              {Object.entries(JSON.parse(step.probabilities))
                                .map(([state, prob]) => `${state}: ${(prob as number * 100).toFixed(2)}%`)
                                .join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="quantum-card text-center py-16">
                <FlaskConical className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  选择一个实验查看详情
                </h3>
                <p className="text-slate-500">
                  从左侧列表中选择一个实验记录
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
