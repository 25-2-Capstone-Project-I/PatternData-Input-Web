// 폼 페이지 공통 레이아웃 컴포넌트
// - 좌측 사이드바 + 메인 콘텐츠 영역
// - 우측 PreviewCard는 별도로 배치

import { ReactNode } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import './FormPageLayout.css'

type Step = 1 | 2 | 3 | 4 | 5 | 6

type FormPageLayoutProps = {
  activeStep: Step
  children: ReactNode
}

function FormPageLayout({ activeStep, children }: FormPageLayoutProps) {
  return (
    <div className="form-page">
      <div className="form-page-container">
        <Sidebar activeStep={activeStep} />
        <main className="main-content">
          <div className="content-frame">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default FormPageLayout

