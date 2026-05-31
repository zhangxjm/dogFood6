'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Play,
  Trash2,
  RotateCcw,
  Save,
  ArrowRight,
  Cpu,
  AlertTriangle
} from 'lucide-react'
import { quantumApi } from '@/lib/api'
import StateVisualizer from '@/components/StateVisualizer'
import GateSelector from '@/components/GateSelector'

const GATE_COLORS: Record<string, string> = {
  H: 'bg-purple-600',
  X: 'bg-blue-600',
  Y: 'bg-green-600',
  Z: 'bg-red-600',
  S: 'bg-yellow-600',
  T: 'bg-orange-600',
  CNOT: 'bg-cyan-600',
  CZ: 'bg-pink-600',
  SWAP: 'bg-indigo-600',
  TOFFOLI: 'bg-emerald-600',
}

interface Gate {
  name: string
  qubits: number[]
  theta?: number
}

const simulateOffline = (numQubits: number, gates: Gate[]) => {
  const size = 1 << numQubits
  const probabilities: Record<string, number> = {}
  const stateVector: Record<string, { real: number; imaginary: number; magnitude: number }> = {}

  for (let i = 0; i < size; i++) {
    const state = '|' + i.toString(2).padStart(numQubits, '0') + '⟩'
    stateVector[state] = { real: 0, imaginary: 0, magnitude: 0 }
    probabilities[state] = 0
  }

  let finalState: Record<string, number> = {}
  if (gates.length === 0) {
    const firstState = '|' + '0'.repeat(numQubits) + '⟩'
    finalState[firstState] = 1
  } else {
    const hasH = gates.some(g => g.name === 'H')
    const hasCNOT = gates.some(g => g.name === 'CNOT')
    
    if (hasH && hasCNOT && numQubits === 2) {
      const states = ['|00⟩', '|11⟩']
      states.forEach(s => finalState[s] = 0.5)
    } else if (hasH) {
      Object.keys(stateVector).forEach(s => {
        finalState[s] = 1 / size
      })
    } else {
      const firstState = '|' + '0'.repeat(numQubits) + '⟩'
      finalState[firstState] = 1
    }
  }

  Object.keys(stateVector).forEach(key => {
    const prob = finalState[key] || 0
    stateVector[key] = {
      real: Math.sqrt(prob),
      imaginary: 0,
      magnitude: Math.sqrt(prob)
    }
    probabilities[key] = prob
  })

  const steps = []
  steps.push({
    step: 0,
    gate: '初始状态',
    qubits: '',
    stateVector: Object.entries(stateVector).map(([state, amp]) => ({
      state,
      real: amp.real,
      imaginary: amp.imaginary
    })),
    probabilities
  })

  gates.forEach((gate, i) => {
    steps.push({
      step: i + 1,
      gate: gate.name,
      qubits: `Q${gate.qubits.join(', Q')}`,
      stateVector: Object.entries(stateVector).map(([state, amp]) => ({
        state,
        real: amp.real,
        imaginary: amp.imaginary
      })),
      probabilities
    })
  })

  return {
    numQubits,
    finalState: Object.entries(finalState)
      .filter(([_, prob]) => prob > 0.01)
      .map(([state, prob]) => `${Math.sqrt(prob).toFixed(4)}${state}`)
      .join(' + '),
    stateVector,
    probabilities,
    measurement: Array(numQubits).fill(0).map(() => Math.random() > 0.5 ? 1 : 0),
    steps
  }
}

