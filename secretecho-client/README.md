# Secret Echo - Frontend Documentation

## Overview

Secret Echo is a modern web application designed to provide users with an interactive AI companion experience. The frontend is built using the latest technologies to ensure a seamless, responsive, and engaging user interface. It features a dedicated landing page, authentication flows, a dashboard with AI companions, and a real-time chat interface, all styled with a dual-theme mode for accessibility and user preference.

## Features

- **Landing Page**: A dedicated landing page introducing the application and guiding users to sign up or sign in.
- **Authentication Pages**: Having an auth page with both sign-up and sign-in option with session-based login using JWT, validated through the backend.
- **Middleware**: Validating each API request and response with middleware with `dynamic-routing-callback` for any url return to request url after login.
- **Proxy API**: Having proxy API system in frontend to indirectly call the backend API which depict not direct expose of backend API end-point.
- **Dashboard**: Displays a list of 5 AI companions (EchoBuddy, Chef EchoBite, Dr. EchoCare, EchoFit, EchoMind) for user interaction.
- **Chat Interface**: A messaging-like interface where users can select a companion to open a chat page with a chat box. The companion list is displayed on the side for easy navigation.
- **Real-Time Communication**: Each chat establishes a real-time WebSocket connection for instant messaging.
- **Chat Persistence**: Chats are saved in MongoDB via the backend, and also after opening the chats the context of messages are synced up for better engagement and ensuring conversations persist after refresh or logout/login.
- **Theme Management**: Supports dual-theme mode (light/dark) using `next-themes`, with a toggle option in the navbar.
- **User Management**: A menubar in the navbar displays user details (avatar, full name, email) and a logout option, with the dropdown centered below the avatar on desktop.
- **Mobile Menu**: A hamburger menu on mobile screens provides access to user details, logout, and theme toggle, ensuring a seamless experience across devices.
- **AI Simulation**: Simulated AI responses for better user engagement and a realistic chat experience.
- **Emoji Support**: AI companions use emojis in chats to enhance engagement and create a lively, real-like conversation experience.
- **Responsive Design**: Fully responsive layout optimized for both desktop and mobile devices.

## Tech Stack

- **Framework**: Next.js (Latest Version) with React 18
- **Styling**: Tailwind CSS for utility-first styling
- **Component Library**: Shadcn for reusable UI components (e.g., Avatar, Button, Menubar, Skeleton)
- **Data Management**: TanStack Query for data fetching, caching, and state management
- **Form Handling**: Formik for form controls with proper validation using Zod
- **Animations**: Framer Motion for smooth design animations (e.g., hover effects on companion cards)
- **Notifications**: Sonner for toast notifications (e.g., login/logout feedback)
- **Theming**: `next-themes` for dual-theme mode (light/dark)
- **WebSocket**: Real-time WebSocket connection for chat functionality
- **Backend Integration**: MongoDB for storing chats and user data, accessed via the backend API
- **Authentication**: Session-based login with JWT, validated through the backend

## Project Structure

