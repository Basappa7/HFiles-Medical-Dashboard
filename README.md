# HFiles Medical Dashboard 
 
A secure medical record management system. 
 
## Features 
- User Authentication (Signup/Login) 
- Profile Management with Image Upload 
- Medical Records Upload (PDF, JPG, PNG) 
- View and Download Documents 
- Soft Delete for Compliance 
- Responsive Design 
 
## Tech Stack 
- **Frontend:** Next.js, TypeScript, Tailwind CSS 
- **Backend:** ASP.NET Core 8, Entity Framework Core 
- **Database:** SQL Server 
 
## Quick Start 
 
### Backend 
```bash 
cd backend 
dotnet restore 
dotnet ef database update 
dotnet run 
``` 
 
### Frontend 
```bash 
cd frontend 
npm install 
npm run dev 
``` 
 
## Environment Variables 
Create `.env.local` in frontend folder: 
``` 
NEXT_PUBLIC_API_URL=https://localhost:7027 
``` 
 
## Author 
Basappa7 
