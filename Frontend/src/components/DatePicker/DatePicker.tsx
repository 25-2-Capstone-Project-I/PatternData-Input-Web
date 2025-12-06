// 날짜 선택 캘린더 컴포넌트
// - 현재 날짜 하이라이트
// - 선택한 날짜 원형 표시
// - 월 이동 기능

import { useState } from 'react'
import './DatePicker.css'

type DatePickerProps = {
  selectedDate: string | null // YYYY-MM-DD
  onSelectDate: (date: string) => void // YYYY-MM-DD
  minDate?: string // YYYY-MM-DD
  maxDate?: string // YYYY-MM-DD
}

function DatePicker({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
}: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const date = new Date(selectedDate)
      return new Date(date.getFullYear(), date.getMonth(), 1)
    }
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  // 날짜 포맷팅: YYYY-MM-DD -> YYYY.MM.DD
  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    return `${year}.${month}.${day}`
  }

  // YYYY-MM-DD 형식의 날짜를 Date 객체로 변환
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // 날짜 비교 (YYYY-MM-DD 형식)
  const compareDates = (date1: string, date2: string) => {
    const d1 = parseDate(date1)
    const d2 = parseDate(date2)
    return d1.getTime() - d2.getTime()
  }

  // 현재 월의 첫 날과 마지막 날
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // 월의 첫 번째 날 (일요일 = 0)
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()

  // 월의 마지막 날
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  // 날짜 선택
  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // minDate, maxDate 체크
    if (minDate && compareDates(dateStr, minDate) < 0) return
    if (maxDate && compareDates(dateStr, maxDate) > 0) return

    onSelectDate(dateStr)
  }

  // 날짜가 오늘인지 확인
  const isToday = (day: number) => {
    const date = new Date(year, month, day)
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  // 날짜가 선택된 날짜인지 확인
  const isSelected = (day: number) => {
    if (!selectedDate) return false
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return dateStr === selectedDate
  }

  // 날짜가 비활성화되어야 하는지 확인
  const isDisabled = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (minDate && compareDates(dateStr, minDate) < 0) return true
    if (maxDate && compareDates(dateStr, maxDate) > 0) return true
    return false
  }

  // 캘린더 그리드 생성
  const calendarDays: (number | null)[] = []
  
  // 이전 달의 마지막 날들 (빈 칸)
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // 현재 달의 날들
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const monthNames = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ]

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  return (
    <div className="date-picker">
      <div className="date-picker-header">
        <button
          type="button"
          className="date-picker-nav"
          onClick={goToPreviousMonth}
          aria-label="이전 달"
        >
          ←
        </button>
        <div className="date-picker-month">
          {year}.{String(month + 1).padStart(2, '0')}
        </div>
        <button
          type="button"
          className="date-picker-nav"
          onClick={goToNextMonth}
          aria-label="다음 달"
        >
          →
        </button>
      </div>

      <div className="date-picker-weekdays">
        {weekDays.map((day) => (
          <div key={day} className="date-picker-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="date-picker-grid">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="date-picker-day-empty" />
          }

          const todayClass = isToday(day) ? 'date-picker-day--today' : ''
          const selectedClass = isSelected(day) ? 'date-picker-day--selected' : ''
          const disabledClass = isDisabled(day) ? 'date-picker-day--disabled' : ''

          return (
            <button
              key={day}
              type="button"
              className={`date-picker-day ${todayClass} ${selectedClass} ${disabledClass}`}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled(day)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DatePicker

