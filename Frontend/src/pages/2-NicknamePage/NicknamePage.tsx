// 별명(닉네임) 입력 화면
// - 닉네임 입력
// - Django에 중복 체크 요청
// - 통과하면 /met-date 로 이동

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import type { FormPageProps } from '../App'

// 백엔드 기본 URL (필요에 따라 수정 가능)
const API_BASE = 'http://127.0.0.1:8000'

function NicknamePage({ formData, setFormData }: FormPageProps) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const nickname = formData.nickname.trim()
    if (!nickname) {
      setError('별명을 입력해 주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `${API_BASE}/api/products/check-nickname/?nickname=${encodeURIComponent(
          nickname,
        )}`,
      )

      if (!res.ok) {
        setError(`닉네임 확인 중 오류가 발생했습니다. (status: ${res.status})`)
        return
      }

      const data = await res.json()
      if (data.exists) {
        setError('이미 사용 중인 별명입니다. 다른 별명을 입력해 주세요.')
        return
      }

      // 닉네임 사용 가능 → 다음 단계로
      navigate('/met-date')
    } catch (err) {
      console.error(err)
      setError('서버와 통신 중 문제가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto' }}>
      <h1 style={{ marginBottom: 16 }}>이 물건에게 별명을 붙여 주세요.</h1>
      <p style={{ marginBottom: 24, opacity: 0.8 }}>
        기록과 패턴에는 이 별명이 함께 남게 됩니다.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          value={formData.nickname}
          onChange={e =>
            setFormData(prev => ({ ...prev, nickname: e.target.value }))
          }
          placeholder="예: 똥깨, 나의 첫 카메라, ..."
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 16,
            marginBottom: 12,
          }}
        />

        {error && (
          <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? '확인 중...' : '다음으로'}
        </button>
      </form>
    </div>
  )
}

export default NicknamePage
