'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Eye, Flag } from 'lucide-react'
import { transactionsAPI } from '@/lib/api'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = { page, size: 20 }
        if (filter === 'anomaly') {
          params.isAnomaly = 'true'
        }
        const res = await transactionsAPI.getList(params)
        setTransactions(res.data.list)
        setTotal(res.data.total)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, filter])

  const handleReport = async (id: number) => {
    try {
      await transactionsAPI.report(id)
      alert('交易已上报')
    } catch (error) {
      console.error('Failed to report transaction:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">交易审计</h1>
          <p className="text-gray-500 mt-1">审查和监控所有数字藏品交易</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索交易哈希、地址..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'anomaly' ? 'bg-danger-100 text-danger-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setFilter('anomaly')}
            >
              异常交易
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">交易哈希</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Token ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">价格</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">发送方</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">接收方</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-gray-700">
                        {tx.txHash?.slice(0, 10)}...
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{tx.tokenId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">
                        {tx.price?.toFixed(4)} ETH
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-gray-600">
                        {tx.fromAddr?.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-gray-600">
                        {tx.toAddr?.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {tx.isAnomaly ? (
                        <span className="badge badge-danger">异常</span>
                      ) : (
                        <span className="badge badge-success">正常</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded" title="查看详情">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        {!tx.reported && (
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            title="上报"
                            onClick={() => handleReport(tx.id)}
                          >
                            <Flag className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">共 {total} 条记录</span>
          <div className="flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </button>
            <span className="px-4 py-2 text-gray-600">{page}</span>
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