```
secretecho-frontend/
├── app/                     # Next.js app directory
│   ├── (auth)/              # Authentication routes
│   │   |
│   │   |── page.tsx     # Sign-in/Signup component in auth page
│   │   └── layout.tsx   # Layout for auth page
│   │
│   ├── (companion)/           # companion sub-route file structure
│   │   |   |
|   |   |   |___chat/           # Chat page with messaging components
|   |   |     |── page.tsx         # Dashboard page component
|   |   |
|   |   |___dashboard/           # Dashboard page with companion list
|   |   |      ├── page.tsx         # Dashboard page component
|   |   |      └── layout.tsx       # Layout for dashboard
│   │   └── layout.tsx       # Shared layout for companion routes
│   ├── layout.tsx           # Root layout with Navbar and theme provider
│   └── page.tsx             # Landing page
├── components/              # Reusable components
│   ├── ui/                  # Shadcn UI components
│   │   ├── avatar.tsx       # Avatar component for user and companion display
│   │   ├── button.tsx       # Button component for actions (e.g., logout, toggle menu)
│   │   ├── menubar.tsx      # Menubar for user details and logout on desktop
│   │   └── skeleton.tsx     # Skeleton for loading states
│   ├── navbar.tsx           # Navbar with theme toggle, user details, and mobile menu
│   ├── companion-card.tsx   # Card component for displaying companions on dashboard
│   ├── chat-box.tsx         # Chat box component for messaging interface
│   ├── companion-list.tsx   # Sidebar list of companions on chat page
│   └── signout-modal.tsx    # Modal for logout confirmation
├── config/                  # Configuration files
│   ├── axios.ts             # Axios instance for API calls (frontendAxios)
│   ├── constants.ts         # Constants (e.g., RETURN_TO_URL_PARAM_NAME)
│   └── companions.ts        # Companion data and system prompts
├── context/                 # React context for state management
│   ├── userContext.tsx      # User context for auth state
│   └── themeButton.tsx      # Theme toggle component (ModeToggle)
├── lib/                     # Utility functions
│   ├── websocket.ts         # WebSocket connection setup for real-time chat
│   └── validation.ts        # Zod validation schemas for forms
├── public/                  # Static assets
│   ├── logo.png             # Application logo
│   ├── chat.jpg             # Avatar for EchoBuddy
│   ├── chef.jpg             # Avatar for Chef EchoBite
│   ├── doctor.jpg           # Avatar for Dr. EchoCare
│   ├── gym.jpg              # Avatar for EchoFit
│   ├── study.jpg            # Avatar for EchoMind
├── styles/                  # Global styles
│   └── globals.css          # Tailwind CSS and global styles
├── types/                   # TypeScript type definitions
│   ├── request_response.types.ts  # Types for API request/response
│   └── companion.types.ts         # Types for companion data
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation
```

## Application Flow Diagram

Below is a text-based diagram illustrating the user flow through the Secret Echo application:

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

1. **Landing Page**: Users start at the root (`/`) and can choose to sign up or sign in.
2. **Authentication**: Users sign up (`/auth?action=signup`) or sign in (`/auth?action=signin`) using JWT-based authentication.
3. **Dashboard**: After login, users are redirected to the dashboard (`/dashboard`) showing 5 AI companions.
4. **Chat Interface**: Selecting a companion navigates to `/chat?companion_code=[companion_code]`, displaying a chat box and companion list.
5. **Real-Time Chat**: Users interact with the companion via a WebSocket connection, with messages saved to MongoDB.
6. **User Actions**: Users can toggle themes, view details, or log out via the navbar (centered dropdown on desktop, hamburger menu on mobile).

## Screenshots

To visually showcase the application, you can add screenshots of key pages. Below are placeholders where you can insert images after capturing them:

1. **Landing Page**:
   ![alt text](/docs/screenshots/image.png)

   - Description: The landing page introduces Secret Echo with sign-up and sign-in options.

2. **Sign-In Component**:
   ![alt text](/docs/screenshots/image-1.png)
   **Sign-up Component**:
   ![alt text](/docs/screenshots/image-2.png)

   - Description: The auth page haing sign-in & sign-up componenet with Formik form and Zod validation.

3. **Dashboard**:
   ![alt text](/docs/screenshots/image-3.png)

   - Description: The dashboard displaying 5 AI companions with companion cards.

4. **Chat Interface**:
   ![alt text](/docs/screenshots/image-4.png)
   - Description: The chat page with a chat box and sidebar companion list, showing real-time messaging.

## Setup Instructions

### Prerequisites

