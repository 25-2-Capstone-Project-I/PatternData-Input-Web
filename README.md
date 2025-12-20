# Woven Memory — PatternData-Input-Web

**Woven Memory**는 '사소하지만 나에게 중요했던 사물'과의 이별 과정을 **입력 → 패턴 생성 → 아카이빙**으로 의례화한 인터랙티브 설치 작품입니다.  
관람객은 별명/날짜/사진/바코드 정보를 입력하고, 입력 데이터(바코드 + 이미지 색상)를 기반으로 **디지털 직조 패턴(PNG)** 을 생성해 결과물을 확인합니다.

- **프로젝트 목표**: 사물에 대한 기억을 바코드(정체성)와 직조(구조)의 결합으로 일종의 **'의례'** 로써 받아들이게 하기 위하여 재해석하고, 새로운 형태의 "기억의 보존" 방식을 제안
- **이 레포지토리 역할**: 전시 체험 플로우 중 **웹 입력/패턴 생성/웹 아카이빙**을 담당

## 팀 (흑백 줄무늬 연구소)

- 이윤지: PM, 기획 총괄, 웹 UI 디자인, 패턴 생성 알고리즘 구현
- 김도연: 웹 시스템 설계 및 프론트/백엔드 개발, 패턴 알고리즘 통합
- 주내언: 웹 UI 디자인, 포스터 제작
- 차예은: 영상 제작, 포스터 제작
- 최순영: 영상 제작, 포스터 제작

## 링크

