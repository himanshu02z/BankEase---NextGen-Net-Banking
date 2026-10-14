# BankEase: NextGen Net Banking

BankEase is a Java 21 / Spring Boot backend with Spring Security, JWT authentication, PostgreSQL persistence, and a React/Vite banking dashboard.

## Implemented demo flows

- Register and sign in using username/password
- Open and view a customer's accounts
- Deposit and withdraw with transaction history
- Transfer between active accounts with sender ownership checks and atomic database updates
- Protected account and transaction APIs using Spring Security's JWT filter chain

The bills, loans, investments, and admin screens are not connected to backend services and are not shown in the current navigation.

## Run locally

1. Start PostgreSQL and create the `bankease` database. Update `backend/src/main/resources/application.properties` with the local database credentials and a private JWT signing key before sharing or deploying the project. PostgreSQL stores users, accounts, balances, and transaction history between app restarts.
   If you already have a database created by an older version, apply `backend/src/main/resources/db/migration/V2__allow_shared_ifsc_codes.sql` once. It removes a stale unique constraint on `accounts.ifsc_code`; IFSC codes are shared by accounts at the same branch.
2. From the project root, start both the backend and frontend together:

   ```sh
   ./start-local.sh
   ```

   Press **Ctrl+C** to stop both services. Run the same command again whenever you return to the project. The database remains intact when the services stop.

   To start either service separately instead:

   ```sh
   cd backend && ./mvnw spring-boot:run
   # In another terminal:
   cd frontend
   npm install
   npm run dev
   ```

3. Open <http://localhost:5173>, sign in, and use **Accounts** to view balances, deposit, or withdraw. Create a second user/account in another browser session to demo transfers.

The frontend calls `http://localhost:8080/api` by default. Set `VITE_API_URL` to change the API base URL.

## API routes

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/users/register` | Public |
| POST | `/api/users/login` | Public |
| GET, POST | `/api/accounts` | JWT required |
| POST | `/api/transactions/deposit/{accountNumber}` | JWT required |
| POST | `/api/transactions/withdraw/{accountNumber}` | JWT required |
| GET | `/api/transactions/{accountNumber}` | JWT required |
| POST | `/api/transactions/transfer/{senderAccountNumber}` | JWT required |

## Build and verify

```sh
cd backend && ./mvnw test
cd ../frontend && npm run build
```
