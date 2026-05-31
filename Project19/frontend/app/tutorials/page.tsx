'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ChevronRight,
  Star,
  Cpu,
  GraduationCap
} from 'lucide-react'
import { tutorialApi } from '@/lib/api'

interface Tutorial {
  id: number
  title: string
  content: string
  category: string
  difficulty: number
  circuitExample: string
  createdAt: string
}

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const categories = ['基础概念', '量子门', '量子算法', '量子通信']
  const difficulties = [
    { value: '1', label: '入门' },
    { value: '2', label: '初级' },
    { value: '3', label: '中级' },
    { value: '4', label: '高级' },
    { value: '5', label: '专家' },
  ]

  useEffect(() => {
    loadTutorials()
  }, [])

  const loadTutorials = async () => {
    setIsLoading(true)
    try {
      const response = await tutorialApi.getAll()
      setTutorials(response.data)
    } catch (error) {
      console.error('Failed to load tutorials:', error)
      setTutorials([
        {
          id: 1,
          title: '量子计算入门：什么是量子比特？',
          content: '## 量子比特简介\n\n经典计算机使用比特（bit）作为基本信息单元，只能处于0或1两种状态。而量子计算机使用量子比特（qubit），可以同时处于0和1的叠加态。\n\n### 量子比特的状态表示\n\n量子比特的状态可以用布洛赫球来表示：\n- |0⟩ 表示基态\n- |1⟩ 表示激发态\n- 任意量子态可以表示为 α|0⟩ + β|1⟩，其中 α² + β² = 1\n\n### 关键特性\n\n1. **叠加性**：量子比特可以同时处于多个状态\n2. **纠缠性**：多个量子比特可以纠缠在一起\n3. **干涉性**：量子态可以产生干涉现象',
          category: '基础概念',
          difficulty: 1,
          circuitExample: 'H',
          createdAt: '2024-01-01 00:00:00'
        },
        {
          id: 2,
          title: '量子门基础：Hadamard门与叠加态',
          content: '## Hadamard门\n\nHadamard门是最常用的单量子比特门之一，它可以将基态转换为叠加态。\n\n### 数学表示\n\nH = (1/√2) × [[1, 1], [1, -1]]\n\n### 作用效果\n\n- H|0⟩ = (|0⟩ + |1⟩)/√2\n- H|1⟩ = (|0⟩ - |1⟩)/√2\n\n### 实验演示\n\n1. 初始化量子比特为 |0⟩\n2. 应用 Hadamard 门\n3. 观察叠加态的产生\n4. 测量得到随机结果',
          category: '量子门',
          difficulty: 1,
          circuitExample: 'H',
          createdAt: '2024-01-01 00:00:00'
        },
        {
          id: 3,
          title: 'Pauli门系列：X、Y、Z门',
          content: '## Pauli门\n\nPauli门是量子计算中最基本的门，包括X、Y、Z三个门。\n\n### X门（Pauli-X）\n- 相当于经典的NOT门\n- X|0⟩ = |1⟩, X|1⟩ = |0⟩\n\n### Y门（Pauli-Y）\n- Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩\n\n### Z门（Pauli-Z）\n- 相位翻转门\n- Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩',
          category: '量子门',
          difficulty: 1,
          circuitExample: 'X',
          createdAt: '2024-01-01 00:00:00'
        },
        {
          id: 4,
          title: '量子纠缠：Bell态的制备',
          content: '## 量子纠缠\n\n量子纠缠是量子力学中最神秘的现象之一，两个纠缠的量子比特无论相隔多远，测量一个都会立即影响另一个。\n\n### Bell态制备\n\nBell态是最简单的两量子比特纠缠态：\n\n|Φ+⟩ = (|00⟩ + |11⟩)/√2\n\n### 制备步骤\n\n1. 初始化两个量子比特为 |00⟩\n2. 对第一个量子比特应用 Hadamard 门\n3. 应用 CNOT 门（控制位：第一个，目标位：第二个）\n4. 得到纠缠态',
          category: '量子算法',
          difficulty: 2,
          circuitExample: 'H,CNOT',
          createdAt: '2024-01-01 00:00:00'
        },
        {
          id: 5,
          title: '多体纠缠：GHZ态',
          content: '## GHZ态\n\nGHZ态是三量子比特的最大纠缠态，是Bell态的推广。\n\n### GHZ态定义\n\n|GHZ⟩ = (|000⟩ + |111⟩)/√2\n\n### 制备步骤\n\n1. 初始化三个量子比特为 |000⟩\n2. 对第一个量子比特应用 Hadamard 门\n3. 依次应用 CNOT 门（q0→q1, q1→q2）\n4. 得到三量子比特纠缠态\n\n### 特性\n\nGHZ态展示了超越经典物理的量子关联特性',
          category: '量子算法',
          difficulty: 2,
          circuitExample: 'H,CNOT,CNOT',
          createdAt: '2024-01-01 00:00:00'
        },
        {
          id: 6,
          title: '量子搜索：Grover算法',
          content: '## Grover算法\n\nGrover算法是一种用于无序数据库搜索的量子算法，相比经典算法提供二次加速。\n\n### 算法原理\n\n1. **Oracle**：标记目标状态\n2. **扩散算子**：放大目标状态的振幅\n3. **迭代**：重复应用Oracle和扩散算子\n\n### 复杂度\n\n- 经典搜索：O(N)\n- 量子搜索：O(√N)\n\n### 示例\n\n在4个元素中搜索特定目标，Grover算法只需约1次迭代即可高概率找到目标。',
          category: '量子算法',
          difficulty: 4,
          circuitExample: 'Grover',
          createdAt: '2024-01-01 00:00:00'
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const renderDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
        }`}
      />
    ))
  }

  const renderContent = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3">{line.slice(3)}</h2>
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-cyan-400 mt-4 mb-2">{line.slice(4)}</h3>
      } else if (line.startsWith('- ')) {
        return <li key={index} className="text-slate-300 ml-4">{line.slice(2)}</li>
      } else if (line.match(/^\d+\./)) {
        return <li key={index} className="text-slate-300 ml-4 list-decimal">{line}</li>
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={index} className="text-purple-400">{line.slice(2, -2)}</strong>
      } else if (line.trim()) {
        return <p key={index} className="text-slate-300 my-2">{line}</p>
      }
      return null
    })
  }

  const filteredTutorials = tutorials.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false
    if (filterDifficulty !== 'all' && t.difficulty !== parseInt(filterDifficulty)) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">量子计算教程</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="quantum-card">
              <h3 className="text-lg font-semibold text-white mb-4">筛选</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">分类</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full quantum-input"
                  >
                    <option value="all">全部</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">难度</label>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="w-full quantum-input"
                  >
                    <option value="all">全部</option>
                    {difficulties.map((diff) => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="quantum-card">
              <h3 className="text-lg font-semibold text-white mb-4">教程列表</h3>
              {isLoading ? (
                <div className="text-center py-4 text-slate-400">加载中...</div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredTutorials.map((tutorial) => (
                    <button
                      key={tutorial.id}
                      onClick={() => setSelectedTutorial(tutorial)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTutorial?.id === tutorial.id
                          ? 'bg-blue-600/20 border-blue-500'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm line-clamp-2">
                            {tutorial.title}
                          </h4>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">
                              {tutorial.category}
                            </span>
                            <div className="flex items-center space-x-0.5">
                              {renderDifficultyStars(tutorial.difficulty)}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedTutorial ? (
              <div className="quantum-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedTutorial.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-slate-400">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {selectedTutorial.category}
                      </span>
                      <span className="flex items-center text-slate-400">
                        难度: 
                        <span className="flex items-center space-x-0.5 ml-1">
                          {renderDifficultyStars(selectedTutorial.difficulty)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {selectedTutorial.circuitExample && (
                  <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-purple-400 mb-2 flex items-center">
                      <Cpu className="w-4 h-4 mr-1" />
                      相关电路示例
                    </h4>
                    <code className="text-purple-300 font-mono text-sm">
                      {selectedTutorial.circuitExample}
                    </code>
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  {renderContent(selectedTutorial.content)}
                </div>
              </div>
            ) : (
              <div className="quantum-card text-center py-16">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">
                  选择一个教程开始学习
                </h3>
                <p className="text-slate-500">
                  从左侧列表中选择一个教程
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
