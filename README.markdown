# Secret Echo - Main Application

## Overview

Secret Echo is a comprehensive AI companion application that integrates a modern frontend with a robust backend to provide an interactive and personalized user experience. The main branch serves as the central hub, coordinating the frontend (secretecho-client) and backend (secretecho-server) components. It leverages cutting-edge technologies for real-time communication, user authentication, and AI-driven interactions, with data persistence ensured through MongoDB.

## Features

- **Integrated Frontend and Backend**: Combines a responsive Next.js frontend with a Node.js backend for a seamless AI companion experience.
- **User Authentication**: Supports sign-up, sign-in, and session-based authentication using JWT tokens.
- **Real-Time Communication**: Utilizes WebSocket for instant messaging between users and AI companions.
- **AI Companions**: Offers 5 specialized AI companions (EchoBuddy, Chef EchoBite, Dr. EchoCare, EchoFit, EchoMind) with context-aware responses.
- **Chat Persistence**: Stores chat history in MongoDB for continuity across sessions.
- **Theme Management**: Provides dual-theme (light/dark) mode with toggle functionality.
- **Responsive Design**: Optimized for desktop and mobile devices with a hamburger menu on smaller screens.
- **Rate Limiting**: Implements Redis-based rate limiting to prevent API abuse.

## Tech Stack

- **Frontend**: Next.js, React 18, Tailwind CSS, Shadcn, TanStack Query, Formik, Zod, Framer Motion, Sonner, next-themes, WebSocket.
- **Backend**: Node.js, TypeScript, Express, MongoDB, Mongoose, WebSocket (ws), JWT, bcrypt, Joi, Jest, Redis.
- **AI Integration**: Gemini AI Live for generating AI responses.
- **Containerization**: Docker support for both frontend and backend.

## Project Structure

```
secretecho/
├── secretecho-client/    # Frontend directory (see secretecho-client README)
├── secretecho-server/    # Backend directory (see secretecho-server README)
├── docker-compose.yml    # Docker Compose configuration for integrated setup
├── README.md             # Main project documentation
```

## Application Flow Diagram

```
[Landing Page] --> [Sign Up / Sign In] --> [Dashboard]
      |                  |                     |
      |                  |                     v
      v                  v              [Select Companion]
[Unauthenticated] [Authenticated]           |
                                           v
                                    [Chat Interface]
                                          |
                                          v
                                     [Real-Time Chat]
                                          |
                                          v
                                    [Chat Persisted]
                                          |
                                          v
                                     [Logout / Theme Toggle]
```

### Flow Explanation

1. **Landing Page**: Users access the application and choose to sign up or sign in.
2. **Authentication**: Handled via the backend with JWT tokens, redirecting to the dashboard upon success.
3. **Dashboard**: Displays AI companions for selection.
4. **Chat Interface**: Opens a real-time chat with the selected companion via WebSocket.
5. **User Actions**: Supports theme toggling and logout functionality.

## Setup Instructions

### Prerequisites

- Node.js (v20 LTS for frontend, v18.18.0+ for backend)
- npm or yarn
- MongoDB (local or cloud instance)
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ShashankGithub7348/secret-echo.git
   cd secret-echo
   ```

2. **Set up environment variables**:
   - Create `.env.local` in `secretecho-client/` and `.env` in `secretecho-server/` with the required variables (see respective READMEs).

3. **Install dependencies**:
   - For frontend: `cd secretecho-client && npm install`
   - For backend: `cd secretecho-server && npm install`

4. **Run the application**:
   - Using Docker (recommended):
     ```bash
     docker-compose up --build
     ```
   - Manually:
     - Start backend: `cd secretecho-server && npm run dev`
     - Start frontend: `cd secretecho-client && npm run dev`
   - Access the app at `http://localhost:3000`.

## Usage

1. **Sign Up/Sign In**: Navigate to `/auth?action=signup` or `/auth?action=signin`.
2. **Dashboard**: View and select AI companions at `/dashboard`.
3. **Chat**: Interact with companions at `/chat?companion_code=[companion_code]`.
4. **Theme Toggle**: Switch between light/dark modes via the navbar.
5. **Logout**: Use the navbar menu to log out.

## License

This project is licensed under the MIT License (frontend) and ISC License (backend). See the respective `LICENSE` files in `secretecho-client/` and `secretecho-server/` for details.

## Contact

For questions or support, reach out to the project maintainer at [shashank272004@gmail.com](mailto:shashank272004@gmail.com).