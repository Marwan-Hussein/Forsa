<div align="center">

![Forsa Logo](GithubAssets/ForsaLogo.png)

![Forsa](https://img.shields.io/badge/Forsa-Event_Management-blue?style=for-the-badge)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![License](https://img.shields.io/badge/License-LGPL--2.1-green?style=for-the-badge)](LICENSE)

**A full-stack web application designed to simplify event management by connecting Organizers, Venue Owners, and Attendees in one unified platform.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Contributions](#-contributions)

</div>

---

## 📌 Overview

**Forsa** provides a centralized system focusing on **performance, scalability, and user experience**, enabling seamless event creation, booking, and management where:

- 🧑‍💼 **Organizers** can create and manage events easily
- 🏢 **Venue Owners** can list and control their venues
- 🎟️ **Attendees** can explore and book events easily

---

## ✨ Features

### 😶‍🌫️ Guest
- ✅ Browse available events

### 👤 Attendee
- ✅ Browse available events
- ✅ Book tickets with secure payment gateway (PayMob)
- ✅ Rate and review events
- ✅ **Guarantees:** Easy and fast booking experience, accurate and updated event information, secure data handling

### 🧑‍💼 Organizer
- ✅ Create and manage events
- ✅ Monitor bookings and attendees
- ✅ Update event details
- ✅ Google Calendar integration for scheduling
- ✅ **Guarantees:** Efficient event management tools, real-time updates, reliable attendee tracking

### 🏢 Venue Owner
- ✅ List venues and availability
- ✅ Handle booking requests
- ✅ Manage schedules
- ✅ **Guarantees:** Clear booking workflow, optimized scheduling system, increased exposure for venues

---

## 🏗️ Architecture

The solution follows a **Clean Architecture** pattern with clear separation of concerns:
- **Domain:** Core entities and interfaces
- **Application:** Business logic, use cases, and service interfaces
- **Infrastructure:** Data access (Entity Framework Core), external services (Google Calendar, PayMob, LLM, Email, OTP)
- **Frontend:** React/TypeScript web application using Tailwind CSS
- **API:** RESTful API Backend (.NET Web API)

---

## 🛠️ Tech Stack

### Backend
- **Framework**: .NET Web API
- **Architecture**: Clean Architecture
- **ORM**: Entity Framework Core
- **Database**: SQL (Relational Database)
- **Caching**: Redis
- **Real-time**: SignalR for Notification Service

### Frontend
- **Framework**: React / TypeScript
- **Styling**: Tailwind CSS

### Third-Party Integrations
- **Payment**: PayMob
- **Authentication**: Google OAuth & JWT
- **Calendar**: Google Calendar API
- **AI/LLM**: LLM integration
- **Email**: SMTP Email Services

### Required Settings (appsettings.json):
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=server-name;Database=dbName;Trusted_Connection=True; TrustServerCertificate=True;",
    "Redis": "localhost:6379"
  },
  "JwtSettings": {
    "Key": "your-256-bit-secret-key",
    "Issuer": "https://localhost:5000",
    "Audience": "https://localhost:5173",
    "JWTDurationInMinutes": 60,
    "RefreshTokenDurationInDays": 7
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": 587,
    "SenderEmail": "your-email",
    "SenderName": "sender-name",
    "Password": "your-password",
    "UseSsl": false
  },
  "Authentication": {
    "Google": {
      "GoogleId": "[google-id].apps.googleusercontent.com",
      "GoogleSecret": "google-secret-key"
    }
  },
  "GoogleCalendar": {
    "ServiceAccountKeyPath": "path-to-yout-serviceAccountKeyFile.json",
    "ApplicationName": "Your-Application-Name",
    "CalendarId": "primary"
  },
  "LLM": {
    "ModelId": "used-model-Id",
    "APIKey": "your-LLM-APIKey"
  },
  "PaymentGateway": {
    "PayMob": {
      "PublicKey": "your-public-key",
      "SecretKey": "your-secret-key",
      "APIKey": "your-API-key",
      "HMAC": "HMAC",
      "IntegrationID": {
        "OnlineCard": "your-id"
      }
    }
  }
}
```

---

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- SQL Server
- Redis Server
- Node.js & npm (for Frontend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Forsa
   ```

