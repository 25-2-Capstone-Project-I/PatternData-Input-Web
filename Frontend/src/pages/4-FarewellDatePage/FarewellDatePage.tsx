// 물건과 헤어지는 날짜 입력 화면
// - 기본값: 오늘 날짜
// - 오늘 날짜 이후 선택 불가
// - 만난 날짜(metDate)보다 이전 선택 불가
// - date 입력 후 /photo 로 이동

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormPageProps } from '../../App'
import FormPageLayout from '../../components/FormPageLayout/FormPageLayout'
import PreviewCard from '../../components/PreviewCard/PreviewCard'
import FormButton from '../../components/FormButton/FormButton'
import DatePicker from '../../components/DatePicker/DatePicker'
import './FarewellDatePage.css'

function FarewellDatePage({ formData, setFormData }: FormPageProps) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [localFarewellDate, setLocalFarewellDate] = useState(formData.farewellDate)

  // 페이지 진입 시 farewellDate가 비어있으면 오늘 날짜로 초기화
  useEffect(() => {
    if (!formData.farewellDate) {
      const todayStr = new Date().toISOString().slice(0, 10)
      setLocalFarewellDate(todayStr)
      setFormData((prev) => ({
        ...prev,
        farewellDate: todayStr,
      }))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 날짜 포맷팅: YYYY-MM-DD -> YYYY.MM.DD
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${year}.${month}.${day}`
  }

  // 오늘 날짜 (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10)

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    setLocalFarewellDate(date)
    setFormData((prev) => ({ ...prev, farewellDate: date }))
    
    // 선택 직후 유효성 검사
    const validationError = validateDate(date)
    setError(validationError)
    setShowCalendar(false)
  }

  // 날짜 유효성 검사
  const validateDate = (date: string) => {
    if (!date) {
      return '날짜를 선택해 주세요.'
    }

    // 오늘 날짜보다 이후인지 확인
    if (date > todayStr) {
      return '오늘 날짜보다 이후의 날짜예요'
    }

    // 만난 날짜보다 이전인지 확인
    if (formData.metDate && date < formData.metDate) {
      return '만난 날보다 더 이전의 날짜예요'
    }

    return null
  }

  const handleNext = () => {
    const validationError = validateDate(localFarewellDate)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    navigate('/photo')
  }

  // 입력 필드 클릭 시 캘린더 토글
  const handleInputClick = () => {
    setShowCalendar(!showCalendar)
  }

  // 캘린더 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        !target.closest('.date-input-container') &&
        !target.closest('.date-picker')
      ) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

  // 버튼 활성화 조건: 날짜가 선택되어 있고 에러가 없어야 함
  const isButtonEnabled = localFarewellDate && !error

  return (
    <>
      <FormPageLayout activeStep={3}>
        <h1 className="farewell-date-title">오늘, 이 물건과의 작별을 기록해요</h1>
        <p className="farewell-date-description">
          이 날짜는 이 물건을 마음 속에 고이 놓아두는 표시예요
          <br />
          전시 날짜가 기본으로 설정되어 있어요
        </p>

        <div className="farewell-date-form">
          <label htmlFor="farewell-date-input" className="farewell-date-label">
            물건과 헤어지는 날짜
          </label>

          <div className="date-input-container">
            <div
              className={`farewell-date-input ${error ? 'farewell-date-input--error' : ''}`}
              onClick={handleInputClick}
            >
              <span
                className={`farewell-date-input-text ${
                  !localFarewellDate ? 'farewell-date-input-text--placeholder' : ''
                }`}
              >
                {localFarewellDate ? formatDateDisplay(localFarewellDate) : '날짜를 입력해주세요'}
              </span>
              <span className="farewell-date-input-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
                    stroke="rgba(91, 70, 54, 0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            {showCalendar && (
              <div className="date-picker-wrapper">
                <DatePicker
                  selectedDate={localFarewellDate}
                  onSelectDate={handleDateSelect}
                  minDate={formData.metDate} // 만난 날 이후만 선택 가능
                  maxDate={todayStr} // 오늘 이전만 선택 가능
                />
              </div>
            )}
          </div>

          <p className="error-message">{error}</p>

          <FormButton type="button" onClick={handleNext} disabled={!isButtonEnabled}>
        다음으로
          </FormButton>
    </div>
      </FormPageLayout>

      <PreviewCard
        nickname={formData.nickname}
        metDate={formData.metDate}
        farewellDate={localFarewellDate}
        imageUrl={formData.screenshot}
      />
    </>
  )
}

export default FarewellDatePage
