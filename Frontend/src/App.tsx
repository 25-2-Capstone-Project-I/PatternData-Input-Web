// App 전체 라우팅과 전역 상태를 관리하는 파일
// - 입력 플로우에서 사용할 formData
// - Django에서 생성한 pattern 이미지 URL

import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import WaitPage from './pages/WaitPage'
import NicknamePage from './pages/NicknamePage'
import MetDatePage from './pages/MetDatePage'
import FarewellDatePage from './pages/FarewellDatePage'
import PhotoPage from './pages/PhotoPage'
import BarcodePage from './pages/BarcodePage'
import EndPage from './pages/EndPage'
import ArchivePage from './pages/ArchivePage'

// 사용자가 입력/촬영한 데이터를 모아두는 타입
export type ProductFormData = {
  nickname: string
  metDate: string       // YYYY-MM-DD
  farewellDate: string  // YYYY-MM-DD
  screenshot?: string   // 캡처한 이미지 dataURL
  dominantColor?: string
  palette?: string[]
  barcode?: string
}

// 자식 컴포넌트에서 formData를 수정할 때 쓸 props 타입
export type FormPageProps = {
  formData: ProductFormData
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>
}

function App() {
  // 플로우 전반에서 공유되는 데이터
  const [formData, setFormData] = useState<ProductFormData>({
    nickname: '',
    metDate: '',
    farewellDate: new Date().toISOString().slice(0, 10), // 기본값: 오늘
  })

  // Django에서 패턴 생성 후 돌려준 이미지 URL
  const [patternImageUrl, setPatternImageUrl] = useState<string | null>(null)

  return (
    <Routes>
      {/* 대기 화면: 클릭하면 /nickname 으로 이동 */}
      <Route path="/" element={<WaitPage />} />

      {/* 별명 입력 + 중복 체크 */}
      <Route
        path="/nickname"
        element={<NicknamePage formData={formData} setFormData={setFormData} />}
      />

      {/* 만난 날짜 입력 */}
      <Route
        path="/met-date"
        element={<MetDatePage formData={formData} setFormData={setFormData} />}
      />

      {/* 헤어지는 날짜 입력 */}
      <Route
        path="/farewell-date"
        element={<FarewellDatePage formData={formData} setFormData={setFormData} />}
      />

      {/* 사진 촬영 + 중심 색 추출 */}
      <Route
        path="/photo"
        element={<PhotoPage formData={formData} setFormData={setFormData} />}
      />

      {/* 바코드 입력 + Django 호출 후 패턴 생성 */}
      <Route
        path="/barcode"
        element={
          <BarcodePage
            formData={formData}
            setFormData={setFormData}
            patternImageUrl={patternImageUrl}
            setPatternImageUrl={setPatternImageUrl}
          />
        }
      />

      {/* 종료 화면: 생성된 패턴 이미지 보여주기 */}
      <Route
        path="/end"
        element={<EndPage patternImageUrl={patternImageUrl} />}
      />

      {/* 아카이빙 페이지: 저장된 모든 Product 조회 */}
      <Route path="/archive" element={<ArchivePage />} />
    </Routes>
  )
}

export default App