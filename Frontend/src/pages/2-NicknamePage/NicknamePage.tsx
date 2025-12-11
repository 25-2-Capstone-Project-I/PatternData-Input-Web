// 별명(닉네임) 입력 화면
// - 닉네임 입력
// - 실시간 카드 동기화
// - Django에 중복 체크 요청 (debounce)
// - 통과하면 /met-date 로 이동

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import type { FormPageProps } from '../../App'
import FormPageLayout from '../../components/FormPageLayout/FormPageLayout'
import PreviewCard from '../../components/PreviewCard/PreviewCard'
import FormButton from '../../components/FormButton/FormButton'
import { API_BASE } from '../../config/api'
import './NicknamePage.css'

function NicknamePage({ formData, setFormData }: FormPageProps) {
  const navigate = useNavigate()
  const [localNickname, setLocalNickname] = useState(formData.nickname)
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)

  // 실시간으로 formData 업데이트
  useEffect(() => {
    setFormData((prev) => ({ ...prev, nickname: localNickname }))
  }, [localNickname, setFormData])

  // 중복 체크 함수 (debounce)
  const checkNicknameDuplicate = useCallback(
    async (nickname: string) => {
      if (!nickname.trim()) {
        setError(null)
        setIsDuplicate(false)
        return
      }

      setIsChecking(true)
      try {
        const res = await fetch(
          `${API_BASE}/api/products/check-nickname/?nickname=${encodeURIComponent(
            nickname.trim(),
          )}`,
        )

        if (!res.ok) {
          setError('닉네임 확인 중 오류가 발생했습니다.')
          setIsDuplicate(true)
          return
        }

        const data = await res.json()
        if (data.exists) {
          setError('이미 있는 별명이예요!')
          setIsDuplicate(true)
        } else {
          setError(null)
          setIsDuplicate(false)
        }
      } catch (err) {
        console.error(err)
        setError('서버와 통신 중 문제가 발생했습니다.')
        setIsDuplicate(true)
      } finally {
        setIsChecking(false)
      }
    },
    [],
  )

  // debounce를 위한 useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      checkNicknameDuplicate(localNickname)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [localNickname, checkNicknameDuplicate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const nickname = localNickname.trim()
    if (!nickname) {
      setError('별명을 입력해 주세요.')
      return
    }

    // 중복 체크가 진행 중이거나 중복인 경우 제출 불가
    if (isChecking || isDuplicate) {
      return
    }

    // 최종 확인
    setIsChecking(true)
    try {
      const res = await fetch(
        `${API_BASE}/api/products/check-nickname/?nickname=${encodeURIComponent(
          nickname,
        )}`,
      )

      if (!res.ok) {
        setError('닉네임 확인 중 오류가 발생했습니다.')
        return
      }

      const data = await res.json()
      if (data.exists) {
        setError('이미 있는 별명이예요!')
        setIsDuplicate(true)
        return
      }

      // 닉네임 사용 가능 → 다음 단계로
      navigate('/met-date')
    } catch (err) {
      console.error(err)
      setError('서버와 통신 중 문제가 발생했습니다.')
    } finally {
      setIsChecking(false)
    }
  }

  // 버튼 활성화 조건: 한 글자 이상 입력 && 중복 아님 && 체크 중 아님
  const isButtonEnabled =
    localNickname.trim().length > 0 && !isDuplicate && !isChecking

  return (
    <>
      <FormPageLayout activeStep={1}>
        <h1 className="greeting">안녕하세요!</h1>
        <h2 className="question">
          우리가 당신을 뭐라고 부르면 좋을까요?
        </h2>
        <p className="instruction">
          편하게 불리고 싶은 이름이면 충분해요.
        </p>

        <form onSubmit={handleSubmit} className="nickname-form">
          <label htmlFor="nickname-input" className="nickname-label">
            별명
          </label>
          <input
            id="nickname-input"
            type="text"
            value={localNickname}
            onChange={(e) => {
              setLocalNickname(e.target.value)
              setError(null) // 입력 시 에러 초기화
            }}
            className={`nickname-input ${error ? 'nickname-input--error' : ''}`}
            placeholder="예: 00, 000, 0000"
            autoFocus
          />
          <p className="error-message">{error}</p>

          <FormButton
            type="submit"
            disabled={!isButtonEnabled}
            loading={isChecking}
          >
            다음으로
          </FormButton>
        </form>
      </FormPageLayout>

      <PreviewCard
        nickname={localNickname}
        imageUrl={formData.screenshot}
        placeholder="별명을 입력해 주세요."
      />
    </>
  )
}

export default NicknamePage
