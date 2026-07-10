# 🎯 Forsa – Event Management Web Application

Forsa is a full-stack **web application** designed to simplify event management by connecting **Organizers**, **Venue Owners**, and **Attendees** in one unified platform.

Built with modern technologies, Forsa focuses on **performance, scalability, and user experience**, enabling seamless event creation, booking, and management.

---

## 📌 Overview

Forsa provides a centralized system where:

- 🧑‍💼 Organizers can create and manage events easily
- 🏢 Venue Owners can list and control their venues
- 🎟️ Attendees can explore and book events easily

---

## 🚀 Features

- 🔐 Authentication & Authorization (Role-Based)
- 📅 Event Creation & Management
- 🏢 Venue Listing & Booking System
- 🎟️ Ticket Reservation
- ⭐ Reviews & Ratings
- 📊 Dashboard for Insights
- 🌐 Fully Responsive Web UI

---

## 🧠 User Roles & Guarantees

### 😶‍🌫️ Guest

**Responsibilities:**

- Browse availble events

---

### 👤 Attendee

**Responsibilities:**

- Browse available events
- Book tickets
- Rate and review events

**Guarantees:**

- Easy and fast booking experience
- Accurate and updated event information
- Secure data handling

---

### 🧑‍💼 Organizer

**Responsibilities:**

- Create and manage events
- Monitor bookings and attendees
- Update event details

**Guarantees:**

- Efficient event management tools
- Real-time updates
- Reliable attendee tracking

---

### 🏢 Venue Owner

**Responsibilities:**

- List venues and availability
- Handle booking requests
- Manage schedules

**Guarantees:**

- Clear booking workflow
- Optimized scheduling system
- Increased exposure for venues

---

## 🛠️ Tech Stack

| Layer        | Technology                |
| ------------ | ------------------------- |
| Frontend     | Tailwind, Typescript      |
| Web Pattern  | .NET Web API              |
| Architecture | Clean Architure           |
| Database     | SQL (Relational Database) |
| ORM          | Entity Framework Core     |

### Required Settings:

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
  "ApplicationName": "Forsa",
  "CalendarId": "primary"
  },
  "LLM": {
  "ModelId": "",
  "APIKey": ""
}
}
```

---

---

## 🤝 Contributions

| Contributor                                              | LinkedIn                                                            | Tasks and Lifecycles                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. [Marwan Hussein](https://github.com/Marwan-Hussein)   | [LinkedIn](https://linkedin.com/in/marwanhussein9)                  | - Forsa Logo<br>- OTP Service<br>- Admin Reports<br>- Event Services \[EvaluateEventStatus, DeductTicketInventory, ReleaseTicketInventory\]<br>- Google Calendar Integration<br>|
| 2. [Mariam Ehab](https://github.com/Marria-m)            | [LinkedIn](https://www.linkedin.com/in/mariamehab1305)              | - Tas1<br>- Task2<br>- Task3<br>                                                                                                                |
| 3. [Mohamed Kotb](https://github.com/kotbb)              | [LinkedIn](https://www.linkedin.com/in/mohamedkotbb)                | - Tas1<br>- Task2<br>- Task3<br>                                                                                                                |
| 4. [Mohamed Nagy](https://github.com/Nagy101)            | [LinkedIn](https://www.linkedin.com/in/mohamed-nagy-36aa4b318)      | - Tas1<br>- Task2<br>- Task3<br>                                                                                                                |
| 5. [Zeyad Azzap](https://github.com/user5)               | [LinkedIn](https://www.linkedin.com/in/zeyad-azab)                  | - Tas1<br>- Task2<br>- Task3<br>                                                                                                                |
| 6. [Mazen Abdellatief](https://github.com/MazenAdelatee) | [LinkedIn](https://www.linkedin.com/in/mazen-abdellateef-3b37172b6) | - External Login with third party providers<br>- Generic QR service <br>- Promo Code service for Organizer <br>- Payment Integration <br>                            |

---

## 📜 License

This project is licensed under the LGPL-2.1 License.
