// 바코드 입력 + Django로 최종 전송
// - 13자리 숫자만 허용
// - 페이지 진입 시 프리뷰 카드 플립 애니메이션
// - screenshot + dominantColor + 날짜/닉네임을 FormData로 백엔드에 전송
// - Django에서 Product 생성 + 패턴 이미지 생성
// - 응답받은 pattern_image_url을 상위 App 상태에 저장
// - /end 로 이동

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import type { ProductFormData, FormPageProps } from '../../App'
import FormPageLayout from '../../components/FormPageLayout/FormPageLayout'
import FormButton from '../../components/FormButton/FormButton'
import { API_BASE } from '../../config/api'
import './BarcodePage.css'

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
  const [isFlipped, setIsFlipped] = useState(false)

  // 날짜 포맷팅: YYYY-MM-DD -> YYYY.MM.DD
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${year}.${month}.${day}`
  }

  // 날짜 범위 계산
  const dateRange =
    formData.metDate && formData.farewellDate
      ? `${formatDate(formData.metDate)} - ${formatDate(formData.farewellDate)}`
      : formData.metDate
        ? `${formatDate(formData.metDate)} -`
        : ''

  // 페이지 진입 시 카드 플립 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true)
    }, 300) // 약간의 딜레이 후 플립

    return () => clearTimeout(timer)
  }, [])

  // 13자리 숫자인지 확인
  const isValidBarcode = /^\d{13}$/.test(localBarcode)

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 허용
    const value = e.target.value.replace(/\D/g, '')
    setLocalBarcode(value)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // 바코드 유효성 검사
    if (!isValidBarcode) {
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

      const res = await fetch(`${API_BASE}/api/products/create-with-pattern/`, {
        method: 'POST',
        body: form,
      })

      const data = await res.json()

      if (!res.ok) {
        console.error(data)
        setError('저장 또는 패턴 생성 중 오류가 발생했습니다.')
        return
      }

      // 백엔드에서 pattern_image_url을 돌려준다고 가정
      if (data.pattern_image_url) {
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

      // 영상 페이지로 이동 (영상 종료 후 /end로 자동 이동)
      navigate('/video')
    } catch (err) {
      console.error(err)
      setError('서버와 통신 중 문제가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <FormPageLayout activeStep={5}>
        <h1 className="barcode-title">바코드를 스캔해 이 물건의 목소리를 들을게요</h1>
        <p className="barcode-description">
          바코드는 이 물건이 지닌 말없는 정체성이예요
          <br />
          이 정보는 물건을 추억할 수 있는 패턴으로 변환되어요
        </p>

        <form className="barcode-form" onSubmit={handleSubmit}>
          <label htmlFor="barcode-input" className="barcode-label">
            바코드 번호
          </label>

          <input
            id="barcode-input"
            type="text"
            inputMode="numeric"
            className={`barcode-input ${error ? 'barcode-input--error' : ''}`}
            value={localBarcode}
            onChange={handleBarcodeChange}
            maxLength={13}
            placeholder="여기를 누르고 스캐너로 인식해주세요"
            autoComplete="off"
          />

          <p className="error-message">{error}</p>

          <FormButton type="submit" disabled={!isValidBarcode} loading={loading}>
            다음으로
          </FormButton>
        </form>
      </FormPageLayout>

      {/* 플립 카드 */}
      <div className="flip-card-container">
        <div className={`flip-card ${isFlipped ? 'flip-card--flipped' : ''}`}>
          {/* 앞면 - 물건 사진 */}
          <div className="flip-card-face flip-card-front">
            <div className="flip-card-content">
              <span className="flip-card-from-label">FROM</span>
              <span className="flip-card-nickname">{formData.nickname}</span>
              <div className="flip-card-image-container">
                {formData.screenshot ? (
                  <img
                    src={formData.screenshot}
                    alt="물건 사진"
                    className="flip-card-image"
                  />
                ) : (
                  <div className="flip-card-placeholder">?</div>
                )}
              </div>
              {dateRange && <span className="flip-card-date">{dateRange}</span>}
            </div>
          </div>

          {/* 뒷면 - 패턴 이미지 (아직 생성 전이므로 placeholder) */}
          <div className="flip-card-face flip-card-back">
            <div className="flip-card-content">
              <span className="flip-card-from-label">FROM</span>
              <span className="flip-card-nickname">{formData.nickname}</span>
              <div className="flip-card-image-container">
                <div className="flip-card-placeholder">?</div>
              </div>
              {dateRange && <span className="flip-card-date">{dateRange}</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BarcodePage
