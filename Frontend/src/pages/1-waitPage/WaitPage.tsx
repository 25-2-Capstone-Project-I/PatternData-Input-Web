// src/pages/1-WaitPage/WaitPage.tsx

// 대기 화면
// 관람객이 화면을 클릭하면 플로우가 시작되도록 구성

import { useNavigate } from 'react-router-dom'
import CircleItems from './CircleItems'
import './WaitPage.css'

function WaitPage() {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/nickname')
  }

  return (
    <div className="wait-wrapper" onClick={handleStart}>
      {/* 원형 PNG 두 개 회전 */}
      <CircleItems />

      {/* 상단 로고 */}
      <div className="logo-text">woven memory</div>

      {/* 중앙 메인 텍스트 */}
      <div className="main-text">
        당신의 물건과
        <br />
        좋은 이별을 시작해볼까요?
      </div>

      {/* 하단 안내 문구 */}
      <div className="bottom-text">화면을 클릭해 시작하세요</div>
    </div>
  )
}

export default WaitPage
