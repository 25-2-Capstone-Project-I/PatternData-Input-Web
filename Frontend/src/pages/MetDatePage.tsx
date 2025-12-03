// 물건과 처음 만난 날짜 입력 화면
// - date 입력
// - 다음 버튼으로 /farewell-date 이동

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormPageProps } from '../App'

function MetDatePage({ formData, setFormData }: FormPageProps) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    if (!formData.metDate) {
      setError('날짜를 선택해 주세요.')
      return
    }
    setError(null)
    navigate('/farewell-date')
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto' }}>
      <h1 style={{ marginBottom: 16 }}>이 물건을 처음 만난 날을 알려 주세요.</h1>

      <input
        type="date"
        value={formData.metDate}
        onChange={e =>
          setFormData(prev => ({ ...prev, metDate: e.target.value }))
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

export default MetDatePage
