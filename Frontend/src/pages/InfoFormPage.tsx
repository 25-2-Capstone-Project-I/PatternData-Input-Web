import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import type { ProductFormData } from '../App'

type Props = {
  onNext: (data: ProductFormData) => void
}

const CATEGORIES = [
  '영수증 및 티켓',
  '식품 및 식료품',
  '전자제품 및 가구',
  '의류 및 패션 소품',
  '화장품',
  '잡화',
  '리빙 & 주방',
  '-',
  '악기',
  '도서 및 미디어',
]

function InfoFormPage({ onNext }: Props) {
  const navigate = useNavigate()

  const [itemName, setItemName] = useState('')
  const [nickname, setNickname] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setError(null)

  if (!nickname.trim()) {
    setError('닉네임을 입력해 주세요.')
    return
  }

  try {
    setChecking(true)

    const res = await fetch(
      `http://127.0.0.1:8000/api/products/check-nickname/?nickname=${encodeURIComponent(
        nickname,
      )}`,
    )

    // 1) 먼저 상태코드 확인
    if (!res.ok) {
      setError(`닉네임 중복 확인 중 오류가 발생했습니다. (status: ${res.status})`)
      return
    }

    const data = await res.json()
    console.log('check-nickname data:', data)

    // 2) 실제 중복 여부 확인
    if (data.exists) {
      setError('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.')
      return
    }

    // 3) 중복 아니면 다음 페이지로 이동
    onNext({
      itemName,
      nickname,
      date,
      category,
      description,
    })
    navigate('/barcode')
  } catch (err) {
    console.error(err)
    setError('닉네임 중복 확인 중 오류가 발생했습니다. (네트워크 에러)')
  } finally {
    setChecking(false)
  }
}

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <h1>물건 정보 입력</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>물건 이름</label>
          <input
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>닉네임 (중복 불가)</label>
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>날짜</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>카테고리</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>물건 설명</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        {error && (
          <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>
        )}

        <button type="submit" disabled={checking}>
          {checking ? '닉네임 확인 중...' : '다음 (바코드 입력)'}
        </button>
      </form>
    </div>
  )
}

export default InfoFormPage