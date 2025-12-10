// 카드 프리뷰 컴포넌트
// - 닉네임, 날짜, 이미지 등을 실시간으로 보여주는 카드
// - 여러 페이지에서 재사용 (폼 입력, 아카이브 갤러리, 상세 뷰 등)

import './PreviewCard.css'

type PreviewCardProps = {
  nickname?: string
  metDate?: string
  farewellDate?: string
  imageUrl?: string | null
  placeholder?: string
  // 플립 기능 지원 (EndPage용)
  flipable?: boolean
  isFlipped?: boolean
  backImageUrl?: string | null

  // 사이즈 변형 (기본: large - 폼 페이지용, small - 아카이브 갤러리용)
  size?: 'large' | 'small'
  // 추가 클래스명
  className?: string
  // 클릭 핸들러
  onClick?: () => void
  // 드래그 방지
  draggable?: boolean
}

function PreviewCard({
  nickname,
  metDate,
  farewellDate,
  imageUrl,
  placeholder = '별명을 입력해 주세요.',
  flipable = false,
  isFlipped = false,
  backImageUrl = null,
  size = 'large',
  className = '',
  onClick,
  draggable = true,
}: PreviewCardProps) {
  // 날짜 포맷팅: YYYY-MM-DD -> YYYY.MM.DD
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${year}.${month}.${day}`
  }

  // 날짜 범위 계산:
  // - 둘 다 있으면: "YYYY.MM.DD - YYYY.MM.DD"
  // - metDate만 있으면: "YYYY.MM.DD -" (farewellDate 입력 대기 중)
  // - farewellDate만 있으면: "YYYY.MM.DD"
  const dateRange =
    metDate && farewellDate
      ? `${formatDate(metDate)} - ${formatDate(farewellDate)}`
      : metDate
        ? `${formatDate(metDate)} -`
        : farewellDate
          ? formatDate(farewellDate)
          : ''

  // 카드 내용 렌더링 (앞면)
  const renderFrontContent = () => (
    <>
      {/* 텍스트 요소들을 하나의 wrapper로 묶기 */}
      <div className="preview-card-text-wrapper">
        <span className="preview-from-label">FROM</span>
        <span className="preview-nickname">{nickname || placeholder}</span>
        {dateRange && <span className="preview-date">{dateRange}</span>}
      </div>
/*  const sizeClass = size === 'small' ? 'preview-card--small' : ''

  return (
    <aside
      className={`preview-card ${sizeClass} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="preview-from-label">FROM</span>
      <span className="preview-nickname">{nickname || placeholder}</span>
*/      
      {/* 사진 영역 */}
      <div className="preview-image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview"
            className="preview-image"
            draggable={draggable}
          />
        ) : (
          <div className="preview-image-placeholder">?</div>
        )}
      </div>
    </>
  )

  // 카드 내용 렌더링 (뒷면 - 패턴 이미지 + 텍스트)
  const renderBackContent = () => (
    <>
      {/* 텍스트 요소들을 하나의 wrapper로 묶기 */}
      <div className="preview-card-text-wrapper">
        <span className="preview-from-label">FROM</span>
        <span className="preview-nickname">{nickname || placeholder}</span>
        {dateRange && <span className="preview-date">{dateRange}</span>}
      </div>
      
      {/* 패턴 이미지 영역 */}
      <div className="preview-image-container">
        {backImageUrl ? (
          <img src={backImageUrl} alt="Pattern" className="preview-image" />
        ) : (
          <div className="preview-image-placeholder">패턴 이미지</div>
        )}
      </div>
    </>
  )

  // 플립 가능한 카드
  if (flipable) {
    return (
      <div
        className={`preview-card preview-card--flip-base ${isFlipped ? 'preview-card--flipped' : ''} ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {/* 앞면 */}
        <div className="preview-card-face preview-card-front">
          {renderFrontContent()}
        </div>
        {/* 뒷면 */}
        <div className="preview-card-face preview-card-back">
          {renderBackContent()}
        </div>
      </div>
    )
  }

  // 일반 카드 (기존 동작)
  return (
    <aside className={`preview-card ${className}`}>
      {renderFrontContent()}
    </aside>
  )
}

export default PreviewCard

