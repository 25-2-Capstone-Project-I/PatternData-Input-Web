// 폼 페이지 공통 버튼 컴포넌트
// - 활성화/비활성화 상태
// - 로딩 상태
// - 여러 페이지에서 재사용

import './FormButton.css'

type FormButtonProps = {
  children: React.ReactNode
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}

function FormButton({
  children,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}: FormButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      className={`form-button ${isDisabled ? 'form-button--disabled' : 'form-button--enabled'} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
    >
      {loading ? '처리 중...' : children}
    </button>
  )
}

export default FormButton

