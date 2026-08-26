# DocuMind — Frontend (Vite + React)

Tài liệu học tập AI có trích dẫn nguồn.

## Tech stack
- **React 19** + **Vite 5**
- **Material UI (MUI)** + **Emotion**
- **React Router DOM** (routing)
- **Axios** (HTTP client gọi API backend)

## Cấu trúc
```
src/
├── api/              # Lớp gọi API (auth.api.js, …)
├── features/
│   └── auth/         # AuthProvider + useAuth
├── lib/              # http.js (axios client) + routes.js (path constants)
├── pages/            # Mỗi trang = 1 folder gồm <Tên>.jsx + <Tên>.css
│   ├── Homepage/
│   ├── Login/
│   └── Register/
├── App.jsx           # ThemeProvider + routing + AuthProvider
├── main.jsx          # Entry point
└── index.css         # Global styles + Google Fonts
```

## Cài & chạy
```bash
npm install
npm run dev
```

## Env
```bash
cp .env.example .env
# Sửa VITE_API_BASE_URL trỏ về backend
```

## Routes hiện có
- `/` — Homepage (landing)
- `/login` — Đăng nhập
- `/register` — Đăng ký
