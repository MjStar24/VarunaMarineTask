# FuelEU Maritime Compliance Platform

A full-stack implementation of the FuelEU Maritime regulation (EU 2023/1805). This platform handles GHG intensity calculations, compliance balance (CB) management, banking operations, and pooling between ships.

## 🏗️ Architecture
The project follows **Hexagonal Architecture** (Ports & Adapters) to ensure domain logic remains decoupled from external frameworks.

- **Core (Domain/Application):** Pure TypeScript logic for CB calculations and Article 21 pooling algorithms.
- **Adapters (Inbound):** Express endpoints handles HTTP requests and maps them to application use cases.
- **Adapters (Outbound):** Prisma repositories managing PostgreSQL persistence.
- **Frontend:** React + TypeScript + Tailwind CSS with a dashboard focused on data visualization and accessibility.

## 🚀 Quick Start

### Prerequisites
- Node.js & npm
- PostgreSQL instance running

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env`: `DATABASE_URL="postgresql://user:pass@localhost:5432/fueleu"`
4. `npm run prisma:push`
5. `npm run seed`
6. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 🧪 Testing
- **Unit Tests:** `npm run test` (covers domain math and use cases)
- **Integration Tests:** Verifies all HTTP endpoints using Supertest.

## 📡 API Reference

### Routes
- `GET /routes` - Fetch all vessel routes.
- `POST /routes/:id/baseline` - Set a specific route as the reference baseline.
- `GET /routes/comparison` - Get comparison data between baseline and other routes.

### Compliance & Banking
- `GET /compliance/cb?shipId&year` - Get computed CB for a ship.
- `POST /banking/bank` - Bank a positive CB surplus.
- `POST /banking/apply` - Apply banked surplus to a deficit.
- `GET /banking/records?shipId&year` - Fetch banking history for a ship.

### Pooling
- `POST /pools` - Create a compliance pool and allocate surpluses using the greedy algorithm.
