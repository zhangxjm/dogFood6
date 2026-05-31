'use client'

import { useEffect, useState } from 'react'
import { Blocks, Search, Activity, TrendingUp, Wallet } from 'lucide-react'
import { blockchainAPI } from '@/lib/api'

export default function BlockchainPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [searchType, setSearchType] = useState<'block' | 'tx' | 'address'>('block')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blocksRes, statsRes] = await Promise.all([
          blockchainAPI.getRecentBlocks(10),
          blockchainAPI.getStats(),
        ])
        setBlocks(blocksRes.data)
        setStats(statsRes.data)
      } catch (error) {
        console.error('Failed to fetch blockchain data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSearch = async () => {
    if (!search) return
    try {
      if (searchType === 'block') {
        const res = await blockchainAPI.getBlock(parseInt(search))
        setSearchResult({ type: 'block', data: res.data })
      } else if (searchType === 'tx') {
        const res = await blockchainAPI.getTransaction(search)
        setSearchResult({ type: 'tx', data: res.data })
      } else {
        const res = await blockchainAPI.getAddress(search)
        setSearchResult({ type: 'address', data: res.data })
      }
    } catch (error) {
      setSearchResult({ type: 'error', data: null })
    }
  }

  const hexToNumber = (hex: string) => {
    if (!hex) return 0
    return parseInt(hex, 16)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">链上浏览器</h1>
        <p className="text-gray-500 mt-1">浏览区块链数据和交易信息</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-lg">
            <Blocks className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">区块高度</p>
            <p className="text-xl font-bold text-gray-900">{stats?.blockHeight?.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-success-50 rounded-lg">
            <Activity className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">交易总数</p>
            <p className="text-xl font-bold text-gray-900">{stats?.totalTxCount?.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-warning-50 rounded-lg">
            <Wallet className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">活跃地址</p>
            <p className="text-xl font-bold text-gray-900">{stats?.activeWallets?.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-info-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">总交易额</p>
            <p className="text-xl font-bold text-gray-900">{stats?.totalVolume?.toFixed(2)} ETH</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">搜索</h3>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium ${searchType === 'block' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setSearchType('block')}
            >
              区块
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${searchType === 'tx' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setSearchType('tx')}
            >
              交易
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${searchType === 'address' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setSearchType('address')}
            >
              地址
            </button>
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder={searchType === 'block' ? '输入区块号' : searchType === 'tx' ? '输入交易哈希' : '输入钱包地址'}
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {searchResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            {searchResult.type === 'error' ? (
              <p className="text-gray-500">未找到相关数据</p>
            ) : searchResult.type === 'block' ? (
              <div className="space-y-2">
                <h4 className="font-medium">区块信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">区块号:</span> {hexToNumber(searchResult.data.number)}</div>
                  <div><span className="text-gray-500">哈希:</span> {searchResult.data.hash}</div>
                  <div><span className="text-gray-500">交易数:</span> {searchResult.data.transactions?.length || 0}</div>
                  <div><span className="text-gray-500">Gas Used:</span> {hexToNumber(searchResult.data.gasUsed)}</div>
                </div>
              </div>
            ) : searchResult.type === 'tx' ? (
              <div className="space-y-2">
                <h4 className="font-medium">交易信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">哈希:</span> {searchResult.data.txHash?.slice(0, 20)}...</div>
                  <div><span className="text-gray-500">区块:</span> {searchResult.data.blockNumber}</div>
                  <div><span className="text-gray-500">From:</span> {searchResult.data.from?.slice(0, 20)}...</div>
                  <div><span className="text-gray-500">To:</span> {searchResult.data.to?.slice(0, 20)}...</div>
                  <div><span className="text-gray-500">价格:</span> {searchResult.data.price || searchResult.data.value} ETH</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="font-medium">地址信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">地址:</span> {searchResult.data.balance?.address}</div>
                  <div><span className="text-gray-500">余额:</span> {searchResult.data.balance?.balance?.toFixed(4)} ETH</div>
                  <div><span className="text-gray-500">交易数:</span> {searchResult.data.history?.total || 0}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近区块</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">区块号</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">哈希</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">交易数</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Gas Used</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : (
                blocks.map((block, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-primary-600">
                        {hexToNumber(block.number)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-gray-600">
                        {block.hash?.slice(0, 18)}...
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{block.transactions?.length || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{hexToNumber(block.gasUsed).toLocaleString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
