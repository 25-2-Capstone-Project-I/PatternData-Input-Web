import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import type { ProductFormData } from '../App'

type Props = {
  infoData: ProductFormData | null
}

function BarcodePage({ infoData }: Props) {
  const [barcode, setBarcode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // 새로고침 등으로 정보가 사라졌다면 처음으로 돌려보내기
  if (!infoData) {
    return (
      <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
        <p>이전 단계 정보가 없습니다. 처음부터 다시 입력해 주세요.</p>
        <button onClick={() => navigate('/')}>처음으로</button>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (barcode.length !== 13 || !/^\d+$/.test(barcode)) {
      setError('바코드는 숫자 13자리여야 합니다.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:8000/api/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_name: infoData.itemName,
          nickname: infoData.nickname,
          date: infoData.date,
          category: infoData.category,
          description: infoData.description,
          barcode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error(data)
        if (data.nickname) {
          setError('이미 사용 중인 닉네임입니다. 처음 단계에서 다시 시도해 주세요.')
        } else {
          setError('저장에 실패했습니다.')
        }
        return
      }

      alert('저장되었습니다!')
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'white',
          padding: '32px 40px',
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
          minWidth: 320,
        }}
      >
        <h1 style={{ marginBottom: 16 }}>바코드를 입력해 주세요</h1>
        <p style={{ marginBottom: 24, opacity: 0.8 }}>
          마지막 단계입니다. 물건의 바코드 13자리를 입력하고 저장을 완료하세요.
        </p>

        <input
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          maxLength={13}
          required
          style={{
            fontSize: 24,
            letterSpacing: 4,
            textAlign: 'center',
            padding: '8px 12px',
            marginBottom: 16,
          }}
        />

        {error && (
          <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? '저장 중...' : 'DB에 저장하기'}
        </button>
      </form>
    </div>
  )
}

export default BarcodePage
