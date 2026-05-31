'use client'

import { useState } from 'react'
import {
  Zap,
  RefreshCw,
  Target,
  CircleDot,
  Cpu,
  Shuffle,
  GitBranch
} from 'lucide-react'

interface GateSelectorProps {
  numQubits: number
  selectedGate: string | null
  onSelect: (gate: string | null) => void
  onAddGate: (gate: string, qubits: number[], theta?: number) => void
}

const GATES = [
  { name: 'H', label: 'Hadamard', icon: Zap, color: 'bg-purple-600', description: '创建叠加态' },
  { name: 'X', label: 'Pauli-X', icon: RefreshCw, color: 'bg-blue-600', description: '比特翻转' },
  { name: 'Y', label: 'Pauli-Y', icon: Shuffle, color: 'bg-green-600', description: '比特和相位翻转' },
  { name: 'Z', label: 'Pauli-Z', icon: CircleDot, color: 'bg-red-600', description: '相位翻转' },
  { name: 'S', label: 'Phase', icon: Target, color: 'bg-yellow-600', description: 'π/2相位' },
  { name: 'T', label: 'π/8', icon: Target, color: 'bg-orange-600', description: 'π/4相位' },
  { name: 'CNOT', label: 'CNOT', icon: GitBranch, color: 'bg-cyan-600', description: '受控NOT' },
  { name: 'CZ', label: 'CZ', icon: GitBranch, color: 'bg-pink-600', description: '受控Z' },
  { name: 'SWAP', label: 'SWAP', icon: Shuffle, color: 'bg-indigo-600', description: '交换量子比特' },
  { name: 'TOFFOLI', label: 'Toffoli', icon: Cpu, color: 'bg-emerald-600', description: '受控CNOT' },
]

export default function GateSelector({
  numQubits,
  selectedGate,
  onSelect,
  onAddGate,
}: GateSelectorProps) {
  const [selectedQubits, setSelectedQubits] = useState<number[]>([])
  const [rotationAngle, setRotationAngle] = useState(0)

  const isTwoQubitGate = (gate: string) => ['CNOT', 'CZ', 'SWAP'].includes(gate)
  const isThreeQubitGate = (gate: string) => gate === 'TOFFOLI'

  const getRequiredQubits = (gate: string | null) => {
    if (!gate) return 1
    if (isThreeQubitGate(gate)) return 3
    if (isTwoQubitGate(gate)) return 2
    return 1
  }

  const requiredQubits = getRequiredQubits(selectedGate)

  const handleQubitSelect = (qubit: number) => {
    if (selectedQubits.includes(qubit)) {
      setSelectedQubits(selectedQubits.filter((q) => q !== qubit))
    } else if (selectedQubits.length < requiredQubits) {
      setSelectedQubits([...selectedQubits, qubit])
    }
  }

  const handleAddGate = () => {
    if (selectedGate && selectedQubits.length === requiredQubits) {
      onAddGate(selectedGate, selectedQubits, rotationAngle)
      setSelectedQubits([])
      setRotationAngle(0)
    }
  }

  return (
    <div className="quantum-card">
      <h3 className="text-lg font-semibold text-white mb-4">量子门选择器</h3>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {GATES.map((gate) => {
          const Icon = gate.icon
          return (
            <button
              key={gate.name}
              onClick={() => {
                onSelect(gate.name)
                setSelectedQubits([])
              }}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                selectedGate === gate.name
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white mb-2 ${gate.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-white text-xs font-medium">{gate.label}</span>
            </button>
          )
        })}
      </div>

      {selectedGate && (
        <div className="space-y-4 border-t border-slate-700 pt-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">
              选择量子比特 ({selectedQubits.length}/{requiredQubits})
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: numQubits }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleQubitSelect(i)}
                  className={`w-10 h-10 rounded-lg font-mono font-medium transition-all ${
                    selectedQubits.includes(i)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Q{i}
                </button>
              ))}
            </div>
          </div>

          {selectedGate === 'RX' || selectedGate === 'RY' || selectedGate === 'RZ' ? (
            <div>
              <label className="block text-slate-400 text-sm mb-2">
                旋转角度: {rotationAngle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="w-full"
              />
            </div>
          ) : null}

          <button
            onClick={handleAddGate}
            disabled={selectedQubits.length !== requiredQubits}
            className="w-full quantum-btn quantum-btn-primary disabled:opacity-50"
          >
            添加到电路
          </button>
        </div>
      )}
    </div>
  )
}
