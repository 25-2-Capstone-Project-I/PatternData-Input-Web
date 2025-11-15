import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import InfoFormPage from './pages/InfoFormPage.tsx'
import BarcodePage from './pages/BarcodePage.tsx'

export type ProductFormData = {
  itemName: string
  nickname: string
  date: string        // "YYYY-MM-DD"
  category: string
  description: string
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
    </Routes>
  )
}

export default App
