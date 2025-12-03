// 종료 화면
// - Django에서 생성한 패턴 이미지를 보여주는 페이지
// - 새 플로우를 다시 시작할 수 있도록 버튼 제공

import { useNavigate } from 'react-router-dom'

type Props = {
  patternImageUrl: string | null
}

function EndPage({ patternImageUrl }: Props) {
  const navigate = useNavigate()

  const handleRestart = () => {
    // 페이지 전체 리셋
    window.location.href = '/'
    // 또는 navigate('/') 후 상태를 초기화하는 방식도 가능
    // 여기서는 가장 단순하게 전체 새로고침
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <h1 style={{ marginBottom: 16 }}>당신의 패턴이 완성되었습니다.</h1>
      <p style={{ marginBottom: 24, opacity: 0.8 }}>
        이 물건과의 관계가 패턴으로 기록되었습니다.
      </p>

      {patternImageUrl ? (
        <img
          src={patternImageUrl}
          alt="pattern"
          style={{
            maxWidth: 400,
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            marginBottom: 24,
          }}
        />
      ) : (
        <p style={{ marginBottom: 24 }}>
          패턴 이미지 정보를 찾을 수 없습니다. 다시 시도해 주세요.
        </p>
      )}

      <button onClick={handleRestart}>처음으로 돌아가기</button>

      <button
        style={{ marginTop: 12 }}
        onClick={() => navigate('/archive')}
      >
        다른 물건들의 기록 보기
      </button>
    </div>
  )
}

export default EndPage
