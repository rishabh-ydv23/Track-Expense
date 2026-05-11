# TrackExpense

A full-stack expense tracker application with a React + Vite frontend and an Express + MongoDB backend.

## Features

- User authentication and registration
- Income and expense tracking
- Dashboard analytics and charts
- Export support via Excel/XLSX libraries
- Responsive React UI with Tailwind CSS and Recharts
- Secure backend with Helmet, CORS, JWT, and rate limiting

## Repository Structure

- `backend/` - Express API server
- `frontend/` - React + Vite web application
- `Track-Expense/` - alternate or production-ready copy of the same app

## Prerequisites

- Node.js 18+ or later
- npm
- MongoDB connection URI

## Backend Setup

1. Open a terminal and go to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following values:
   ```env
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=4000
   CORS_ORIGIN=http://localhost:5173
   TRUST_PROXY=0
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

The backend default port is `4000` and the API root is `http://localhost:4000/api`.

## Frontend Setup

1. Open a terminal and go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend runs on Vite, typically at `http://localhost:5173`.

## Configuration

The frontend uses the environment variable `VITE_API_URL` if provided. Default API base URL:

```js
http://localhost:4000/api
```

Example `.env` in `frontend/` if you want to override the API URL:

```env
VITE_API_URL=http://localhost:4000/api
```

## Available Scripts

### Backend
- `npm start` — start the Express server with nodemon

### Frontend
- `npm run dev` — start the Vite development server
- `npm run build` — build the production app
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint checks

## Notes

- Ensure both backend and frontend are running while testing the app.
- If you use a different backend host or port, update the frontend `VITE_API_URL` accordingly.
- The backend requires `MONGO_URI` and `JWT_SECRET` to be set before starting.

## License

This project is released under the ISC license.
