# Beyond The Color

남아·여아 라벨 대신 아이의 하루와 필요로 아동복을 찾아보는 캠페인 사이트입니다.
숙명여자대학교 홍보광고학과 ‘광고와 대중문화’ 8조 8alette 프로젝트.

## 구조
- `index.html` / `404.html` — 같은 앱 셸 (경로는 `app.js`가 처리)
- `app.js` — 화면, 조건 일치 계산, 비교함, 옷장 카드(이미지 저장·링크 복사)
- `products.js` — 7개 브랜드 103벌 상품 데이터 (기준일 2026-11-22)
- `styles.css` — 데스크톱/모바일 반응형 스타일
- `img/` — 상품 참고 이미지(AI 재현), 장식 이미지
- `fonts/` — Pretendard, Henny Penny, Instrument Serif (자체 호스팅)
- `vercel.json` — 경로 rewrite, 이미지 캐시

빌드 과정 없는 정적 사이트입니다. Vercel에서 Framework Preset은 **Other**, Build Command는 비워 두면 됩니다.
접속 기록은 Vercel 프로젝트의 **Analytics** 탭에서 Web Analytics를 켜면 수집됩니다(스크립트는 이미 포함).

## 로컬 미리보기
```
python3 -m http.server 8000
```
(새로고침 시 하위 경로가 열리려면 Vercel 배포 또는 SPA 대응 서버가 필요합니다.)
