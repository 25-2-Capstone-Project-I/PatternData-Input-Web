// 물건과 처음 만난 날짜 입력 화면
// - 캘린더로 날짜 선택
// - 오늘 날짜 이후 선택 시 에러
// - 다음 버튼으로 /farewell-date 이동

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormPageProps } from '../../App'
import FormPageLayout from '../../components/FormPageLayout/FormPageLayout'
import PreviewCard from '../../components/PreviewCard/PreviewCard'
import FormButton from '../../components/FormButton/FormButton'
import DatePicker from '../../components/DatePicker/DatePicker'
import './MetDatePage.css'

function MetDatePage({ formData, setFormData }: FormPageProps) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [localMetDate, setLocalMetDate] = useState(formData.metDate)

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
    setLocalMetDate(date)
    setFormData((prev) => ({ ...prev, metDate: date }))
    setError(null)
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

    return null
  }

  const handleNext = () => {
    const validationError = validateDate(localMetDate)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    navigate('/farewell-date')
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
  const isButtonEnabled = localMetDate && !error

  return (
    <>
      <FormPageLayout activeStep={2}>
        <h1 className="met-date-title">이 물건을 처음 만난 날을 떠올려요</h1>
        <p className="met-date-description">
          정확하지 않아도 괜찮아요, 떠오르는 시절을 선택해도 좋아요
          <br />
          대략적인 기억도 이 여정의 일부예요
        </p>

        <div className="met-date-form">
          <label htmlFor="met-date-input" className="met-date-label">
            물건을 만난 날짜
          </label>

          <div className="date-input-container">
            <div
              className={`met-date-input ${error ? 'met-date-input--error' : ''}`}
              onClick={handleInputClick}
            >
              <span
                className={`met-date-input-text ${
                  !localMetDate ? 'met-date-input-text--placeholder' : ''
                }`}
              >
                {localMetDate ? formatDateDisplay(localMetDate) : '날짜를 입력해주세요'}
              </span>
              <span className="met-date-input-icon">
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
                  selectedDate={localMetDate}
                  onSelectDate={handleDateSelect}
                  maxDate={todayStr}
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
        metDate={localMetDate}
        imageUrl={formData.screenshot}
      />
    </>
  )
}

export default MetDatePage
