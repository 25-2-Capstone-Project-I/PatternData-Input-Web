// 패턴 생성 대기 영상 페이지
// - metDate와 farewellDate 월을 기반으로 계절 영상 선택
// - 자막 4개 문장을 4초마다 순환
// - 영상 종료 후 /end 페이지로 이동

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './VideoPage.css'

// 계절별 영상 import
import springToSpring from '../../assets/videos/spring/spring.mp4'
// import springToSummer from '../../assets/videos/spring/summer.mp4'
// import springToAutumn from '../../assets/videos/spring/autumn.mp4'
// import springToWinter from '../../assets/videos/spring/winter.mp4'

// import summerToSpring from '../../assets/videos/summer/spring.mp4'
// import summerToSummer from '../../assets/videos/summer/summer.mp4'
// import summerToAutumn from '../../assets/videos/summer/autumn.mp4'
// import summerToWinter from '../../assets/videos/summer/winter.mp4'

// import autumnToSpring from '../../assets/videos/autumn/spring.mp4'
// import autumnToSummer from '../../assets/videos/autumn/summer.mp4'
import autumnToAutumn from '../../assets/videos/autumn/autumn.mp4'
// import autumnToWinter from '../../assets/videos/autumn/winter.mp4'

// import winterToSpring from '../../assets/videos/winter/spring.mp4'
// import winterToSummer from '../../assets/videos/winter/summer.mp4'
// import winterToAutumn from '../../assets/videos/winter/autumn.mp4'
// import winterToWinter from '../../assets/videos/winter/winter.mp4'

// 자막 문장들
const SUBTITLES = [
  '기억을 실처럼 엮고 있어요',
  '잠시만 기다리면, 당신의 기억이 형태를 갖춰요',
  '물건과 소중했던 기억을 떠올려보세요',
  '그리고, 물건의 안녕을 빌어주세요',
]

// 자막 변경 간격 (ms)
const SUBTITLE_INTERVAL = 4000

type Season = 'spring' | 'summer' | 'autumn' | 'winter'

type VideoPageProps = {
  metDate: string // YYYY-MM-DD
  farewellDate: string // YYYY-MM-DD
}

// 월에서 계절 추출
const getSeasonFromMonth = (month: number): Season => {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter' // 12, 1, 2
}

// metDate 계절 폴더 + farewellDate 계절 영상 조합
const getVideoSource = (metSeason: Season, farewellSeason: Season): string => {
  const videoMap: Record<Season, Record<Season, string>> = {
    spring: {
      spring: springToSpring,
      summer: springToSpring,   // springToSummer,
      autumn: springToSpring,   // springToAutumn,
      winter: springToSpring,   // springToWinter,
    },
    summer: {
      spring: springToSpring,   // summerToSpring,
      summer: springToSpring,   // SummerToSpring,
      autumn: springToSpring,   // summerToAutumn,
      winter: springToSpring,   // summerToWinter,
    },
    autumn: {
      spring: springToSpring,   // autumnToSpring,
      summer: springToSpring,   // autumnToSummer,
      autumn: autumnToAutumn,
      winter: springToSpring,   // autumnToWinter,
    },
    winter: {
      spring: springToSpring,   // winterToSpring,
      summer: springToSpring,   // winterToSummer,
      autumn: springToSpring,   // winterToAutumn,
      winter: springToSpring,   // winterToWinter,
    },
  }

  return videoMap[metSeason][farewellSeason]
}

function VideoPage({ metDate, farewellDate }: VideoPageProps) {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0)
  const [subtitleKey, setSubtitleKey] = useState(0)

  // 날짜에서 월 추출
  const metMonth = metDate ? parseInt(metDate.split('-')[1], 10) : 3
  const farewellMonth = farewellDate ? parseInt(farewellDate.split('-')[1], 10) : 6

  // 계절 결정
  const metSeason = getSeasonFromMonth(metMonth)
  const farewellSeason = getSeasonFromMonth(farewellMonth)

  // 영상 소스 결정
  const videoSource = getVideoSource(metSeason, farewellSeason)

  // 자막 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubtitleIndex((prev) => (prev + 1) % SUBTITLES.length)
      setSubtitleKey((prev) => prev + 1) // 애니메이션 재시작을 위한 key
    }, SUBTITLE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // 영상 종료 시 /end 페이지로 이동
  const handleVideoEnd = () => {
    navigate('/end')
  }

  return (
    <div className="video-page-root">
      <video
        ref={videoRef}
        className="video-background"
        src={videoSource}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
      />

      {/* 자막 */}
      <div className="subtitle-container">
        <div key={subtitleKey} className="subtitle-bubble">
          <span className="subtitle-text">
            {SUBTITLES[currentSubtitleIndex]}
          </span>
        </div>
      </div>
    </div>
  )
}

export default VideoPage

