'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'

interface StateVisualizerProps {
  stateVector: Record<string, { real: number; imaginary: number; magnitude: number }>
  probabilities: Record<string, number>
}

const COLORS = ['#7c3aed', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#a855f7']

export default function StateVisualizer({ stateVector, probabilities }: StateVisualizerProps) {
  const chartData = Object.entries(probabilities).map(([state, prob], index) => ({
    state,
    probability: (prob * 100).toFixed(2),
    rawProbability: prob,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <div className="quantum-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
          量子态概率分布
        </h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="state"
              width={80}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value: any) => [`${value}%`, '概率']}
            />
            <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-slate-400 mb-2">量子态向量</h4>
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm space-y-2 max-h-40 overflow-y-auto">
          {Object.entries(stateVector)
            .filter(([_, amp]) => amp.magnitude > 0.001)
            .map(([state, amp]) => (
              <div key={state} className="flex items-center space-x-4">
                <span className="text-cyan-400 w-16">{state}</span>
                <span className="text-slate-300">
                  ({amp.real.toFixed(4)}
                  {amp.imaginary >= 0 ? '+' : ''}
                  {amp.imaginary.toFixed(4)}i)
                </span>
                <span className="text-purple-400">
                  {(amp.magnitude * 100).toFixed(2)}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
