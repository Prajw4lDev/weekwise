# 🗓️ WeekWise — Premium Weekly Plan Tracker

**Live Site:** [https://weekwise-api-prajwal.azurewebsites.net](https://weekwise-api-prajwal.azurewebsites.net)

Weekwise is a state-of-the-art, high-performance weekly planning and progress tracking application. Designed for elite engineering teams, it balances administrative control with developer commitment, ensuring every hour counts.

---

## 🌟 Key Features

### 🔐 Multi-Role Orchestration
- **Admin (Team Lead)**: 
  - Define the squad for the current week.
  - Set strategic category budgets (**Client**, **Tech Debt**, **R&D**).
  - Review team commitments against the split.
  - **Freeze** the plan to lock the mission.
- **Member**:
  - Browse the backlog and commit to **30 hours** of high-impact work.
  - Update real-time progress with notes and status tracking.
  - Handle over-hours with automatic warnings.

### 🎭 Premium UI/UX
- **Aesthetic**: Modern dark glassmorphism with smooth CSS transitions.
- **Dynamic Charts**: Real-time progress visualization using `ng2-charts` and `Chart.js`.
- **Responsive**: Fully fluid layout that feels premium on all screen sizes.

### 📊 Seeded "Dream Team"
The system comes pre-populated with a permanent elite team:
- **Prajwal Dinde** (Lead Admin) 👑
- **Ajay more** (Member)
- **Om Patil** (Member)
- **Yash Gaikwad** (Member)
- **Jay Sharma** (Member)

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Angular 18+, RxJS Signals, Vanilla CSS |
| **Backend** | .NET 8 Web API, EF Core |
| **Database** | SQLite (Persisted `weekwise.db`) |
| **Auth** | JWT Bearer Tokens & BCrypt Hashing |
| **Visuals** | Chart.js with `ng2-charts` |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)

### 1. Backend API
```powershell
cd backend/src/Weekwise.Api
dotnet build
dotnet run
```
- API Endpoint: `http://localhost:5066`
- Swagger UI: `http://localhost:5066/swagger`

### 2. Frontend App
```powershell
cd frontend
npm install
npm start
```
- URL: `http://localhost:4200`

---

## 🔑 Default Credentials

Use these credentials to access the system:

| Role | Username (Email) | Password |
| :--- | :--- | :--- |
| **Admin (Prajwal)** | `lead@gmail.com` | `lead` |
| **Member (Ajay)** | `ajay@gmail.com` | `ajay123` |

---

## 📦 Full-Stack Deployment

To run WeekWise as a unified project where the .NET API serves the Angular frontend:

1. **Build Frontend**:
   ```powershell
   cd frontend
   ng build --configuration production
   ```
2. **Setup Backend**:
   Copy the contents of `frontend/dist/weekwise-frontend/browser/` to `backend/src/Weekwise.Api/wwwroot/`.
3. **Publish Backend**:
   ```powershell
   cd backend/src/Weekwise.Api
   dotnet publish -c Release
   ```
4. **Run**:
   Navigate to the publish folder and run `Weekwise.Api.exe`. The app will be available on port 5000/5066 serving both API and UI.

---

## 📁 Project Structure

```text
weekwise/
├── frontend/               # Angular SPA
│   ├── src/app/pages/      # Feature modules (Dashboard, Planning, etc.)
│   └── src/environments/   # Config (Dev vs Prod API)
├── backend/
│   ├── src/Weekwise.Core/  # Entities, Interfaces, DTOs
│   ├── src/Weekwise.Infra/ # DB Context, Repositories, Services
│   └── src/Weekwise.Api/   # Controllers and Entry Point
└── README.md
```

---

## 🧪 Testing

Maintain system integrity by running the suite:
```powershell
dotnet test backend/tests/Weekwise.Tests/Weekwise.Tests.csproj
```

---

> [!TIP]
> **Pro Tip**: If the frontend doesn't show your latest names, clear your `localStorage` or run the backend to trigger a fresh SQLite database seed.
