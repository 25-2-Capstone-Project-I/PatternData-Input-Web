// 물건 사진 촬영 + 색 추출 화면
// - 웹캠으로 물건을 촬영
// - 캡처 후 중앙 영역의 평균 색을 추출하여 dominantColor로 저장
// - 캡처 화면(screenshot)도 formData에 저장
// - 다음으로 /barcode 이동

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import type { FormPageProps } from '../App'

const videoConstraints = {
  facingMode: 'environment', // 후면 카메라 우선
}

// dataURL에서 중앙 영역의 평균 색을 추출하는 함수
const extractCenterColorFromDataUrl = (dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      const width = 200
      const height = 200
      canvas.width = width
      canvas.height = height

      // 이미지 전체를 200x200으로 리사이즈해서 그림
      ctx.drawImage(img, 0, 0, width, height)

      // 중앙 40x40 영역만 사용
      const regionSize = 40
      const startX = Math.floor(width / 2 - regionSize / 2)
      const startY = Math.floor(height / 2 - regionSize / 2)

      const imageData = ctx.getImageData(startX, startY, regionSize, regionSize)
      const { data } = imageData

      let rTotal = 0
      let gTotal = 0
      let bTotal = 0
      let count = 0

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
        reject(new Error('No pixels found'))
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

function PhotoPage({ formData, setFormData }: FormPageProps) {
  const navigate = useNavigate()
  const webcamRef = useRef<Webcam | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [localScreenshot, setLocalScreenshot] = useState<string | null>(
    formData.screenshot ?? null,
  )

  const handleCapture = async () => {
    if (!webcamRef.current) return

    const shot = webcamRef.current.getScreenshot()
    if (!shot) {
      setError('캡처에 실패했습니다. 다시 시도해 주세요.')
      return
    }

    setLocalScreenshot(shot)
    setError(null)

    try {
      const color = await extractCenterColorFromDataUrl(shot)

      // formData에 screenshot + dominantColor 저장
      setFormData(prev => ({
        ...prev,
        screenshot: shot,
        dominantColor: color,
        palette: [color], // 필요하면 나중에 여러 색으로 확장
      }))
    } catch (err) {
      console.error(err)
      setError('색 추출 중 오류가 발생했습니다.')
    }
  }

  const handleNext = () => {
    if (!formData.screenshot || !formData.dominantColor) {
      setError('사진을 찍고 색 추출을 완료해 주세요.')
      return
    }
    navigate('/barcode')
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
      <h1 style={{ marginBottom: 16 }}>물건을 촬영해 주세요.</h1>
      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        물건이 화면 중앙에 오도록 맞추고 촬영하면,
        그 색으로 패턴의 하단 색상이 결정됩니다.
      </p>

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        videoConstraints={videoConstraints}
        style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
      />

      <button type="button" onClick={handleCapture}>
        캡처 및 색 추출
      </button>

      {formData.dominantColor && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              margin: '0 auto 8px',
              border: '1px solid #ccc',
              background: formData.dominantColor,
            }}
          />
          <div>추출된 색: {formData.dominantColor}</div>
        </div>
      )}

      {localScreenshot && (
        <div style={{ marginTop: 12 }}>
          <img
            src={localScreenshot}
            alt="capture"
            style={{ width: 180, borderRadius: 8, opacity: 0.8 }}
          />
        </div>
      )}

      {error && (
        <p style={{ color: 'red', marginTop: 12 }}>{error}</p>
      )}

      <button
        type="button"
        onClick={handleNext}
        style={{ marginTop: 20 }}
      >
        다음으로
      </button>
    </div>
  )
}

export default PhotoPage
