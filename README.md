# Gatherly - Social Media Application 📱

Gatherly is a full-stack social media platform that combines the visual appeal of Instagram with the modern, card-based layout of Twitter/X. It features a complete authentication system, real-time interactions, and a "Vibrant Violet" design identity.

---

## 🚀 Features

- **Authentication:** Secure Login & Registration (JWT + bcrypt)
- **Modern UI/UX:** Left-sidebar navigation, soft "bubble" card design, and responsive layouts
- **Social Feed:** Infinite scrolling feed with interaction capabilities
- **Interactions:** Like/Unlike posts, Add/Delete comments
- **User System:** Search users, Follow/Unfollow, and view Profiles
- **Notifications:** Real-time alerts for likes, comments, and follows
- **Media:** Support for image posts via URL

---

## 🛠️ Technology Stack

| Domain | Technologies Used |
|------|------------------|
| **Frontend** | React.js, Vite, React Router DOM, Axios, Custom CSS3 |
| **Backend** | Node.js, Express.js, REST API |
| **Database** | PostgreSQL (Relational DB), pg (node-postgres) |
| **Security** | JSON Web Tokens (JWT), Bcrypt, CORS, Dotenv |
| **DevOps** | Git, GitHub |

---

## ⚙️ Installation & Local Setup

Follow these steps to deploy the application in a local development environment.

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/gatherly.git
cd gatherly
2️⃣ Database Setup (PostgreSQL)
Run the database.sql script in pgAdmin.

🔹 Step 1: Open pgAdmin
Launch pgAdmin

Connect to your PostgreSQL server

🔹 Step 2: Create & Select Database
Create a database named social_media, then select it:

markdown

Servers
 └── PostgreSQL
     └── Databases
         └── social_media
⚠️ Important:
The database must already exist.

🔹 Step 3: Open Query Tool
Right-click on social_media

Click Query Tool

🔹 Step 4: Load the SQL File
Click the 📂 Open File icon

Select database.sql from the cloned repository

🔹 Step 5: Execute
Click ▶ Execute (or press F5)

pgAdmin will:

Run all SQL statements

Create tables, constraints, indexes, etc.

3️⃣ Backend Configuration
Navigate to the backend directory and install dependencies:

bash

cd backend
npm install
🔐 Environment Variables
Create a .env file in the backend/ directory and add the following variables:

env
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=social_media
JWT_SECRET=your_jwt_secret
PORT=5000
BCRYPT_SALT_ROUNDS=12
Database Migration:
Run the SQL scripts provided in database.sql using pgAdmin or psql CLI to initialize tables and triggers.

▶️ Start Backend Server
bash
node index.js
Server runs on:

http://localhost:5000
4️⃣ Frontend Configuration
Open a new terminal session:

bash
cd frontend
npm install
Launch the development server:

bash
npm run dev