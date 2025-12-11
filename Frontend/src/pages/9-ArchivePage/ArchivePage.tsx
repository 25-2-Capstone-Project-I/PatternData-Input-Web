// 아카이빙 페이지
// - 하단에 카드가 겹쳐서 배치, 중앙 카드가 위로 튀어나옴
// - 좌우 드래그로 스크롤, 양 끝에서 탄성 효과
// - 카드 클릭 시 중앙으로 이동 후 위로 올라오며 다른 카드는 아래로
// - 선택된 카드는 클릭으로 flip 가능
// - downButton 클릭 시 갤러리 뷰로 복귀

import { useEffect, useState } from 'react'
import { API_BASE } from '../../config/api'
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import './ArchivePage.css'
import PreviewCard from '../../components/PreviewCard/PreviewCard'

import downButtonSvg from '../../assets/images/buttons/downButton.svg'

const API_BASE = 'http://127.0.0.1:8000'

// 드래그와 클릭을 구분하기 위한 threshold (px)
const DRAG_THRESHOLD = 10

// 백엔드 Product 모델과 맞춘 타입
type Product = {
  id: number
  item_name: string
  nickname: string
  met_date: string
  farewell_date: string
  barcode: string
  dominant_color: string | null
  palette: string[] | null
  image: string | null
  pattern_image: string | null
  created_at: string
}

type ViewMode = 'gallery' | 'detail'

function ArchivePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false) // 모바일 뷰 감지

  // 갤러리 상태
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null) // 호버된 카드 인덱스
  const [hoverExitingIndex, setHoverExitingIndex] = useState<number | null>(null) // 호버 해제 중인 카드
  const dragStartX = useRef(0)
  const dragStartIndex = useRef(0)
  const hasDragged = useRef(false) // 실제로 드래그가 발생했는지 여부
  const hoverExitTimeoutRef = useRef<number | null>(null) // 호버 해제 타이머

  // 상세 뷰 상태
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isExiting, setIsExiting] = useState(false) // 상세페이지에서 나가는 중
  const [wasHoveredOnClick, setWasHoveredOnClick] = useState(false) // 클릭 시 호버 상태였는지

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 500)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 데이터 로드
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/products/`)
        if (!res.ok) {
          setError(`데이터를 불러오는 중 오류가 발생했습니다. (status: ${res.status})`)
          return
        }
        const data = await res.json()
        setProducts(data)
        // 중앙 인덱스로 초기화
        if (data.length > 0) {
          setCurrentIndex(Math.floor(data.length / 2))
        }
      } catch (err) {
        console.error(err)
        setError('서버와 통신 중 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (hoverExitTimeoutRef.current) {
        clearTimeout(hoverExitTimeoutRef.current)
      }
    }
  }, [])

  const resolveUrl = (path: string | null) => {
    if (!path) return null
    return path.startsWith('http') ? path : `${API_BASE}${path}`
  }

  // 모바일/데스크탑 별 설정값
  const cardGap = isMobile ? 90 : 280 // 카드 간 거리
  const baseYOffset = isMobile ? -100 : 200 // 기본 y 오프셋 (음수 = 위로)
  const hoverLift = isMobile ? 100 : 120 // 호버 시 위로 올라가는 거리
  const yOffsetMultiplier = isMobile ? 6 : 10 // 이차함수 계수 (작을수록 완만)

  // 실시간 인덱스 계산 (드래그 중에도 반영)
  const visualIndex = useMemo(() => {
    if (!isDragging) return currentIndex
    // 드래그 오프셋에 따른 실시간 인덱스 계산
    const indexChange = -dragOffset / cardGap
    let newIndex = currentIndex + indexChange
    // 범위 제한
    if (newIndex < 0) newIndex = 0
    if (newIndex >= products.length) newIndex = products.length - 1
    return newIndex
  }, [currentIndex, dragOffset, isDragging, products.length, cardGap])

  // 카드 외부 스타일 (x축 이동 - 드래그 시 즉시 반응)
  const getCardOuterStyle = (index: number) => {
    const totalOffset = index - visualIndex

    // 좌우 위치 (겹침 효과)
    const xOffset = totalOffset * cardGap

    // z-index (오른쪽이 위로 겹침)
    const zIndex = 50 + Math.round(totalOffset)

    return {
      transform: `translateX(${xOffset}px)`,
      zIndex,
      // 드래그 중에는 transition 없음 (즉시 반응)
      transition: isDragging ? 'none' : 'transform 0.4s ease-out',
    }
  }

  // 카드 내부 스타일 (y축 이동 - 호버 해제 시 부드럽게)
  const getCardInnerStyle = (index: number) => {
    const totalOffset = index - visualIndex
    const absOffset = Math.abs(totalOffset)

    // 중앙에서 멀어질수록 아래로 내려감 (이차함수 - 중앙이 꼭짓점)
    let yOffset = absOffset * absOffset * yOffsetMultiplier + baseYOffset

    // 호버된 카드는 위로 올라옴 (드래그 중이 아닐 때만)
    const isHovered = !isDragging && hoveredIndex === index
    if (isHovered) {
      yOffset -= hoverLift
    }

    // y축은 항상 부드럽게 transition (호버 해제 애니메이션 포함)
    // 단, 드래그 중에 호버 해제가 아닌 카드는 transition 없음
    let transition = 'transform 0.4s ease-out'
    if (isDragging && hoverExitingIndex !== index) {
      transition = 'none'
    }

    return {
      transform: `translateY(${yOffset}px)`,
      transition,
    }
  }

  // 미니맵 바 높이 계산 (실시간 반영)
  const getMiniBarHeight = (index: number) => {
    const offset = Math.abs(index - visualIndex)
    const baseHeight = isMobile ? 20 : 32
    const minHeight = isMobile ? 10 : 16
    const step = isMobile ? 2.5 : 4
    return Math.max(minHeight, baseHeight - offset * step)
  }

  // 미니맵 바 활성화 여부 (실시간 반영)
  const isMiniBarActive = (index: number) => {
    return Math.round(visualIndex) === index
  }

  // 드래그 시작
  const handleDragStart = useCallback((clientX: number) => {
    if (viewMode !== 'gallery') return
    
    // 이전 타이머 정리
    if (hoverExitTimeoutRef.current) {
      clearTimeout(hoverExitTimeoutRef.current)
    }
    
    // 호버 상태가 있으면 호버 해제 애니메이션 트리거
    if (hoveredIndex !== null) {
      setHoverExitingIndex(hoveredIndex)
      setHoveredIndex(null)
      
      // 애니메이션 완료 후 상태 초기화
      hoverExitTimeoutRef.current = window.setTimeout(() => {
        setHoverExitingIndex(null)
      }, 400)
    }
    
    setIsDragging(true)
    dragStartX.current = clientX
    dragStartIndex.current = currentIndex
    hasDragged.current = false
  }, [viewMode, currentIndex, hoveredIndex])

  // 드래그 중
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || viewMode !== 'gallery') return
    const diff = clientX - dragStartX.current
    
    // threshold 이상 이동해야 드래그로 인식
    if (Math.abs(diff) > DRAG_THRESHOLD) {
      hasDragged.current = true
    }
    
    setDragOffset(diff)
  }, [isDragging, viewMode])

  // 드래그 종료
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    
    setIsDragging(false)

    // 드래그 거리에 따라 인덱스 변경
    const indexChange = Math.round(-dragOffset / cardGap)
    let newIndex = dragStartIndex.current + indexChange

    // 범위 제한 (탄성 효과)
    if (newIndex < 0) newIndex = 0
    if (newIndex >= products.length) newIndex = products.length - 1

    setCurrentIndex(newIndex)
    setDragOffset(0)
  }, [isDragging, dragOffset, products.length, cardGap])

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX)
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX)
  const handleMouseUp = () => handleDragEnd()
  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd()
  }

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX)
  const handleTouchEnd = () => handleDragEnd()

  // 카드 클릭
  const handleCardClick = (index: number) => {
    // 드래그 중이거나 실제로 드래그가 발생했으면 클릭 무시
    if (isDragging) return
    if (hasDragged.current) return
    if (isTransitioning) return

    if (viewMode === 'gallery') {
      // 호버 상태였는지 기억 (애니메이션에 사용)
      const wasHovered = hoveredIndex === index
      setWasHoveredOnClick(wasHovered)
      
      // 중앙이 아닌 카드 클릭 시 먼저 중앙으로 이동
      if (index !== currentIndex) {
        setCurrentIndex(index)
        // 약간의 딜레이 후 상세 뷰로 전환
        setIsTransitioning(true)
        setTimeout(() => {
          setSelectedIndex(index)
          setViewMode('detail')
          setHoveredIndex(null)
          setIsTransitioning(false)
        }, 400)
      } else {
        // 중앙 카드 클릭 시 - 갤러리 숨기기 애니메이션 후 상세 뷰로
        setIsTransitioning(true)
        setTimeout(() => {
          setSelectedIndex(index)
          setViewMode('detail')
          setHoveredIndex(null)
          setIsTransitioning(false)
        }, 500) // 갤러리 숨기기 애니메이션 완료 후
      }
    }
  }

  // 상세 뷰에서 카드 클릭 (플립)
  const handleDetailCardClick = () => {
    setIsFlipped((prev) => !prev)
  }

  // 갤러리로 돌아가기
  const handleBackToGallery = () => {
    setIsFlipped(false)
    setIsExiting(true) // exit 애니메이션 시작
    
    // 애니메이션 완료 후 갤러리로 전환
    setTimeout(() => {
      setViewMode('gallery')
      setSelectedIndex(null)
      setIsExiting(false)
      setWasHoveredOnClick(false)
    }, 300) // 애니메이션 시간과 맞춤
  }

  if (loading) {
    return (
      <div className="archive-page-root">
        <div className="archive-loading">불러오는 중입니다...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="archive-page-root">
        <div className="archive-error">{error}</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="archive-page-root">
        <header className="archive-logo">
          <span>woven</span>
          <br />
          <span>memory</span>
        </header>
        <div className="archive-empty">아직 기록된 물건이 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="archive-page-root">
      {/* 로고 */}
      <header className="archive-logo">
        <span>woven</span>
        <br />
        <span>memory</span>
      </header>

      {/* 갤러리 뷰 */}
      <div
        className={`archive-gallery ${viewMode === 'detail' || isTransitioning ? 'archive-gallery--hidden' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="archive-cards-container">
          {products.map((product, index) => {
            const patternUrl = resolveUrl(product.pattern_image)

            return (
              // 외부 wrapper: x축 이동 (드래그 시 즉시 반응)
              <div
                key={product.id}
                className="archive-card-outer"
                style={getCardOuterStyle(index)}
              >
                {/* 내부 wrapper: y축 이동 + 스케일 (호버 해제 시 부드럽게) */}
                <div
                  className={`archive-card-inner ${
                    hoveredIndex === index ? 'archive-card-inner--hovered' : ''
                  }`}
                  style={getCardInnerStyle(index)}
                  onClick={() => handleCardClick(index)}
                  onMouseEnter={() => !isDragging && setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <PreviewCard
                    size="small"
                    nickname={product.nickname}
                    metDate={product.met_date}
                    farewellDate={product.farewell_date}
                    imageUrl={patternUrl}
                    placeholder=""
                    draggable={false}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* 미니맵 바 */}
        <div className="archive-minimap">
          {products.map((_, index) => (
            <div
              key={index}
              className={`archive-minimap-bar ${isMiniBarActive(index) ? 'archive-minimap-bar--active' : ''}`}
              style={{ height: getMiniBarHeight(index) }}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
            />
          ))}
        </div>
      </div>

      {/* 상세 뷰 */}
      {viewMode === 'detail' && selectedIndex !== null && (
        <div className={`archive-detail ${isExiting ? 'archive-detail--exiting' : ''}`}>
          <div
            className={`archive-detail-card-wrapper ${
              isExiting ? 'archive-detail-card-wrapper--exiting' : ''
            } ${wasHoveredOnClick ? 'archive-detail-card-wrapper--from-hover' : ''}`}
            onClick={handleDetailCardClick}
          >
            <div className={`archive-detail-card ${isFlipped ? 'archive-detail-card--flipped' : ''}`}>
              {/* 앞면: 패턴 이미지 */}
              <div className="archive-detail-face archive-detail-front">
                <PreviewCard
                  size="small"
                  nickname={products[selectedIndex].nickname}
                  metDate={products[selectedIndex].met_date}
                  farewellDate={products[selectedIndex].farewell_date}
                  imageUrl={resolveUrl(products[selectedIndex].pattern_image)}
                  placeholder=""
                  className="archive-detail-preview-card"
                />
              </div>

              {/* 뒷면: 물건 사진 */}
              <div className="archive-detail-face archive-detail-back">
                <PreviewCard
                  size="small"
                  nickname={products[selectedIndex].nickname}
                  metDate={products[selectedIndex].met_date}
                  farewellDate={products[selectedIndex].farewell_date}
                  imageUrl={resolveUrl(products[selectedIndex].image)}
                  placeholder=""
                  className="archive-detail-preview-card"
                />
              </div>
            </div>
          </div>

          {/* 내려가기 버튼 */}
          <button
            className={`archive-down-button ${isExiting ? 'archive-down-button--exiting' : ''}`}
            onClick={handleBackToGallery}
            aria-label="갤러리로 돌아가기"
          >
            <img src={downButtonSvg} alt="내려가기" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ArchivePage