- Node.js (v20 LTS recommended)
- npm or yarn
- Backend server running (with MongoDB and WebSocket support)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ShashankGithub7348/secret-echo.git
   cd secret-echo/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Create a `.env.local` file in the `frontend/` directory.
   - Add the following variables:

     ```
     APP_NAME={{APP_NAME}}
     V1_API_ENDPOINT={{V1_API_ENDPOINT}}
     NEXT_PUBLIC_FRONTEND_URL={{NEXT_PUBLIC_FRONTEND_URL}}

     SESSION_COOKIE_NAME={{SESSION_COOKIE_NAME}}
     SESSION_COOKIE_PASSWORD={{SESSION_COOKIE_PASSWORD}}

     NEXT_PUBLIC_WEBSOCKET_URL={{NEXT_PUBLIC_WEBSOCKET_URL}}
     ```

   ````

   4. Run the development server:

   ```bash
   npm run dev
   ````

4. Open the app in your browser at `http://localhost:3000`.

### Running with Docker

1. Ensure Docker and Docker Compose are installed.
2. Use the `docker-compose.yml` file to run the frontend alongside the backend and MongoDB:

   ```bash
   docker-compose up --build
   ```

3. Access the app at `http://localhost:3000`.

## Usage

1. **Landing Page**: Visit the root URL (`/`) to see the landing page with options to sign up or sign in.
2. **Authentication**:
   - Navigate to `/auth?action=signup` to create an account.
   - Navigate to `//auth?action=signin` to log in.
   - Authentication uses JWT tokens, stored in sessions, and validated via the backend.
3. **Dashboard**:
   - After logging in, you’ll be redirected to `/dashboard`.
   - The dashboard lists 5 AI companions with their avatars and descriptions.
4. **Chat**:
   - Click on a companion to navigate to `/chat?companion_code=[companion_code]`.
   - The chat page displays a chat box and a sidebar with the companion list.
   - Messages are sent and received in real-time via WebSocket.
   - Chats are saved in MongoDB and persist across sessions.
5. **Theme Toggle**:
   - Use the theme toggle in the navbar to switch between light and dark modes.
6. **User Management**:
   - On desktop, click the avatar in the navbar to view user details (full name, email) and a logout option in a centered dropdown.
   - On mobile, use the hamburger menu to access user details, logout, and theme toggle.
7. **Logout**:
   - The logout button opens a confirmation modal (`SignOutModal`) and displays a toast notification upon success.

## AI Companions

The application features 5 AI companions, each with a unique role and system prompt designed for better user engagement:

- **EchoBuddy**: A warm, empathetic friend for casual chats, using emojis like 😊 and 🌟 for a friendly tone.
- **Chef EchoBite**: A culinary guide for recipes and cooking tips, with emojis like 👩‍🍳 and 🍲.
- **Dr. EchoCare**: A compassionate health assistant, using minimal emojis (e.g., 🩺, ❤️) to maintain professionalism.
- **EchoFit**: An energetic fitness coach, frequently using emojis like 💪 and 🥗 to match its lively tone.
- **EchoMind**: A patient study mentor, with minimal emojis (e.g., 📚, 💡) for a professional tone.

Each companion’s system prompt has been modified to include emoji usage, enhancing the chat experience while aligning with their respective tones.

## Development Notes

- **Forms and Validation**: Formik and Zod are used for form handling and validation, ensuring robust input validation for sign-up and sign-in forms.
- **Data Fetching**: TanStack Query manages API calls for fetching companion data, user details, and chat history, with caching for performance.
- **Real-Time Chats**: WebSocket connections are established for each companion chat, with messages saved in MongoDB via the backend.
- **Theming**: `next-themes` enables seamless light/dark mode switching, with styles applied via Tailwind CSS.
- **Animations**: Framer Motion adds smooth transitions, such as hover effects on companion cards and potential mobile menu animations.
- **Responsive Design**: The navbar includes a mobile menu with a hamburger icon, ensuring accessibility on smaller screens.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, reach out to the project maintainer at [shashank272004@gmail.com](mailto:shashank272004@gmail.com).
