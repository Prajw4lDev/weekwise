# Weekwise — Premium Weekly Plan Tracker

Weekwise is a high-performance weekly planning and progress tracking application built for teams that value focus and execution. It helps team leads (Admins) distribute work based on category budgets and empowers members to commit to their weekly goals.

## ✨ Features

- **Dual Roles**: Admin (Team Lead) and Member.
- **Weekly Planning Flow**:
    - **Setup**: Pick team members and define category percentages (Client, Tech Debt, R&D).
    - **Planning**: Members pick items from the backlog and commit to 30 hours of work.
    - **Review & Freeze**: Lead checks the team's commitment against the budget and locks the plan.
    - **Execution**: Members update progress, report hours, and mark tasks as Done or Blocked.
    - **Closure**: Lead finishes the week, archiving results and clearing the board for the next cycle.
- **Premium UI**: Dark glassmorphism theme, micro-animations, and responsive design.
- **Data Portability**: Export and import your team's data as JSON for easy backups.

## 🛠️ Technology Stack

- **Backend**: .NET 8 Web API, Entity Framework Core, SQLite.
- **Frontend**: Angular 17+, RxJS Signals, Vanilla CSS.
- **Tooling**: AutoMapper, JWT Authentication.

## 🚀 Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js & npm](https://nodejs.org/)

### Backend Setup
1. Navigate to the backend directory: `cd backend/src/Weekwise.Api`
2. Update the database (SQLite): `dotnet ef database update`
3. Run the API: `dotnet run`
   - The API will be available at `http://localhost:5000` (or as configured in `appsettings.json`).

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm start`
   - Open your browser at `http://localhost:4200`.

## 🧪 Verification

Run the full backend test suite to ensure system integrity:
```powershell
dotnet test backend/tests/Weekwise.Tests/Weekwise.Tests.csproj
```
