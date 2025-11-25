import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import InfoFormPage from './pages/InfoFormPage.tsx'
import BarcodePage from './pages/BarcodePage.tsx'
import ArchivePage from './pages/ArchivePage.tsx'

export type ProductFormData = {
  itemName: string
  nickname: string
  metDate: string      // "YYYY-MM-DD"
  farewellDate: string // "YYYY-MM-DD"
}

function App() {
  const [infoData, setInfoData] = useState<ProductFormData | null>(null)

  return (
    <Routes>
      <Route
        path="/"
        element={<InfoFormPage onNext={setInfoData} />}
      />
      <Route
        path="/barcode"
        element={<BarcodePage infoData={infoData} />}
      />
      <Route
        path="/archive"
        element={<ArchivePage />}
      />
    </Routes>
  )
}

export default App