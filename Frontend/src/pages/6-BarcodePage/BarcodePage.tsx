// 바코드 입력 + Django로 최종 전송
// - 13자리 숫자만 허용
// - screenshot + dominantColor + 날짜/닉네임을 FormData로 백엔드에 전송
// - Django에서 Product 생성 + 패턴 이미지 생성
// - 응답받은 pattern_image_url을 상위 App 상태에 저장
// - /end 로 이동

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import type { ProductFormData, FormPageProps } from '../../App'

const API_BASE = 'http://127.0.0.1:8000'

// dataURL → Blob 변환 유틸 함수
const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

type Props = FormPageProps & {
  patternImageUrl: string | null
  setPatternImageUrl: React.Dispatch<React.SetStateAction<string | null>>
}

function BarcodePage({ formData, setFormData, setPatternImageUrl }: Props) {
  const navigate = useNavigate()
  const [localBarcode, setLocalBarcode] = useState<string>(formData.barcode ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // 바코드 유효성 검사
    if (!/^\d{13}$/.test(localBarcode)) {
      setError('바코드는 숫자 13자리여야 합니다.')
      return
    }

    // 필요한 데이터들이 모두 있는지 확인
    if (!formData.nickname || !formData.metDate || !formData.farewellDate) {
      setError('앞 단계의 정보가 누락되었습니다. 처음부터 다시 시도해 주세요.')
      return
    }
    if (!formData.screenshot || !formData.dominantColor) {
      setError('사진 또는 색 정보가 누락되었습니다. 이전 단계로 돌아가 주세요.')
      return
    }

    setLoading(true)

    try {
      const form = new FormData()

      // item_name은 현재 별도로 입력받지 않으므로, 일단 nickname과 동일하게 사용
      // 필요하면 추후 별도의 "물건 이름" 단계 추가 가능
      form.append('item_name', formData.nickname)

      form.append('nickname', formData.nickname)
      form.append('met_date', formData.metDate)
      form.append('farewell_date', formData.farewellDate)
      form.append('barcode', localBarcode)
      form.append('dominant_color', formData.dominantColor)

      if (formData.palette) {
        form.append('palette', JSON.stringify(formData.palette))
      }

      const imageBlob = dataUrlToBlob(formData.screenshot)
      form.append('image', imageBlob, 'capture.png')

      const res = await fetch(
        `${API_BASE}/api/products/create-with-pattern/`,
        {
          method: 'POST',
          body: form,
        },
      )

      const data = await res.json()

      if (!res.ok) {
        console.error(data)
        setError('저장 또는 패턴 생성 중 오류가 발생했습니다.')
        return
      }

      // 백엔드에서 pattern_image_url을 돌려준다고 가정
      if (data.pattern_image_url) {
        // App 전역 상태에 패턴 이미지 URL 저장
        const fullUrl = data.pattern_image_url.startsWith('http')
          ? data.pattern_image_url
          : `${API_BASE}${data.pattern_image_url}`

        setPatternImageUrl(fullUrl)
      }

      // 입력한 바코드도 formData에 최종 저장해 둠
      setFormData((prev: ProductFormData) => ({
        ...prev,
        barcode: localBarcode,
      }))

      // 종료 화면으로 이동
      navigate('/end')
    } catch (err) {
      console.error(err)
      setError('서버와 통신 중 문제가 발생했습니다.')
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
        <h1 style={{ marginBottom: 16 }}>바코드를 입력해 주세요.</h1>
        <p style={{ marginBottom: 24, opacity: 0.8 }}>
          13자리 숫자 바코드를 정확히 입력하면 패턴이 완성됩니다.
        </p>

        <input
          value={localBarcode}
          onChange={e => setLocalBarcode(e.target.value)}
          maxLength={13}
          placeholder="숫자 13자리"
          style={{
            fontSize: 20,
            letterSpacing: 3,
            textAlign: 'center',
            padding: '8px 12px',
            marginBottom: 16,
            width: '100%',
          }}
        />

        {error && (
          <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? '패턴 생성 중...' : '완료'}
        </button>
      </form>
    </div>
  )
}

export default BarcodePage
