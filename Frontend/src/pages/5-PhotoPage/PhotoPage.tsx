// 물건 사진 촬영 + 색 추출 화면
// - 웹캠으로 물건을 촬영
// - 메인 화면과 PreviewCard에서 동시에 웹캠 미리보기
// - 캡처 후 중앙 영역의 평균 색을 추출하여 dominantColor로 저장
// - 캡처 화면(screenshot)도 formData에 저장
// - 다음으로 /barcode 이동

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import type { FormPageProps } from '../../App'
import FormPageLayout from '../../components/FormPageLayout/FormPageLayout'
import PreviewCard from '../../components/PreviewCard/PreviewCard'
import './PhotoPage.css'

// 버튼 이미지
import cameraButtonImg from '../../assets/images/buttons/cameraButton.svg'
import retakeButtonImg from '../../assets/images/buttons/retakeButton.svg'
import nextButtonImg from '../../assets/images/buttons/nextButton.svg'

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

      resolve(hex.toUpperCase())
    }

    img.onerror = (err) => reject(err)
    img.src = dataUrl
  })
}

function PhotoPage({ formData, setFormData }: FormPageProps) {
  const navigate = useNavigate()
  const webcamRef = useRef<Webcam | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [localScreenshot, setLocalScreenshot] = useState<string | null>(
    formData.screenshot ?? null
  )
  const [localDominantColor, setLocalDominantColor] = useState<string | null>(
    formData.dominantColor ?? null
  )

  // 실시간 미리보기를 위한 state
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // 촬영된 상태인지 확인
  const isCaptured = !!localScreenshot

  // 실시간 미리보기 업데이트 (촬영 전에만)
  useEffect(() => {
    if (isCaptured) return

    let animationId: number

    const updatePreview = () => {
      if (webcamRef.current) {
        const shot = webcamRef.current.getScreenshot()
        if (shot) {
          setPreviewImage(shot)
        }
      }
      animationId = requestAnimationFrame(updatePreview)
    }

    // 약간의 딜레이 후 시작 (웹캠 초기화 대기)
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(updatePreview)
    }, 500)

    return () => {
      clearTimeout(timeoutId)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isCaptured])

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
      setLocalDominantColor(color)

      // formData에 screenshot + dominantColor 저장
      setFormData((prev) => ({
        ...prev,
        screenshot: shot,
        dominantColor: color,
        palette: [color],
      }))
    } catch (err) {
      console.error(err)
      setError('색 추출 중 오류가 발생했습니다.')
    }
  }

  const handleRetake = () => {
    setLocalScreenshot(null)
    setLocalDominantColor(null)
    setFormData((prev) => ({
      ...prev,
      screenshot: undefined,
      dominantColor: undefined,
      palette: undefined,
    }))
  }

  const handleNext = () => {
    if (!formData.screenshot || !formData.dominantColor) {
      setError('사진을 찍고 색 추출을 완료해 주세요.')
      return
    }
    navigate('/barcode')
  }

  return (
    <>
      <FormPageLayout activeStep={4}>
        <h1 className="photo-title">물건의 마지막 모습을 사진으로 남겨요</h1>
        <p className="photo-description">중앙 가이드에 맞춰 조심스럽게 올려주세요</p>

        <div className="photo-webcam-container">
          {isCaptured ? (
            <img
              src={localScreenshot}
              alt="captured"
              className="photo-captured-image"
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={videoConstraints}
              className="photo-webcam"
            />
          )}
        </div>

        {/* 추출된 색 표시 영역 - 항상 공간 유지, 내용만 on/off */}
        <div className={`photo-extracted-color ${localDominantColor ? 'visible' : ''}`}>
          <span className="extracted-color-label">추출된 색:</span>
          <span
            className="extracted-color-box"
            style={{ backgroundColor: localDominantColor || 'transparent' }}
          />
          <span className="extracted-color-hex">{localDominantColor || ''}</span>
        </div>

        {/* 버튼 영역 */}
        <div className="photo-buttons">
          {isCaptured ? (
            <>
              <button
                type="button"
                className="photo-circle-button"
                onClick={handleRetake}
                aria-label="재촬영"
              >
                <img src={retakeButtonImg} alt="재촬영" />
              </button>
              <button
                type="button"
                className="photo-circle-button"
                onClick={handleNext}
                aria-label="다음"
              >
                <img src={nextButtonImg} alt="다음" />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="photo-circle-button photo-camera-button"
              onClick={handleCapture}
              aria-label="촬영"
            >
              <img src={cameraButtonImg} alt="촬영" />
            </button>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}
      </FormPageLayout>

      <PreviewCard
        nickname={formData.nickname}
        metDate={formData.metDate}
        farewellDate={formData.farewellDate}
        imageUrl={isCaptured ? localScreenshot : previewImage}
      />
    </>
  )
}

export default PhotoPage
