# CodeShare 🔗

> A secure, code-based temporary file sharing system built with the **MERN stack**.

Upload a file → get a 6-character code → share it with anyone. No account needed.

---

## Features

- 📤 **File Upload** — Drag & drop, up to 50MB, stored on Cloudinary
- 🔑 **6-Character Share Code** — Unique code to retrieve any file
- ⏰ **Auto Expiry** — Files expire in 1h, 6h, 24h, or 7 days
- ⬇️ **Download Limits** — Cap how many times a file can be downloaded
- 🔒 **Password Protection** — Optional bcrypt-hashed password for files
- 📱 **QR Code Sharing** — Scannable QR code for every share link
- 👤 **User Accounts** — Register to manage files, view analytics
- 📊 **Dashboard** — Stats, file history, toggle sharing, delete files
- 🛡️ **Security** — JWT auth, rate limiting, input validation, MIME whitelist
- 🧹 **Auto Cleanup** — Hourly cron removes expired files from DB + Cloudinary

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| File Storage | Cloudinary |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| Rate Limiting | express-rate-limit |
| QR Code | qrcode |

---

## Project Structure

```
Internship-Project/
├── server/       ← Express.js API
│   ├── src/
│   │   ├── index.js
│   │   ├── models/       (User, File, DownloadLog)
│   │   ├── controllers/  (auth, file, share)
│   │   ├── routes/
│   │   ├── middleware/   (JWT, upload, rate-limit)
│   │   └── utils/        (connectDB, generateCode, cleanup, cloudinary)
│   └── .env.example
│
└── client/       ← Vite + React frontend
    └── src/
        ├── pages/  (Home, Upload, Share, Login, Register, Dashboard)
        └── components/ (Navbar, ShareCodeCard, ProtectedRoute)
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repo
```bash
git clone https://github.com/Karthick9298/Internship-project.git
cd Internship-project
```

### 2. Configure the backend
```bash
cd server
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* in .env
npm install
npm run dev
```

### 3. Start the frontend
```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173** · API at **http://localhost:5000**

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login |
| `GET`  | `/api/auth/me` | Get current user |
| `POST` | `/api/files/upload` | Upload a file (guest or auth) |
| `GET`  | `/api/files/my-files` | Get user's files |
| `GET`  | `/api/files/stats` | Dashboard stats |
| `DELETE` | `/api/files/:id` | Delete a file |
| `PATCH` | `/api/files/:id/toggle` | Toggle sharing on/off |
| `GET`  | `/api/share/:code` | Lookup file by code |
| `POST` | `/api/share/verify` | Verify file password |
| `GET`  | `/api/share/:code/download` | Download file |
| `GET`  | `/api/share/:code/qr` | Get QR code |

---

## License

MIT
