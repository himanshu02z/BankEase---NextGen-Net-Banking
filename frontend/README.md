# BankEase Frontend

React + Vite frontend for the BankEase NextGen Net Banking project.

## Requirements
- Node.js 18+
- npm

## Run
```bash
npm install
npm run dev
```
Open the URL printed by Vite, normally http://localhost:5173.

## Backend connection
The frontend is currently in demo mode for UI development. API helpers are in `src/services/api.js` and default to:
`http://localhost:8080/api`

To change it, create `.env`:
```env
VITE_API_URL=http://localhost:8080/api
```

## Demo login
Any valid email/password works in the current UI demo. Replace `AuthContext.jsx` login logic with the Spring Boot JWT API when the backend is ready.
