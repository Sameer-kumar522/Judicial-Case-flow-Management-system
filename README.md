# Judicial Case Flow Management System (CFMS)

### Sindh High Court

A web-based Judicial Case Flow Management System designed to digitize and simplify judicial case management through a centralized platform.

---

## 📌 Project Overview

The Judicial Case Flow Management System (CFMS) is a web application developed to improve the organization and management of judicial information.

The system provides a centralized platform for managing court information, judges, cases, hearing schedules, legal documents, and users.

The primary goal is to reduce reliance on manual record management, improve information organization, and make judicial case information easier to manage and retrieve.

## 🎯 Project Objectives

- Digitize judicial case management processes.
- Maintain centralized case records.
- Organize hearing schedules.
- Manage court and judge information.
- Store and manage case-related documents.
- Provide role-based access to system users.
- Support better organization and retrieval of judicial information.

## ✨ Key Features

- **Authentication:** Secure login and user authentication.
- **Dashboard:** Overview of important system information.
- **Court Management:** Manage court information.
- **Judge Management:** Maintain judge records.
- **Case Management:** Create, view, update, and manage cases.
- **Hearing Management:** Organize and manage hearing schedules.
- **Document Management:** Upload and manage case-related documents.
- **Analytics:** View organized system information and analytical summaries.
- **User Management:** Manage system users and their access.

## 🛠️ Technologies Used

### Frontend

- React.js
- Vite
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Bcrypt.js

### Cloud Services and Tools

- MongoDB Atlas – Cloud database
- Supabase Storage – Document storage
- GitHub – Source code management and version control
- Postman – API testing

## 🏗️ Project Architecture

The application follows a client-server architecture.

```text
CFMS
│
├── Backend
│   ├── config
│   ├── Controllers
│   ├── middleware
│   ├── models
│   ├── Routes
│   ├── seeds
│   ├── server.js
│   └── package.json
│
├── Frontend
│   ├── public
│   ├── src
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🗄️ Database

The project uses MongoDB Atlas as its database.

The backend uses Mongoose to interact with the database.

Main database collections include:

- Users
- Courts
- Judges
- Cases
- Hearings
- Documents
- Counters

Supabase Storage is used for storing uploaded case-related documents.

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Sameer-kumar522/Judicial-Case-flow-Management-system.git
```

### 2. Navigate to the Project

```bash
cd Judicial-Case-flow-Management-system
```

### 3. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file inside the Backend folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://sameersatlani_db_user:sameerkumar123@cfms-cluster.uzr6zz2.mongodb.net/shc_cfms_db?retryWrites=true&w=majority&appName=CFMS-Cluster
JWT_SECRET=node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"


```

Start the backend:

```bash
npm start
```

The backend will run at:

`http://localhost:5000`

### 4. Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
```

Create a `.env.local` file inside the Frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will run at:

`http://localhost:5173`

## 🔍 API Health Check

To check whether the backend is running, open:

```text
http://localhost:5000/api/health
```

The endpoint provides server and database connection information.

## 🔐 Security

- JWT-based authentication.
- Password hashing using Bcrypt.js.
- Environment variables for sensitive credentials.
- Role-based access control.
- Private Supabase document storage with signed download URLs.

**Important:** Never upload `.env` files or secret keys to GitHub.

## 👥 Project Team

**Group 4 – BSCS**

- Sameer Kumar
- M. Dawood
- Charandeep

## 🎓 Academic Project

Developed as a university project for the BSCS program at SZABIST Hyderabad.

---

**Judicial Case Flow Management System (CFMS)**
*Digitizing Judicial Case Management Through Technology.*
