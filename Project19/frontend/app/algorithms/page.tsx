'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Network,
  Play,
  BookOpen,
  Cpu,
  ChevronRight,
  Zap,
  Atom,
  AlertTriangle
} from 'lucide-react'
import { quantumApi } from '@/lib/api'
import StateVisualizer from '@/components/StateVisualizer'

interface Algorithm {
  name: string
  description: string
  numQubits: number
  application: string
}

const MOCK_ALGORITHMS: Algorithm[] = [
  { name: 'Bell态制备', description: '两量子比特纠缠态制备', numQubits: 2, application: '量子通信' },
  { name: 'GHZ态制备', description: '多体纠缠态制备', numQubits: 3, application: '量子计算' },
  { name: 'Deutsch算法', description: '第一个量子算法演示', numQubits: 2, application: '量子算法基础' },
  { name: 'Grover算法', description: '量子搜索算法', numQubits: 3, application: '搜索优化' },
  { name: '量子傅里叶变换', description: '量子傅里叶变换QFT', numQubits: 3, application: 'Shor算法' },
  { name: '量子隐形传态', description: '量子态传输协议', numQubits: 3, application: '量子通信' },
  { name: '超密编码', description: '量子超密编码', numQubits: 2, application: '量子通信' },
]

const algorithmMap: Record<string, string> = {
  'Bell态制备': 'bell',
  'GHZ态制备': 'ghz',
  'Deutsch算法': 'deutsch',
  'Grover算法': 'grover',
  '量子傅里叶变换': 'qft',
  '量子隐形传态': 'teleportation',
  '超密编码': 'superdense',
}

const generateMockResult = (algorithmId: string, numQubits: number) => {
  const algorithmInfo = Object.entries(algorithmMap).find(([_, id]) => id === algorithmId)
  const algorithmName = algorithmInfo ? algorithmInfo[0] : algorithmId

  const stateVector: Record<string, { real: number; imaginary: number; magnitude: number }> = {}
  const probabilities: Record<string, number> = {}
  const size = 1 << numQubits

  for (let i = 0; i < size; i++) {
    const state = '|' + i.toString(2).padStart(numQubits, '0') + '⟩'
    const prob = 1 / size
    stateVector[state] = { real: Math.sqrt(prob), imaginary: 0, magnitude: Math.sqrt(prob) }
    probabilities[state] = prob
  }

  if (algorithmId === 'bell') {
    const bellStates = ['|00⟩', '|11⟩']
    Object.keys(stateVector).forEach(key => {
      if (bellStates.includes(key)) {
        stateVector[key] = { real: Math.sqrt(0.5), imaginary: 0, magnitude: Math.sqrt(0.5) }
        probabilities[key] = 0.5
      } else {
        stateVector[key] = { real: 0, imaginary: 0, magnitude: 0 }
        probabilities[key] = 0
      }
    })
  }

  if (algorithmId === 'ghz') {
    const ghzStates = ['|000⟩', '|111⟩']
    Object.keys(stateVector).forEach(key => {
      if (ghzStates.includes(key)) {
        stateVector[key] = { real: Math.sqrt(0.5), imaginary: 0, magnitude: Math.sqrt(0.5) }
        probabilities[key] = 0.5
      } else {
        stateVector[key] = { real: 0, imaginary: 0, magnitude: 0 }
        probabilities[key] = 0
      }
    })
  }

  const steps: { step: number; gate: string; qubits: string; probabilities: Record<string, number> }[] = []
  const gates = algorithmId === 'bell' ? ['初始状态', 'H', 'CNOT'] : 
                  algorithmId === 'ghz' ? ['初始状态', 'H', 'CNOT', 'CNOT'] :
                  algorithmId === 'deutsch' ? ['初始状态', 'X', 'H', 'H'] :
                  algorithmId === 'grover' ? ['初始状态', 'H', 'Oracle', 'Diffusion'] :
                  ['初始状态', 'H', 'Gate']

  gates.forEach((gate, i) => {
    steps.push({
      step: i,
      gate: gate,
      qubits: i === 0 ? '' : 'Q0',
      probabilities: probabilities
    })
  })

  return {
    algorithm: {
      name: algorithmName,
      description: MOCK_ALGORITHMS.find(a => algorithmMap[a.name] === algorithmId)?.description || '',
      application: MOCK_ALGORITHMS.find(a => algorithmMap[a.name] === algorithmId)?.application || ''
    },
    numQubits,
    finalState: Object.entries(probabilities)
      .filter(([_, prob]) => prob > 0.01)
      .map(([state, prob]) => `${Math.sqrt(prob).toFixed(4)}${state}`)
      .join(' + '),
    stateVector,
    probabilities,
    measurement: Array(numQubits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0),
    steps
  }
}

