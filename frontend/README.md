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
The frontend talks to the Spring Boot backend (JWT auth). API helpers are in `src/services/api.js` and default to
`http://localhost:8080/api`. To change it, create `.env`:
```env
VITE_API_URL=http://localhost:8080/api
```

Start the backend first (`cd backend && ./mvnw spring-boot:run`), then register a user from the login page and sign in.
