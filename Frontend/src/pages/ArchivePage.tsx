import { useEffect, useState } from 'react'
import type { Product } from '../types'

const API_BASE = 'http://127.0.0.1:8000'

function ArchivePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/`)
        if (!res.ok) {
          throw new Error(`status: ${res.status}`)
        }
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error(err)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const keyword = searchText.trim().toLowerCase()
  const filtered = products.filter(p => {
    if (!keyword) return true
    return (
      p.item_name.toLowerCase().includes(keyword) ||
      p.nickname.toLowerCase().includes(keyword) ||
      p.barcode.includes(keyword)
    )
  })

  if (loading) {
    return <div style={{ padding: 24 }}>불러오는 중...</div>
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: 'red' }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <h1 style={{ marginBottom: 8 }}>아카이브</h1>
      <p style={{ marginBottom: 24, opacity: 0.8 }}>
        지금까지 등록된 물건들의 기록입니다.
      </p>

      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="물건 이름 / 별명 / 바코드 검색"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ padding: '6px 10px', minWidth: 260 }}
        />
      </div>

      {filtered.length === 0 ? (
        <p>조건에 맞는 물건이 없습니다.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {filtered.map(product => {
            const imageUrl = product.image
              ? `${API_BASE}${product.image}`
              : null

            return (
              <div
                key={product.id}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.item_name}
                    style={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover',
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: 160,
                      borderRadius: 12,
                      marginBottom: 8,
                      background: '#eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: '#777',
                    }}
                  >
                    이미지 없음
                  </div>
                )}

                {product.dominant_color && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: '1px solid #ccc',
                        background: product.dominant_color,
                      }}
                    />
                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                      {product.dominant_color}
                    </span>
                  </div>
                )}

                <div style={{ fontWeight: 600 }}>
                  {product.nickname} / {product.item_name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  만난 날: {product.met_date} · 헤어지는 날: {product.farewell_date}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 6,
                    opacity: 0.7,
                    fontFamily: 'monospace',
                  }}
                >
                  바코드: {product.barcode}
                </div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>
                  등록일: {new Date(product.created_at).toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ArchivePage