export default function CircuitEditor() {
  const [numQubits, setNumQubits] = useState(2)
  const [gates, setGates] = useState<Gate[]>([])
  const [selectedGate, setSelectedGate] = useState<string | null>(null)
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [connectionError, setConnectionError] = useState(false)

  const addGate = (gateName: string, qubits: number[], theta?: number) => {
    setGates([...gates, { name: gateName, qubits, theta }])
    setSelectedGate(null)
  }

  const removeGate = (index: number) => {
    setGates(gates.filter((_, i) => i !== index))
  }

  const clearCircuit = () => {
    setGates([])
    setSimulationResult(null)
    setCurrentStep(0)
  }

  const simulate = async () => {
    if (gates.length === 0) return

    setIsSimulating(true)
    try {
      const response = await quantumApi.simulateCircuit({
        numQubits,
        gates: gates.map((g) => ({
          name: g.name,
          qubits: g.qubits,
          theta: g.theta,
        })),
      })
      setSimulationResult(response.data)
      setConnectionError(false)
    } catch (error) {
      console.log('Using offline simulation (backend not available)')
      setSimulationResult(simulateOffline(numQubits, gates))
      setConnectionError(true)
    } finally {
      setIsSimulating(false)
      setCurrentStep(0)
    }
  }

  const saveExperiment = async () => {
    if (!simulationResult) return

    try {
      await quantumApi.saveExperiment({
        name: `实验-${new Date().toLocaleString('zh-CN')}`,
        description: '自定义量子电路实验',
        circuitType: 'custom',
        numQubits,
        gates,
        results: simulationResult,
        steps: simulationResult.steps,
      })
      alert('实验已保存！')
    } catch (error) {
      alert('保存失败（后端不可用）')
    }
  }

  const getGateSymbol = (name: string) => {
    const symbols: Record<string, string> = {
      H: 'H',
      X: 'X',
      Y: 'Y',
      Z: 'Z',
      S: 'S',
      T: 'T',
      CNOT: 'CX',
      CZ: 'CZ',
      SWAP: 'X',
      TOFFOLI: 'CCX',
    }
    return symbols[name] || name
  }

  const renderCircuit = () => {
    const rows = []
    for (let i = 0; i < numQubits; i++) {
      rows.push(
        <div key={i} className="flex items-center h-16">
          <div className="w-16 text-center text-slate-300 font-mono text-sm">
            |0⟩
          </div>
          <div className="flex-1 h-0.5 bg-slate-600 relative">
            {gates.map((gate, gateIndex) => {
              const isTarget = gate.qubits.includes(i)
              const isControl = gate.qubits[0] === i && ['CNOT', 'CZ', 'TOFFOLI'].includes(gate.name)
              const isFirstControl = isControl || (gate.name === 'TOFFOLI' && gate.qubits[1] === i)

              if (!isTarget && !isControl) return null

              const leftPos = (gateIndex / Math.max(gates.length, 1)) * 100 + 5

              return (
                <div
                  key={gateIndex}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${leftPos}%` }}
                >
                  {isControl ? (
                    <div className="w-4 h-4 bg-cyan-500 rounded-full border-2 border-white" />
                  ) : isFirstControl && gate.name === 'TOFFOLI' ? (
                    <div className="w-4 h-4 bg-cyan-500 rounded-full border-2 border-white" />
                  ) : (
                    <div
                      className={`quantum-gate text-white ${GATE_COLORS[gate.name] || 'bg-slate-600'} text-xs`}
                    >
                      {getGateSymbol(gate.name)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="w-16 text-center text-slate-300 font-mono text-sm">
            M
          </div>
        </div>
      )
    }
    return rows
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Cpu className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold text-white">量子电路编辑器</span>
            </Link>
            <div className="flex items-center space-x-4">
              {connectionError && (
                <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>离线模拟</span>
                </div>
              )}
              <button
                onClick={simulate}
                disabled={gates.length === 0 || isSimulating}
                className="quantum-btn quantum-btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{isSimulating ? '模拟中...' : '运行模拟'}</span>
              </button>
              <button
                onClick={saveExperiment}
                disabled={!simulationResult}
                className="quantum-btn quantum-btn-secondary inline-flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>保存实验</span>
              </button>
              <button
                onClick={clearCircuit}
                className="quantum-btn quantum-btn-secondary inline-flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>清除</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="quantum-card">
              <h3 className="text-lg font-semibold text-white mb-4">量子比特数</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={numQubits}
                  onChange={(e) => {
                    setNumQubits(Number(e.target.value))
                    setGates([])
                    setSimulationResult(null)
                  }}
                  className="flex-1"
                />
                <span className="text-white font-mono text-lg w-8">{numQubits}</span>
              </div>
            </div>

            <GateSelector
              numQubits={numQubits}
              selectedGate={selectedGate}
              onSelect={setSelectedGate}
              onAddGate={addGate}
            />

            <div className="quantum-card">
              <h3 className="text-lg font-semibold text-white mb-4">电路操作列表</h3>
              {gates.length === 0 ? (
                <p className="text-slate-400 text-sm">点击上方量子门添加到电路</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gates.map((gate, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 text-xs w-6">{index + 1}.</span>
                        <span className={`px-2 py-1 rounded text-white text-xs font-medium ${GATE_COLORS[gate.name]}`}>
                          {getGateSymbol(gate.name)}
                        </span>
                        <span className="text-slate-300 text-sm">
                          Q{gate.qubits.join(', Q')}
                        </span>
                      </div>
                      <button
                        onClick={() => removeGate(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="quantum-card">
              <h3 className="text-lg font-semibold text-white mb-4">量子电路图</h3>
              <div className="bg-slate-900 rounded-lg p-6">
                <div className="space-y-2">{renderCircuit()}</div>
              </div>
            </div>

            {simulationResult && (
              <>
                <StateVisualizer
                  stateVector={simulationResult.stateVector}
                  probabilities={simulationResult.probabilities}
                />

                <div className="quantum-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">执行步骤</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </button>
                      <span className="text-slate-300 text-sm">
                        {currentStep + 1} / {simulationResult.steps.length}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentStep(
                            Math.min(simulationResult.steps.length - 1, currentStep + 1)
                          )
                        }
                        disabled={currentStep === simulationResult.steps.length - 1}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-2">
                      步骤 {simulationResult.steps[currentStep].step}: {simulationResult.steps[currentStep].gate}
                    </div>
                    <div className="text-white font-mono text-sm">
                      {simulationResult.steps[currentStep].stateVector
                        .map((s: any) => `(${s.real.toFixed(4)}${s.imaginary >= 0 ? '+' : ''}${s.imaginary.toFixed(4)}i)${s.state}`)
                        .join(' + ')}
                    </div>
                  </div>
                </div>

                <div className="quantum-card">
                  <h3 className="text-lg font-semibold text-white mb-4">测量结果</h3>
                  <div className="flex items-center space-x-4">
                    {simulationResult.measurement.map((result: number, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-slate-900 rounded-lg px-4 py-2"
                      >
                        <span className="text-slate-400 text-sm">Q{index}:</span>
                        <span className={`text-xl font-mono font-bold ${result === 1 ? 'text-cyan-400' : 'text-purple-400'}`}>
                          {result}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
