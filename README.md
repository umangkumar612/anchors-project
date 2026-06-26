# ThreadNest – MERN Threaded Discussion Forum

ThreadNest is a full-stack MERN application that allows users to create discussion threads, reply with deeply nested comments, and earn dynamic credits based on discussion depth. The project demonstrates recursive comment handling, authentication, REST API development, and production deployment.

---

# 🚀 Live Demo

Frontend: https://peaceful-daifuku-9166fa.netlify.app

Backend: https://anchors-project-production-7f25.up.railway.app

---

# 📌 Features

- User Signup & Login Authentication
- JWT-based Secure Authentication
- Create Discussion Threads
- Nested Comment & Reply System
- Dynamic Credit Calculation
- Responsive Modern UI
- Dark/Light Theme Support
- Protected Routes
- MongoDB Atlas Integration
- RESTful API Architecture
- Full Deployment on Netlify & Railway

---

# 🛠️ Tech Stack

## Frontend
- React.js
- TypeScript
- Vite
- Axios
- React Router DOM
- Tailwind CSS

## Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

## Deployment
- Netlify (Frontend)
- Railway (Backend)

---

# 📂 Project Structure

```bash
anchors-project/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── context/
│
├── backend/
│   ├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
└── README.md
⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/umangkumar612/anchors-project.git
cd anchors-project
🔧 Backend Setup
cd backend
Install Dependencies
npm install
Create .env File
PORT=5000
MONGODB_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
Run Backend
npm run dev
💻 Frontend Setup
cd frontend
Install Dependencies
npm install
Create .env File
VITE_API_URL=http://localhost:5000/api
Run Frontend
npm run dev
🧠 Credit System Logic

The Original Poster (OP) earns credits whenever users interact with their thread.

Reply Depth	Credits Earned
Depth 1	+1 Credit
Depth 2	+3 Credits
Depth 3	+5 Credits
Formula
credit = 1 + (depth - 1) * 2;
🔐 Authentication
JWT Token Authentication
Password Hashing using bcryptjs
Protected Routes
User Session Persistence
🌐 API Endpoints
Auth Routes
Method	Endpoint
POST	/api/auth/signup
POST	/api/auth/login
GET	/api/auth/me
Post Routes
Method	Endpoint
GET	/api/posts
POST	/api/posts
GET	/api/posts/mine
Comment Routes
Method	Endpoint
POST	/api/comments
GET	/api/comments/:postId
🚀 Deployment
Frontend Deployment
Platform: Netlify
Backend Deployment
Platform: Railway
Database
MongoDB Atlas
📸 Screenshots
Login Page
Dashboard
Thread Creation
Nested Replies
Credit System

(Add screenshots here)

🎯 Key Learnings
Recursive Nested Comment Handling
MERN Stack Deployment
JWT Authentication
MongoDB Atlas Integration
Environment Variable Management
REST API Design
Full Stack Debugging
📈 Future Improvements
Real-time Updates using Socket.io
Notification System
Like & Reaction Feature
Edit/Delete Comments
Infinite Nested Replies
User Avatars
Search & Filter Discussions
👨‍💻 Author

Umang Kumar

GitHub: https://github.com/umangkumar612
Portfolio: https://silly-mousse-15f111.netlify.app/
⭐ Conclusion

ThreadNest is a scalable MERN stack discussion platform(Blogify) that demonstrates full-stack development skills including authentication, nested recursive data handling, deployment, database integration, and responsive UI development.
