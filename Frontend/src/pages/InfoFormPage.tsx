import React, { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProductFormData } from '../App'

type Props = {
    onNext: (data: ProductFormData) => void
}

function InfoFormPage({ onNext }: Props) {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [error, setError] = useState<string | null>(null)   // 에러 메시지 상태

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        try {
        // 1️⃣ 이름 중복 확인 요청
        const res = await fetch(
            `http://127.0.0.1:8000/api/products/check-name/?name=${encodeURIComponent(
            name,
            )}`,
        )
        const data = await res.json()

        if (data.exists) {
            // 이미 존재하는 이름이면 여기서 막고 문구만 보여줌
            setError('이미 존재하는 이름입니다. 다른 이름을 입력해 주세요.')
            return
        }

        // 2️⃣ 중복 아니면, 다음 페이지로 진행
        onNext({ name, date, category, description })
        navigate('/barcode')
        } catch (err) {
        console.error(err)
        setError('이름 중복 확인 중 오류가 발생했습니다.')
        }
    }

    return (
        <div style={{ maxWidth: 500, margin: '40px auto' }}>
        <h1>물건 정보 입력</h1>
        <form onSubmit={handleSubmit}>
            <div>
            <label>이름</label>
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
            />
            </div>
            <div>
            <label>날짜</label>
            <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
            />
            </div>
            <div>
            <label>카테고리</label>
            <input
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
            />
            </div>
            <div>
            <label>물건 설명</label>
            <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
            />
            </div>

            {error && (
            <p style={{ color: 'red', marginTop: 8 }}>
                {error}
            </p>
            )}

            <button type="submit">다음 (바코드 입력)</button>
        </form>
        </div>
    )
}

export default InfoFormPage