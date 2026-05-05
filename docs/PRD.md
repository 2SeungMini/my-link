# 마이링크(MyLink) 기능 정의서 (PRD)

## 1. 프로젝트 개요
- **프로젝트명**: 마이링크 (MyLink)
- **목적**: 깃허브, 블로그, 포트폴리오, 소셜 미디어 등 다양한 링크를 하나로 통합하여 보여줄 수 있는 멀티 링크 페이지 제공 서비스
- **대상 사용자**: 
  - 여러 개발 관련 링크를 한곳에 모아 관리하고 자신을 브랜딩하려는 **개발자**
  - 다양한 채널 및 창작물을 효과적으로 홍보하고 싶은 **크리에이터**
- **디자인 시스템**: **shadcn/ui**를 도입하여 깔끔하고 일관성 있는 모던 UI 구현

## 2. 기능 상세 설명

**1. 회원 인증 및 관리**
- **구글 소셜 로그인**: **Firebase Authentication**을 이용한 구글 로그인(Google Login) 단일 방식을 제공하여, 불필요한 입력 없이 빠르고 안전한 인증을 지원한다.
- **고유 아이디(URL) 설정**: 최초 로그인 시 자신만의 고유한 마이링크 주소(`mylink.com/@username`)를 설정할 수 있다. (중복 방지 로직 적용)

**2. 프로필 관리**
- **프로필 이미지 업로드**: 방문자에게 보여질 대표 이미지를 업로드하고 수정할 수 있다.
- **사용자 이름 및 소개글**: 본인의 이름(닉네임)과 자신을 소개하는 짧은 텍스트(Bio)를 작성할 수 있다.

**3. 링크 관리**
- **링크 추가**: 제목(Title)과 URL을 입력하여 새로운 링크 버튼을 생성할 수 있다.
- **링크 수정/삭제**: 기존에 작성된 링크의 제목이나 URL을 수정하거나 불필요한 링크를 삭제할 수 있다.
- **파비콘(Favicon) 아이콘 적용**: 추가된 링크 아이템은 해당 URL의 파비콘(Favicon)을 가져와 버튼의 아이콘으로 자동 설정되어 직관적인 디자인을 제공한다.

**4. 마이링크 페이지 제공**
- **퍼블릭 페이지**: 로그인하지 않은 일반 방문자가 `mylink.com/@username`으로 접속했을 때 프로필과 링크 버튼들이 렌더링되어 보여지는 퍼블릭 랜딩 페이지.
- **반응형 디자인**: 모바일 세로 화면에 최적화되면서도 데스크탑/태블릿에서도 어색하지 않게 보이는 UI 제공.

**5. 테마 및 디자인 커스터마이징**
- **shadcn/ui 기반 프리셋**: shadcn/ui 컴포넌트를 활용하여 통일감 있는 디자인을 제공하며, 시스템 설정에 따른 다크 모드/라이트 모드를 지원한다.
- **버튼 스타일링**: 버튼의 형태나 테마 색상 등을 유저가 일부 선택할 수 있도록 옵션을 제공한다.

**6. 소셜 아이콘 링크**
- 일반 텍스트 링크 외에 깃허브, X(트위터), 인스타그램 등 개발자 및 크리에이터들이 주로 사용하는 소셜 아이콘을 별도로 설정하여 배치할 수 있다.

**7. QR 코드 생성**
- 사용자의 고유 마이링크 URL로 연결되는 QR 코드를 이미지 형태로 다운로드할 수 있도록 제공한다.

**8. 방문자 통계 (Analytics) - 추후 2차 업데이트**
- 대시보드를 통해 내 페이지의 '총 방문자 수(Views)'와 '총 클릭 수(Clicks)'를 파악하고, 어떤 링크가 가장 많이 클릭되었는지 분석하는 기능을 지원한다.

---

## 3. 데이터베이스 모델링 (NoSQL - Firestore)

### 3.1. Users Collection

```json
{
  "uid": "google_uid_123",
  "email": "user@example.com",
  "displayName": "caesiumy", // URL Slug (Unique). Init from email prefix.
  "username": "Caesium Y", // 프로필 표시 이름 (Real Name). Init from Google Name.
  "photoURL": "https://lh3.googleusercontent.com/...", // Google 프로필 이미지
  "bio": "Frontend Developer",
  "createdAt": "timestamp"
}
```
*Note: `displayName`의 유일성을 보장하기 위해 별도 인덱스나 로직이 필요함.*

### 3.2. Links Sub-collection (`users/{uid}/links`)

```json
{
  "id": "link_uuid",
  "title": "My Blog",
  "url": "https://blog.example.com",
  "faviconUrl": "https://blog.example.com/favicon.ico", // 앞서 정의된 파비콘 기능
  "createdAt": "timestamp"
}
```
