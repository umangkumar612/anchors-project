# MERN Threaded Forum

Production-style threaded discussion forum built with MongoDB, Express, React, Node.js, Tailwind CSS, and TypeScript.

## Features

- Signup and login with JWT authentication
- Password hashing with `bcryptjs`
- Protected dashboard route
- Newest-first public post feed
- Single post pages with recursive unlimited-depth comments
- Soft-delete comments as `[deleted]`
- OP credit awards based on comment depth
- Credit configuration stored in MongoDB via `CreditConfig`
- Deleting a comment subtracts exactly the credit originally awarded

## Project Structure

```txt
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
frontend/
  src/
    components/
    context/
    pages/
    services/
```

## Setup

Requirements:

- Node.js 20+
- MongoDB running locally or a MongoDB Atlas connection string

Install dependencies from the root:

```bash
npm install
```

Create environment files:

```bash
cp backend/.env backend/.env
cp frontend/.env frontend/.env
```

Update `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/threaded-forum
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Update `frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/api/health`

## API Routes

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Posts:

- `GET /api/posts`
- `GET /api/posts/:id`
- `GET /api/posts/mine`
- `POST /api/posts`
- `POST /api/posts/:postId/comments`

Comments:

- `DELETE /api/comments/:id`

Config:

- `GET /api/config/credits`

## MongoDB Schemas

`User`

- `name`
- `email`
- `password`
- `totalCredits`

`Post`

- `title`
- `body`
- `author`
- `createdAt`

`Comment`

- `content`
- `author`
- `post`
- `parentComment`
- `depth`
- `creditAwarded`
- `isDeleted`
- `createdAt`

`CreditConfig`

- `baseCredit`
- `incrementValue`

The default credit config is inserted on server boot when no config exists:

```txt
baseCredit = 1
incrementValue = 2
```

Credit formula:

```txt
credit = baseCredit + (depth - 1) * incrementValue
```

## Build

```bash
npm run build
```

## Deployment

### Backend on Railway

1. Create a Railway project from this repository.
2. Set the service root to `backend`.
3. Add environment variables from `backend/.env.example`.
4. Set `MONGODB_URI` to MongoDB Atlas or Railway MongoDB.
5. Set `CLIENT_URL` to the deployed Vercel frontend URL.
6. Build command: `npm run build`
7. Start command: `npm start`

### Frontend on Vercel

1. Import the repository in Vercel.
2. Set the project root to `frontend`.
3. Add `VITE_API_URL=https://your-railway-api-url/api`.
4. Build command: `npm run build`
5. Output directory: `dist`

After deployment, update Railway `CLIENT_URL` to the final Vercel URL and redeploy the backend.
