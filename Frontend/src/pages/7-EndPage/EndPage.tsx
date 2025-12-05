// 종료 화면 (EndPage)
// - 1) 패턴 완료 영상 + 문구
// - 2) 카드 확인 화면 (아래에서 올라오며 회전)
// - 3) QR + 카드 플립 + 자동 홈으로 돌아가기

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './EndPage.css'

// 도베가 실제 mp4 파일을 이 경로에 맞춰 넣어줘
// (이미 잘 나오고 있다면 기존 import 경로 그대로 사용해도 됨)
import endBackgroundVideo from '../../assets/videos/end-background.mp4'

type Props = {
  patternImageUrl: string | null
  // 아래 값들은 App.tsx 쪽에서 formData로부터 내려주면 됨
  nickname?: string
  metDate?: string
  farewellDate?: string
  objectImageUrl?: string | null
}

type Step = 'video' | 'card' | 'qr'

const VIDEO_DURATION_MS = 8000
const AUTO_RESET_DELAY_MS = 40000  // 40초

function EndPage({
  patternImageUrl,
  nickname,
  metDate,
  farewellDate,
  objectImageUrl,
}: Props) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('video')
  const [isFlipped, setIsFlipped] = useState(false)

  // 1) 페이지 처음 들어오면 8초 뒤에 카드 화면으로 전환
  useEffect(() => {
    if (step !== 'video') return
    const timer = setTimeout(() => {
      setStep('card')
    }, VIDEO_DURATION_MS)

    return () => clearTimeout(timer)
  }, [step])

  // 2) QR 화면에 들어오면 40초 뒤 자동으로 처음 화면으로 이동
  useEffect(() => {
    if (step !== 'qr') return

    const timer = setTimeout(() => {
      window.location.href = '/'
    }, AUTO_RESET_DELAY_MS)

    return () => clearTimeout(timer)
  }, [step])

  const handleRestart = () => {
    window.location.href = '/'
  }

  const handleCardClick = () => {
    // 카드 화면에서 카드를 누르면 QR 화면으로 이동 (카드가 오른쪽으로 이동)
    if (step === 'card') {
      setStep('qr')
      setIsFlipped(false)
      return
    }

    // QR 화면에서는 카드 앞/뒷면 플립
    if (step === 'qr') {
      setIsFlipped((prev) => !prev)
    }
  }

  // 날짜 표시
  const dateRange =
    metDate && farewellDate
      ? `${metDate} - ${farewellDate}`
      : farewellDate ?? metDate ?? ''

  // 물건 사진 (촬영본) – 없으면 아주 연한 placeholder
  const effectiveObjectImage =
    objectImageUrl ||
    'https://placehold.co/378x378/eeeeee/cccccc?text=%EB%AC%BC%EA%B1%B4+%EC%82%AC%EC%A7%84'

  return (
    <div className="end-page-root">
      {/* Scene 1: 동영상 + 문구 페이드 인/아웃 */}
      {step === 'video' && (
        <div className="end-scene end-scene-video">
          <video
            className="end-video"
            autoPlay
            muted
            playsInline
            onEnded={() => setStep('card')}
          >
            <source src={endBackgroundVideo} type="video/mp4" />
          </video>

          <div className="end-video-overlay">
            <div className="end-logo">
              <span>woven</span>
              <br />
              <span>memory</span>
            </div>

            <p className="video-message message-1">패턴이 완성되었어요!</p>
            <p className="video-message message-2">
              이 패턴은 당신과 물건이 함께한 시간이
              <br />
              실의 흐름처럼 새롭게 만들어진 모습이에요
            </p>
          </div>
        </div>
      )}

      {/* Scene 2: 카드 확인해보세요 */}
      {step === 'card' && (
        <div className="end-scene end-scene-card">
          <header className="end-logo end-logo--top">
            <span>woven</span>
            <br />
            <span>memory</span>
          </header>

          <h1 className="end-title">카드를 확인해보세요</h1>

          <div
            className="memory-card-wrapper memory-card-wrapper--center"
            onClick={handleCardClick}
          >
            <div className="memory-card memory-card--enter">
              {/* 앞면만 필요 – 이 단계에서는 뒷면은 QR 화면에서만 사용 */}
              <div className="memory-card-face memory-card-front">
                <div className="memory-card-header">
                  <span className="from-label">FROM</span>
                  {nickname && (
                    <span className="from-name">{nickname}</span>
                  )}
                </div>

                <div className="memory-card-image-frame">
                  <img
                    src={effectiveObjectImage}
                    alt="물건 사진 이미지"
                    className="memory-card-image"
                  />
                </div>

                {dateRange && (
                  <div className="memory-card-footer">
                    <span className="date-range">{dateRange}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scene 3: QR + 카드 + 처음으로 돌아가기 */}
      {step === 'qr' && (
        <div className="end-scene end-scene-qr">
          <header className="end-logo end-logo--top">
            <span>woven</span>
            <br />
            <span>memory</span>
          </header>

          <div className="end-qr-layout">
            {/* 왼쪽 텍스트 + QR 자리 */}
            <div className="end-qr-left">
              <h2 className="qr-title">바깥 공간에서 자수 키트를 받아가세요</h2>
              <p className="qr-description">
                내 카드는 아래의 아카이빙 페이지에서
                <br />
                언제든 다시 볼 수 있어요
              </p>

              <div className="qr-box">
                {/* 나중에 QR 이미지를 <img src={...}/>로 교체 */}
                <span>사이트 로그인 링크 QR</span>
              </div>

              <button className="restart-button" onClick={handleRestart}>
                처음으로 돌아가기
              </button>
            </div>

            {/* 오른쪽 카드 (플립 가능) */}
            <div
              className="memory-card-wrapper memory-card-wrapper--right"
              onClick={handleCardClick}
            >
              <div
                className={
                  'memory-card memory-card--flip-base ' +
                  (isFlipped ? 'memory-card--flipped' : '')
                }
              >
                {/* 앞면: 물건 사진 */}
                <div className="memory-card-face memory-card-front">
                  <div className="memory-card-header">
                    <span className="from-label">FROM</span>
                    {nickname && (
                      <span className="from-name">{nickname}</span>
                    )}
                  </div>

                  <div className="memory-card-image-frame">
                    <img
                      src={effectiveObjectImage}
                      alt="물건 사진 이미지"
                      className="memory-card-image"
                    />
                  </div>

                  {dateRange && (
                    <div className="memory-card-footer">
                      <span className="date-range">{dateRange}</span>
                    </div>
                  )}
                </div>

                {/* 뒷면: 패턴 이미지 */}
                <div className="memory-card-face memory-card-back">
                  <div className="memory-card-header">
                    <span className="from-label">FROM</span>
                    {nickname && (
                      <span className="from-name">{nickname}</span>
                    )}
                  </div>

                  <div className="memory-card-image-frame">
                    {patternImageUrl ? (
                      <img
                        src={patternImageUrl}
                        alt="패턴 이미지"
                        className="memory-card-image"
                      />
                    ) : (
                      <div className="memory-card-image placeholder-pattern">
                        패턴 이미지
                      </div>
                    )}
                  </div>

                  {dateRange && (
                    <div className="memory-card-footer">
                      <span className="date-range">{dateRange}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EndPage
