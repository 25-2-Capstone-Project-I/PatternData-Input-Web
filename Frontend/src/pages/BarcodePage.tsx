import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProductFormData } from '../App'

type Props = {
  infoData: ProductFormData | null
}

function BarcodePage({ infoData }: Props) {
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

    if (!infoData) {
        // 새로고침 등으로 1페이지 데이터가 없으면 처음으로 보내기
        return <div>정보가 없습니다. 처음부터 다시 입력해 주세요.</div>
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (barcode.length !== 13 || !/^\d+$/.test(barcode)) {
        setError('바코드는 숫자 13자리여야 합니다.')
        return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('http://127.0.0.1:8000/api/products/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...infoData,
                    barcode,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
            // 🔴 여기서 에러 종류에 따라 메시지 분기
                if (data.name) {
                    setError('이미 존재하는 이름입니다. 다른 이름을 입력해 주세요.')
                } else {
                    setError('저장에 실패했습니다.')
                }
                return
            }

            // 저장 성공
            alert('저장되었습니다!')
            navigate('/')  // 또는 결과 페이지로 이동
        } 
        
        catch (err) {
            setError('서버 오류가 발생했습니다.')
            console.error(err)
        } 
            
        finally {
            setLoading(false)
        }
    }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <h1>바코드 입력</h1>
      <p>이름: {infoData.name}</p>
      <p>날짜: {infoData.date}</p>
      <p>카테고리: {infoData.category}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>바코드 (13자리)</label>
          <input
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            maxLength={13}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? '저장 중...' : 'DB에 저장하기'}
        </button>
      </form>
    </div>
  )
}

export default BarcodePage