export default function AlgorithmsPage() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(MOCK_ALGORITHMS)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null)
  const [algorithmResult, setAlgorithmResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [numQubits, setNumQubits] = useState(3)
  const [targetState, setTargetState] = useState(0)

  useEffect(() => {
    loadAlgorithms()
  }, [])

  const loadAlgorithms = async () => {
    try {
      const response = await quantumApi.getAllAlgorithms()
      setAlgorithms(response.data.algorithms)
      setConnectionError(false)
    } catch (error) {
      console.log('Using mock algorithm data (backend not available)')
      setAlgorithms(MOCK_ALGORITHMS)
      setConnectionError(true)
    }
  }

  const runAlgorithm = async (algorithmId: string) => {
    setIsLoading(true)
    setSelectedAlgorithm(algorithmId)
    try {
      const response = await quantumApi.runAlgorithm(algorithmId, numQubits, targetState)
      setAlgorithmResult(response.data)
      setConnectionError(false)
    } catch (error) {
      console.log('Using mock simulation (backend not available)')
      setAlgorithmResult(generateMockResult(algorithmId, numQubits))
      setConnectionError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Network className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold text-white">量子算法演示</span>
            </Link>
            {connectionError && (
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>使用离线模拟模式</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="quantum-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
                可用算法
              </h3>
              <div className="space-y-2">
                {algorithms.map((algo, index) => (
                  <button
                    key={index}
                    onClick={() => runAlgorithm(algorithmMap[algo.name] || algo.name.toLowerCase())}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedAlgorithm === (algorithmMap[algo.name] || algo.name.toLowerCase())
                        ? 'bg-purple-600/30 border border-purple-500'
                        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{algo.name}</h4>
                        <p className="text-slate-400 text-sm">{algo.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedAlgorithm && (
              <div className="quantum-card">
                <h3 className="text-lg font-semibold text-white mb-4">参数设置</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      量子比特数: {numQubits}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="5"
                      value={numQubits}
                      onChange={(e) => setNumQubits(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  {selectedAlgorithm === 'grover' && (
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        目标状态: {targetState}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={(1 << numQubits) - 1}
                        value={targetState}
                        onChange={(e) => setTargetState(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => selectedAlgorithm && runAlgorithm(selectedAlgorithm)}
                    disabled={isLoading}
                    className="w-full quantum-btn quantum-btn-primary inline-flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin">⏳</div>
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>重新运行</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {algorithmResult && (
              <>
                <div className="quantum-card">
                  <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-yellow-400" />
                    {algorithmResult.algorithm?.name || selectedAlgorithm}
                  </h3>
                  <p className="text-slate-400 mb-4">
                    {algorithmResult.algorithm?.description || ''}
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="text-slate-400">
                      应用领域: <span className="text-cyan-400">{algorithmResult.algorithm?.application || '-'}</span>
                    </span>
                    <span className="text-slate-400">
                      量子比特数: <span className="text-purple-400">{algorithmResult.numQubits}</span>
                    </span>
                  </div>
                </div>

                <StateVisualizer
                  stateVector={algorithmResult.stateVector}
                  probabilities={algorithmResult.probabilities}
                />

                <div className="quantum-card">
                  <h3 className="text-lg font-semibold text-white mb-4">最终量子态</h3>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-white">
                    {algorithmResult.finalState}
                  </div>
                </div>

                <div className="quantum-card">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Cpu className="w-5 h-5 mr-2 text-purple-400" />
                    执行步骤
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {algorithmResult.steps?.map((step: any, index: number) => (
                      <div
                        key={index}
                        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="px-2 py-1 bg-purple-600/30 text-purple-400 text-xs rounded">
                            步骤 {step.step}
                          </span>
                          <span className="text-white font-medium">{step.gate}</span>
                          {step.qubits && (
                            <span className="text-slate-400 text-sm">
                              作用于 {step.qubits}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-300 text-sm font-mono">
                          {Object.entries(step.probabilities)
                            .filter(([_, prob]) => (prob as number) > 0.01)
                            .map(([state, prob]) => `${state}: ${(prob as number * 100).toFixed(1)}%`)
                            .join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!algorithmResult && (
              <div className="quantum-card text-center py-16">
                <Atom className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  选择一个算法开始演示
                </h3>
                <p className="text-slate-500">
                  从左侧列表中选择一个量子算法，查看其执行过程
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
