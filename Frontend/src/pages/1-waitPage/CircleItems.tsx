// src/pages/1-WaitPage/CircleItems.tsx

import './WaitPage.css'

function CircleItems() {
  return (
    <div className="circle-rotation">
      {/* 큰 원 PNG */}
      <img
        src="/items/big-circle.png"
        alt="큰 원형 오브제들"
        className="circle-ring circle-ring--big"
      />

      {/* 작은 원 PNG */}
      <img
        src="/items/small-circle.png"
        alt="작은 원형 오브제들"
        className="circle-ring circle-ring--small"
      />
    </div>
  )
}

export default CircleItems
