'use client'
import { useState, useEffect } from 'react'
import NavBar from '@/components/NavBar'

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [symbol, setSymbol] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchAssetDetails = async (symbol: string) => {
    try {
      const res = await fetch(`/api/ticker/${symbol}`)
      if (!res.ok) return { symbol, error: 'Failed to fetch details' }
      return res.json()
    } catch {
      return { symbol, error: 'Failed to fetch details' }
    }
  }

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch assets')

      const assetDetails = await Promise.all(
        (data.assets || []).map((s: string) => fetchAssetDetails(s))
      )
      setAssets(assetDetails)
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const handleAddAsset = async () => {
    if (!symbol) return
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbol.toUpperCase() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add asset')
      }
      setSymbol('')
      fetchAssets()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleRemoveAsset = async (symbol: string) => {
    try {
      const res = await fetch(`/api/assets?symbol=${symbol.toUpperCase()}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to remove asset')
      }
      fetchAssets()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <NavBar variant="app" />
      <div className="max-w-7xl mx-auto p-6 pt-20">
        <h2 className="text-2xl font-semibold mb-4">My Assets</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Add a stock symbol (e.g., AAPL)"
            className="input-glass w-full max-w-xs"
          />
          <button onClick={handleAddAsset} className="btn-primary">
            Add Asset
          </button>
        </div>
        {error && <p className="text-red-400">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div key={asset.symbol} className="card-glass p-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{asset.symbol}</h3>
                <p className="text-lg">{asset.name ?? ''}</p>
                <p>{asset.price ? `$${asset.price.toFixed(2)}` : 'Price not available'}</p>
              </div>
              <button onClick={() => handleRemoveAsset(asset.symbol)} className="btn-danger">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
