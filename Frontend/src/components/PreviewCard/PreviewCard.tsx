// 우측 카드 프리뷰 컴포넌트
// - 닉네임, 날짜, 이미지 등을 실시간으로 보여주는 카드
// - 여러 페이지에서 재사용

import './PreviewCard.css'

type PreviewCardProps = {
  nickname?: string
  metDate?: string
  farewellDate?: string
  imageUrl?: string | null
  placeholder?: string
}

function PreviewCard({
  nickname,
  metDate,
  farewellDate,
  imageUrl,
  placeholder = '별명을 입력해 주세요.',
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

  return (
    <aside className="preview-card">
      <span className="preview-from-label">FROM</span>
      <span className="preview-nickname">{nickname || placeholder}</span>
      
      {/* 사진 영역 - 항상 표시 */}
      <div className="preview-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt="Preview" className="preview-image" />
        ) : (
          <div className="preview-image-placeholder">?</div>
        )}
      </div>

      {/* 날짜 - 맨 아래 오른쪽 정렬 */}
      {dateRange && <span className="preview-date">{dateRange}</span>}
    </aside>
  )
}

export default PreviewCard

