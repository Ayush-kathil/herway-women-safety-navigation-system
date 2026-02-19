# HerWay Deployment Guide

## Prerequisites

- **Frontend**: Node.js 18+ (20+ recommended)
- **Backend**: Python 3.9+
- **OSRM**: (Optional) For custom routing, or use the public demo server.

---

## 1. Backend Setup (AI & Data Analysis)

The backend is built with **FastAPI** and handles safety scoring, crime data
analysis, and route processing.

### Installation

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Verify Data Files: Ensure `safety_model.pkl` and `data.csv` are present in
   the `backend/` directory.

### Running the Server

Start the API server on port 8000:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. You can test it at
`http://localhost:8000/docs`.

---

## 2. Frontend Setup (Next.js Application)

The frontend is a **Next.js 14** application using **Tailwind CSS**.

### Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### Development Mode

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

To build for production:

```bash
npm run build
npm start
```

---

## 3. Cloud Deployment (Vercel)

The frontend is configured for easy deployment on Vercel.

1. Push this repository to GitHub.
2. Import the project into Vercel.
3. Vercel should automatically detect the `frontend` directory (thanks to
   `vercel.json` and root `package.json`).
4. **Environment Variables**: Add `NEXT_PUBLIC_API_URL` pointing to your
   deployed backend URL.

**Note**: Since the backend is Python/FastAPI, it cannot be hosted on Vercel's
standard Edge Network easily without configuration. We recommend hosting the
backend on **Render**, **Railway**, or **AWS**, and the frontend on **Vercel**.