- **작품 소개 영상**: [YouTube](https://youtu.be/RIK7kEc0yDw)
- **GitHub**: [PatternData-Input-Web](https://github.com/25-2-Capstone-Project-I/PatternData-Input-Web)

## 작품/전시 컨셉

현대 소비문화에서 물건은 빠르게 소유되고 버려지지만, 정서적 애착, 책임감 등으로 인해 쉽게 처분하지 못하는 경우가 많습니다.  
본 프로젝트 「Woven Memory」는 추억이 담겨있지만 더 이상 소유하지 않아도 되는 사적인 물건을 디지털 직조 패턴으로 재해석하고, 이를 오브제와 웹 아카이빙으로 남기는 인터렉티브 설치 작품입니다.  
Woven Memory는 이러한 **'물건과의 작별'** 을 단계적 체험으로 구성하고, 입력된 데이터를 기반으로 개별 고유의 직조 패턴을 생성하여 기억을 새로운 형태로 남기는 경험을 제공합니다.

## 체험 플로우
1. **입장 및 안내 확인**
2. **물건 정보 입력**
   - 별명(아카이빙 식별용, 중복 확인)
   - 만난 날짜 / 헤어지는 날짜
   - 물건 사진(웹캠 캡처 또는 업로드)
   - 바코드 번호(바코드 리더기 스캔)
3. **물건 정보 기반 애니메이션**
4. **패턴 생성 및 결과 확인**
5. **웹 아카이빙(목록 조회)**

## 주요 기능
<img width="6448" height="6519" alt="readme" src="https://github.com/user-attachments/assets/ff5028b8-ec31-4482-9dde-ce4e4d0c2469" />

- **닉네임 중복 확인**: 동일 별명으로 저장되는 것을 방지
- **제품 정보 저장**: SQLite 기반으로 입력 데이터 저장
- **패턴 이미지 생성**:
  - 13자리 바코드를 3자리씩 4그룹으로 파싱해 2×2 패턴 조합 생성
  - 상단(1,2사분면): 바코드 마지막 자리(color index) 기반 색 적용
  - 하단(3,4사분면): 사진에서 추출한 대표색(`dominant_color`) 적용
- **결과물 제공**: 생성된 패턴 이미지를 서버에 저장하고 URL로 반환
- **아카이브 페이지**: 저장된 데이터 목록 조회

## 기술 스택

- **Frontend**: React, TypeScript, Vite, react-router-dom, react-webcam
- **Backend**: Django, Django REST Framework, django-cors-headers
- **Pattern**: Pillow(PIL), NumPy
- **DB/Storage**: SQLite3, Django `MEDIA_ROOT`

## 시스템 구성(개발 기본값)

- **Frontend**: `http://localhost:5173`
- **Backend(API)**: `http://127.0.0.1:8000`
- **CORS**: 백엔드에서 `http://localhost:5173` 허용(`Backend/config/settings.py`)

## API (Backend)

Base URL: `http://127.0.0.1:8000/api`

- **제품 목록 조회/생성**
  - `GET /products/`
  - `POST /products/`
- **닉네임 중복 확인**
  - `GET /products/check-nickname/?nickname=...`
  - Response: `{ "exists": true | false }`
- **제품 생성 + 패턴 생성까지 한 번에**
  - `POST /products/create-with-pattern/`
  - `multipart/form-data` 권장 필드:
    - `item_name`, `nickname`, `met_date`, `farewell_date`, `barcode`
    - `dominant_color` (예: `#aabbcc`, 선택)
    - `image` (파일, 선택)
  - Response(예): `{ "id": 1, "pattern_image_url": "/media/pattern_outputs/..." }`

## 로컬 실행 방법

### 1) Backend (Django)

```bash
cd Backend

# (권장) 가상환경
py -m venv .venv
.venv\Scripts\activate

# 필수 의존성 설치
pip install django djangorestframework django-cors-headers pillow numpy

# 마이그레이션 & 서버 실행
py manage.py migrate
py manage.py runserver
```

### 2) Frontend (Vite)

```bash
cd Frontend
npm install
npm run dev
```

### 3) 전시장(고정 IP)로 API 주소 변경

프론트 API 베이스는 `Frontend/src/config/api.ts`에서 관리합니다.

## 전시용 운영 모드: 자동 이미지 프린트(Windows)

전시에서는 브라우저에서 "대화상자 없이" 직접 프린트하는 방식 대신, **전시장 PC(로컬)가 특정 폴더를 감시하다가 새로 생성된 패턴 PNG를 자동으로 프린터에 전송**하는 방식으로 운영할 수 있습니다.  
웹은 보안상 무대화면 없이 자동 프린트가 사실상 불가능하기 때문에, 로컬 프로그램이 프린터를 직접 제어하는 구조를 사용합니다.

### 운영 구조

- **Backend**: 패턴 생성 후 `Backend/media/pattern_outputs/`에 이미지 저장
- **Auto Print(로컬 스크립트)**: 위 폴더를 감시 → 새 PNG 감지 → 기본 프린터로 자동 출력

### 0) 사전 준비

- Windows에서 **프린터 드라이버 설치** 및 **기본 프린터(Default Printer)** 설정
- Python 3.x 설치

### 1) 자동 프린트 스크립트 설치

```bash
# 프로젝트 루트에서
py -m venv .venv-print
.venv-print\Scripts\activate

pip install watchdog pywin32 pillow
```

### 2) 자동 프린트 실행

기본 감시 폴더는 백엔드 media 하위 패턴 출력물 폴더를 권장합니다:

- 감시 폴더(권장): `Backend\media\pattern_outputs`

실행:

```bash
py tools\auto_print\auto_print.py --watch "Backend\media\pattern_outputs"
```

### 3) 시작프로그램 등록

전시 PC 부팅 시 자동으로 감시 스크립트가 실행되게 등록
- 작업 스케줄러(Task Scheduler)에서 "로그온 시 실행"으로 등록

## 폴더 구조(핵심만)

- `Frontend/`: 입력 UI + 아카이브 UI (Vite)
  - `src/pages/`: 단계별 입력 플로우 페이지
  - `src/config/api.ts`: API Base URL
- `Backend/`: Django REST API + 패턴 생성
  - `items/`: Product 모델/시리얼라이저/뷰/API 라우팅
  - `items/pattern_logic/`: 바코드 기반 패턴 생성 로직 및 템플릿 PNG(`mnt_project/`)
  - `media/`: 업로드 이미지 및 생성된 패턴 이미지 저장
