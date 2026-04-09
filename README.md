# NxtChapter - AI-Powered Learning Management System

NxtChapter is a comprehensive Learning Management System (LMS) designed to provide an interactive and adaptive learning experience. It features a dual-role architecture (Student and Admin), an integrated coding arena, AI-generated quizzes, and a robust doubt resolution system.

## 🚀 Key Features

- **Dual-Role System**: Distinct workflows for students (Learning) and admins/mentors (Management).
- **Course & Topic Management**: Complete hierarchy of courses and topics with progress tracking.
- **Integrated Coding Arena**: Topic-specific coding practice with real-time feedback.
- **AI-Generated Quizzes**: Dynamically generated assessments using the Google Gemini API to test topic mastery.
- **Doubts Helpdesk**: A communication channel between students and mentors for query resolution.
- **Hybrid Storage**: Seamlessly switches between MongoDB and a local JSON fallback for high availability.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Monaco Editor, Axios, React Router.
- **Backend**: Node.js, Express, MongoDB/Mongoose, LangChain, Google Gemini Pro.
- **Development**: Nodemon, Git.

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (Optional, local fallback is available)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SRI-VARDHAN-ADIKI/NxtChapter.git
   cd NxtChapter
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder and add your credentials:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend:**
   From the `backend` directory:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`.

2. **Start the Frontend:**
   From the `frontend` directory:
   ```bash
   npm run dev
   ```
   The application will open at `http://localhost:5173`.

## 🔑 Default Credentials

The system automatically initializes an admin account on the first run:
- **Email**: `admin@nxtchapter.com`
- **Password**: `admin123`

---
Built with ❤️ by [SRI-VARDHAN-ADIKI](https://github.com/SRI-VARDHAN-ADIKI)
