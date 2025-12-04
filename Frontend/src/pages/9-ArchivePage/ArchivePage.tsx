// 아카이빙 페이지
// - Django에서 전체 Product 목록을 불러와 카드 형태로 표시
// - 별명, 바코드, 날짜, 패턴 이미지 등을 한눈에 볼 수 있도록 구성

import { useEffect, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000'

// 백엔드 Product 모델과 맞춘 타입 (필요에 따라 수정 가능)
type Product = {
  id: number
  item_name: string
  nickname: string
  met_date: string
  farewell_date: string
  barcode: string
  dominant_color: string | null
  palette: string[] | null
  image: string | null
  pattern_image: string | null
  created_at: string
}

function ArchivePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/products/`)
        if (!res.ok) {
          setError(`데이터를 불러오는 중 오류가 발생했습니다. (status: ${res.status})`)
          return
        }
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error(err)
        setError('서버와 통신 중 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // 간단한 검색: 별명 / 물건 이름 / 바코드
  const filtered = products.filter(p => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      p.nickname.toLowerCase().includes(q) ||
      p.item_name.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q)
    )
  })

  const resolveUrl = (path: string | null) => {
    if (!path) return null
    return path.startsWith('http') ? path : `${API_BASE}${path}`
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>물건 아카이브</h1>
      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        지금까지 기록된 물건들의 패턴과 정보를 볼 수 있습니다.
      </p>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="별명, 물건 이름, 바코드로 검색"
        style={{
          width: '100%',
          maxWidth: 360,
          padding: '8px 12px',
          marginBottom: 16,
        }}
      />

      {loading && <p>불러오는 중입니다...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginTop: 16,
        }}
      >
        {filtered.map(p => {
          const patternUrl = resolveUrl(p.pattern_image)
          const imageUrl = resolveUrl(p.image)

          return (
            <div
              key={p.id}
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 16,
                boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
              }}
            >
              {/* 상단 이미지 영역: 패턴 없으면 사진, 둘 다 없으면 회색 박스 */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 12,
                  marginBottom: 12,
                  overflow: 'hidden',
                  background: '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {patternUrl ? (
                  <img
                    src={patternUrl}
                    alt="pattern"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="item"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ opacity: 0.6 }}>이미지 없음</span>
                )}
              </div>

              {/* 색상 표시 */}
              {p.dominant_color && (
                <div style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: '1px solid #ccc',
                        background: p.dominant_color,
                      }}
                    />
                    <span style={{ fontSize: 12, opacity: 0.8 }}>
                      {p.dominant_color}
                    </span>
                  </span>
                </div>
              )}

              {/* 텍스트 정보 */}
              <h2 style={{ margin: '4px 0' }}>
                {p.nickname} ({p.item_name})
              </h2>
              <p style={{ margin: '2px 0', fontSize: 13, opacity: 0.8 }}>
                만난 날: {p.met_date} / 헤어지는 날: {p.farewell_date}
              </p>
              <p style={{ margin: '2px 0', fontSize: 13, opacity: 0.8 }}>
                바코드: {p.barcode}
              </p>
              <p style={{ margin: '2px 0', fontSize: 12, opacity: 0.6 }}>
                기록된 날: {new Date(p.created_at).toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ArchivePage
