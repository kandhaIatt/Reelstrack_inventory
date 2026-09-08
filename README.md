# ReelTrack — Reel Inventory & Purchase Orders System

A production-ready enterprise full-stack web application built with **React.js** frontend and **Java Spring Boot 3** backend.

---

## Tech Stack & Architecture

- **Frontend**: React 18, Vite, React Router DOM v6, Axios, Lucide React Icons, Vanilla CSS with custom glassmorphism design system.
- **Backend**: Java 25+, Spring Boot 3.2, Spring Security with JWT Authentication, Spring Data JPA, MySQL, Validation.
- **Security**: BCrypt password hashing, stateless JWT tokens, Role-Based Access Control (`ADMIN`, `OPERATOR`).

---

## Quick Start (Running Locally)

### Option 1: Unified Windows Launcher
Double-click `run.bat` in the project root directory, or run:
```cmd
run.bat
```

### Option 2: Manual Start

Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` before starting the backend. The default database is `reeltrackdb` on local MySQL.

Required database values:

- `DB_URL`: JDBC URL, including host, port, and database name. Default: `jdbc:mysql://localhost:3306/reeltrackdb?...`.
- `DB_USERNAME`: MySQL account name. Default: `root`.
- `DB_PASSWORD`: MySQL account password. No password is stored in the repository; this value must be supplied in the shell or deployment secret store.
- `JWT_SECRET`: signing secret for access tokens. A development fallback exists, but production deployments should provide their own secret.

1. **Start Backend (Java Spring Boot)**:
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
   *Backend will run on http://localhost:8080*

2. **Start Frontend (React + Vite)**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Frontend will run on http://localhost:5173*

---

## Pre-seeded Credentials

| Role | Username | Password | Access Scope |
|---|---|---|---|
| **Admin** | `admin` | `password123` | All 6 Units, Procurement, Approvals, PO Reports, Masters |
| **Operator (Chennai)** | `operator` | `password123` | Chennai Unit (U1) inventory & cutting jobs |
| **Operator (Bangalore)** | `operator_blr` | `password123` | Bangalore Unit (U2) inventory & cutting jobs |

---

## Key Features

1. **JWT Authentication & Role Control**:
   - Secure login with JWT token persistence in `localStorage`.
   - Role-based navigation & API protection (Admin vs Unit Operator).
2. **Dashboard & Analytics**:
   - Live summary metrics (Total Reels, Total Weight, Available Weight, Active Jobs, Pending POs).
   - Stock utilisation bar charts, unit-wise consumption breakdown, and activity log.
3. **Reel Inventory Management**:
   - Search & multi-filter inventory (Unit, Mill, Reel Type, Width, Status).
   - Table and Grid card view toggle.
   - Reel detail page with remaining weight visualizer, full job history, and transfer records.
4. **Interactive Cut Calculation & Intelligent Recommendation Engine**:
   - Live calculation formula:
     $$\text{Effective GSM} = \text{corr} ? \text{GSM} \times (1 + f) : \text{GSM}$$
     $$\text{kg} = \frac{\text{sheets} \times \text{Effective GSM} \times (\text{width} / 100) \times (\text{length} / 100)}{1000}$$
   - **Recommendation Modal**: Ranks available reels by exact GSM match, minimum slitting trim waste, and finishing partial reels first.
   - **Multi-Reel Split Planner**: Automatically divides jobs across multiple candidate reels when a single reel lacks sufficient stock!
5. **Purchase Order Lifecycle**:
   - PO creation with line items, multi-reel specification, rate per kg, subtotal & 18% GST calculation.
   - Approval workflow (Admin).
   - **Reel Receiving**: Captures actual reel weight & details, auto-generates reel numbers (e.g. `R-21079`), updates inventory and sets PO status to `Partially Received` / `Completed`.
6. **Inter-Unit Transfers**:
   - Transfer reels between manufacturing units with reference tracking and notes.
