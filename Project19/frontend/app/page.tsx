'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Atom,
  Cpu,
  BookOpen,
  FlaskConical,
  ChevronRight,
  Sparkles,
  Network,
  Zap
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: <Cpu className="w-8 h-8" />,
      title: '量子门模拟',
      description: '可视化操作各种量子门，实时观察量子态变化',
      href: '/circuit',
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: '算法演示',
      description: '深入理解Bell态、Grover算法等经典量子算法',
      href: '/algorithms',
    },
    {
      icon: <FlaskConical className="w-8 h-8" />,
      title: '实验记录',
      description: '保存和管理你的量子计算实验数据',
      href: '/experiments',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: '教学教程',
      description: '从入门到精通，系统化学习量子计算',
      href: '/tutorials',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg">
                <Atom className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                量子计算教学系统
              </span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link
                href="/circuit"
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                电路编辑器
              </Link>
              <Link
                href="/algorithms"
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                算法演示
              </Link>
              <Link
                href="/experiments"
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                实验记录
              </Link>
              <Link
                href="/tutorials"
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                教程
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm">量子计算可视化教学平台</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              探索量子世界
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            通过可视化模拟和交互式学习，深入理解量子计算的基本原理和算法
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4">
            <Link
              href="/circuit"
              className="quantum-btn quantum-btn-primary inline-flex items-center space-x-2"
            >
              <Cpu className="w-5 h-5" />
              <span>开始实验</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tutorials"
              className="quantum-btn quantum-btn-secondary inline-flex items-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>学习教程</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="quantum-card hover:border-purple-500/50 hover:glow-purple transition-all duration-300 group"
            >
              <div className="text-purple-400 mb-4 group-hover:text-cyan-400 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
              <div className="mt-4 flex items-center text-purple-400 text-sm">
                <span>探索</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="quantum-card">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Zap className="w-6 h-6 text-yellow-400 mr-3" />
            快速了解量子计算
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-white">量子比特</h4>
              </div>
              <p className="text-slate-400 text-sm pl-10">
                量子比特可以同时处于0和1的叠加态，这是量子计算的基础
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-cyan-600/30 flex items-center justify-center">
                  <span className="text-cyan-400 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-white">量子门</h4>
              </div>
              <p className="text-slate-400 text-sm pl-10">
                量子门操作量子比特的状态，如Hadamard门创建叠加态
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-pink-600/30 flex items-center justify-center">
                  <span className="text-pink-400 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-white">量子纠缠</h4>
              </div>
              <p className="text-slate-400 text-sm pl-10">
                多个量子比特可以纠缠在一起，测量一个会影响另一个
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-400 text-sm">
            <p>量子计算可视化教学系统 - 让量子计算触手可及</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
