// 물건과 헤어지는 날짜 입력 화면
// - 기본값: 오늘 날짜
// - date 입력 후 /photo 로 이동

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormPageProps } from '../App'

function FarewellDatePage({ formData, setFormData }: FormPageProps) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  // 페이지 진입 시 farewellDate가 비어있으면 오늘 날짜로 초기화
  useEffect(() => {
    if (!formData.farewellDate) {
      setFormData((prev) => ({
        ...prev,
        farewellDate: new Date().toISOString().slice(0, 10),
      }))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (!formData.farewellDate) {
      setError('날짜를 선택해 주세요.')
      return
    }
    setError(null)
    navigate('/photo')
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto' }}>
      <h1 style={{ marginBottom: 16 }}>
        이 물건과 작별하는 날짜를 알려 주세요.
      </h1>
      <p style={{ marginBottom: 12, opacity: 0.8 }}>
        기본값은 오늘 날짜입니다.
      </p>

      <input
        type="date"
        value={formData.farewellDate}
        onChange={e =>
          setFormData(prev => ({ ...prev, farewellDate: e.target.value }))
        }
        style={{ width: '100%', padding: '8px 12px', fontSize: 16 }}
      />

      {error && (
        <p style={{ color: 'red', marginTop: 12 }}>{error}</p>
      )}

      <button
        onClick={handleNext}
        style={{ marginTop: 20 }}
      >
        다음으로
      </button>
    </div>
  )
}

export default FarewellDatePage