2. **Backend Setup**
   - Restore dependencies for all projects:
     ```bash
     dotnet restore Domain/Domain.csproj
     dotnet restore Application/Application.csproj
     dotnet restore Infrastructure/Infrastructure.csproj
     dotnet restore Forsa/Forsa.csproj
     ```
   - Update `Forsa/appsettings.json` with your connection strings, JWT settings, Google OAuth, Google Calendar, PayMob, and LLM credentials.
   - Run EF Core migrations:
     ```bash
     dotnet ef database update
     ```
   - Run the API:
     ```bash
     cd Forsa
     dotnet run
     ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

---

## 🤝 Contributions

| Contributor | LinkedIn | Tasks and Lifecycles |
| :---: | :---: | --- |
| <a href="https://github.com/Marwan-Hussein"><img src="https://github.com/Marwan-Hussein.png" width="60px;" alt="Marwan Hussein"/><br /><sub><b>Marwan Hussein</b></sub></a> | [LinkedIn](https://linkedin.com/in/marwanhussein9) | - Email Services<br> - Redis Basing<br> - Notification Service \[SignalR\] - OTP Service<br>- Admin Reports<br>- Event Services \[EvaluateEventStatus, DeductTicketInventory, ReleaseTicketInventory\]<br>- Google Calendar Integration<br>- Graphic Design \[Logo, 404 Page, Loader, AI chatbot, UI Touches\]<br> |
| <a href="https://github.com/Marria-m"><img src="https://github.com/Marria-m.png" width="60px;" alt="Mariam Ehab"/><br /><sub><b>Mariam Ehab</b></sub></a> | [LinkedIn](https://www.linkedin.com/in/mariamehab1305) | - Tas1<br>- Task2<br>- Task3<br> |
| <a href="https://github.com/kotbb"><img src="https://github.com/kotbb.png" width="60px;" alt="Mohamed Kotb"/><br /><sub><b>Mohamed Kotb</b></sub></a> | [LinkedIn](https://www.linkedin.com/in/mohamedkotbb) | - Attendee Profile & Interests & Booking Lifecycle<br>- Attendee Feedback Submit & Rating System<br>- Place Booking Request & Availability Management<br>- Admin Event Management Endpoints<br>- Refresh Token Authentication<br>- Google Maps Integration<br>- Help in Payment Integration & Frontend<br>- Integration testing for the whole system to fix bugs<br> |
| <a href="https://github.com/Nagy101"><img src="https://github.com/Nagy101.png" width="60px;" alt="Mohamed Nagy"/><br /><sub><b>Mohamed Nagy</b></sub></a> | [LinkedIn](https://www.linkedin.com/in/mohamed-nagy-36aa4b318) | - Tas1<br>- Task2<br>- Task3<br> |
| <a href="https://github.com/Zeyad-Azp"><img src="https://github.com/Zeyad-Azp.png" width="60px;" alt="Zeyad Azzap"/><br /><sub><b>Zeyad Azzap</b></sub></a> | [LinkedIn](https://www.linkedin.com/in/zeyad-azab) | - Tas1<br>- Task2<br>- Task3<br> |
| <a href="https://github.com/MazenAbdelatee"><img src="https://github.com/MazenAbdelatee.png" width="60px;" alt="Mazen Abdellatief"/><br /><sub><b>Mazen Abdellatief</b></sub></a> | [LinkedIn](https://www.linkedin.com/in/mazen-abdellateef-3b37172b6) | - External Login with third party providers<br>- Generic QR service <br>- Promo Code service for Organizer <br>- Payment Integration <br> |

---

## 📜 License

This project is licensed under the LGPL-2.1 License.
