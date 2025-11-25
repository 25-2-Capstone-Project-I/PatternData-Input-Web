import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import type { ProductFormData } from '../App'
import Webcam from 'react-webcam'

type Props = {
  infoData: ProductFormData | null
}
const API_BASE = 'http://127.0.0.1:8000'

const videoConstraints = {
  facingMode: 'environment', // 후면 카메라 우선 (노트북이면 그냥 웹캠)
}

// dataURL → Blob 변환 (이미지 파일로 보내기 위해)
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

function BarcodePage({ infoData }: Props) {
  const [barcode, setBarcode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 색 관련 state
  const [dominantColor, setDominantColor] = useState<string | null>(null)
  const [palette, setPalette] = useState<string[]>([])
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [webcamOpen, setWebcamOpen] = useState(false)

  const navigate = useNavigate()
  const webcamRef = useRef<Webcam | null>(null)

  // 새로고침 등으로 정보가 사라졌다면 처음으로 돌려보내기
  if (!infoData) {
    return (
      <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
        <p>이전 단계 정보가 없습니다. 처음부터 다시 입력해 주세요.</p>
        <button onClick={() => navigate('/')}>처음으로</button>
      </div>
    )
  }

  // dataURL(캡처 이미지)에서 "가운데 영역" 색 추출
  const extractCenterColorFromDataUrl = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        // 이미지 전체를 너무 크게 쓸 필요는 없으니까 적당히 리사이즈
        const width = 200
        const height = 200
        canvas.width = width
        canvas.height = height

        // 이미지 리사이즈해서 그리기
        ctx.drawImage(img, 0, 0, width, height)

        // 중앙 영역(40x40)의 색만 평균내기
        const regionSize = 40
        const startX = Math.floor(width / 2 - regionSize / 2)
        const startY = Math.floor(height / 2 - regionSize / 2)

        const imageData = ctx.getImageData(startX, startY, regionSize, regionSize)
        const { data } = imageData

        let rTotal = 0
        let gTotal = 0
        let bTotal = 0
        let count = 0

        // 중앙 작은 사각형 안의 모든 픽셀 평균
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const alpha = data[i + 3]
          if (alpha === 0) continue

          rTotal += r
          gTotal += g
          bTotal += b
          count++
        }

        if (count === 0) {
          reject(new Error('No pixels found in center region'))
          return
        }

        const rAvg = Math.round(rTotal / count)
        const gAvg = Math.round(gTotal / count)
        const bAvg = Math.round(bTotal / count)

        const toHex = (n: number) => n.toString(16).padStart(2, '0')
        const hex = `#${toHex(rAvg)}${toHex(gAvg)}${toHex(bAvg)}`

        resolve(hex)
      }
      img.onerror = err => reject(err)
      img.src = dataUrl
    })
  }

  type ErrorResponse = {
    nickname?: string
    [key: string]: unknown
  }

  const handleCaptureColor = async () => {
    if (!webcamRef.current) return
    const shot = webcamRef.current.getScreenshot()
    if (!shot) {
      setError('캡처에 실패했습니다. 다시 시도해 주세요.')
      return
    }

    setScreenshot(shot)
    setError(null)

    try {
      const color = await extractCenterColorFromDataUrl(shot)
      setDominantColor(color)
      setPalette([color])  // 대표색만 팔레트에 넣음
    } catch (err) {
      console.error(err)
      setError('색 추출 중 오류가 발생했습니다.')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // 바코드 유효성 검사
    if (barcode.length !== 13 || !/^\d+$/.test(barcode)) {
      setError('바코드는 숫자 13자리여야 합니다.')
      return
    }

    setLoading(true)

    try {
      // FormData 객체 생성
      const formData = new FormData()
      formData.append('item_name', infoData.itemName)
      formData.append('nickname', infoData.nickname)
      formData.append('met_date', infoData.metDate)
      formData.append('farewell_date', infoData.farewellDate)
      formData.append('barcode', barcode)

      if (dominantColor) {
        formData.append('dominant_color', dominantColor)
      }
      if (palette.length > 0) {
        formData.append('palette', JSON.stringify(palette))
      }

      // 캡처 이미지가 있다면 Blob으로 변환해서 파일 첨부
      if (screenshot) {
        const blob = dataUrlToBlob(screenshot)
        formData.append('image', blob, 'capture.png')
      }

      const res = await fetch(`${API_BASE}/api/products/`, {
        method: 'POST',
        body: formData,
      })

      const data: ErrorResponse = await res.json()

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
          minWidth: 340,
        }}
      >
        <h1 style={{ marginBottom: 16 }}>바코드를 입력해 주세요</h1>
        <p style={{ marginBottom: 24, opacity: 0.8 }}>
          마지막 단계입니다. 바코드와 사진, 색 정보를 함께 저장할 수 있습니다.
        </p>

        {/* 바코드 입력 */}
        <input
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          maxLength={13}
          required
          placeholder="바코드 13자리"
          style={{
            fontSize: 20,
            letterSpacing: 3,
            textAlign: 'center',
            padding: '8px 12px',
            marginBottom: 16,
            width: '100%',
          }}
        />

        {/* 웹캠 / 색 추출 섹션 */}
        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setWebcamOpen(prev => !prev)}
            style={{ marginBottom: 12 }}
          >
            {webcamOpen ? '웹캠 닫기' : '웹캠 열고 색 추출하기'}
          </button>

          {webcamOpen && (
            <div style={{ marginBottom: 12 }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                videoConstraints={videoConstraints}
                style={{ width: '100%', borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={handleCaptureColor}
                style={{ marginTop: 8 }}
              >
                캡처 & 색 추출
              </button>
            </div>
          )}

          {/* 색 추출 결과 미리보기 */}
          {dominantColor && (
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  margin: '0 auto 4px',
                  border: '1px solid #ccc',
                  background: dominantColor,
                }}
              />
              <div style={{ fontSize: 12 }}>대표 색: {dominantColor}</div>
            </div>
          )}

          {/* 캡처 이미지 썸네일 */}
          {screenshot && (
            <div style={{ marginTop: 8 }}>
              <img
                src={screenshot}
                alt="capture"
                style={{ width: 100, borderRadius: 8, opacity: 0.8 }}
              />
            </div>
          )}
        </div>

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