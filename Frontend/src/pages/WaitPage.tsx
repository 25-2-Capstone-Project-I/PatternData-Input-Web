// 대기 화면
// 관람객이 화면을 클릭하면 플로우가 시작되도록 구성

import { useNavigate } from 'react-router-dom'

function WaitPage() {
  const navigate = useNavigate()

  const handleStart = () => {
    // 별명 입력 화면으로 이동
    navigate('/nickname')
  }

  return (
    <div
      onClick={handleStart}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: '#111',
        color: '#f5f5f5',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1>화면을 눌러 시작해 주세요</h1>
        <p style={{ opacity: 0.7, marginTop: 8 }}>
          이 물건과의 마지막 시간을 기록합니다.
        </p>
      </div>
    </div>
  )
}

export default WaitPage
