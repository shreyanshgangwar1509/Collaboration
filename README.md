# Collaboration Platform (MERN)

A real-time workspace for teams to sync on code, documents, and design. This project integrates multiple collaborative tools into a single dashboard using Socket.io for live updates and a unified Glassmorphism UI.

## Modules

###  CodeLab (Editor)
* **Execution**: Integrated with the **Piston API** for free, multi-language code compilation (Python, Java, C++, JS, etc.).
* **Sync**: Real-time cursor and text synchronization.
* **Snippets**: Pre-configured boilerplates for quick starts.

###  DocStudio
* **Engine**: Built on **React Quill**.
* **Features**: Rich text formatting, real-time collaboration, and word count tracking.
* **Export**: Direct export to `.txt` files.

###  Photo & Design Studio
* **Engine**: Powered by **Fabric.js v6**.
* **Editing**: Drag-and-drop object manipulation, layering (Front/Back), and opacity controls.
* **Filters**: Real-time image filters (Grayscale, Sepia, Invert, Blur).
* **Collage**: Support for multiple image uploads on a single canvas.

###  Whiteboard
* **Tools**: Freehand drawing, shape tools (Rect, Circle, Line), and persistent clearing.
* **State**: Real-time canvas broadcasting.

###  User Profiles & Activity
* **Activity Tracking**: Automatic logging of room joins and code executions.
* **Saved Work**: Users can save code snippets or documents directly to their profile database.
* **Dashboard**: Two-column layout with quick-launch tools and a filterable history sidebar.

## Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide/React Icons.
* **Backend**: Node.js, Express.
* **Database**: MongoDB (Mongoose) for users, activity logs, and saved items.
* **Real-time**: Socket.io (with JWT-based handshake authentication).
* **Auth**: Custom JWT implementation with bcryptjs password hashing.

## Project Structure

```text
client/
  src/
    assets/        Static assets (images, icons, SVGs)
    components/    Shared UI components (templates, forms, buttons)
    constants/     Client-side event and config constants
    hooks/         Custom React hooks (useSocket)
    layout/        Application shells, navbar, header, and footer
    Pages/         Feature page modules (PascalCase)
      Auth/        Login, Register, and Profile views
      Chat/        Real-time group chat
      Chatbot/     AI assistant with rule-based engine
      Coding/      Real-time collaborative code editor
      Docs/        Rich text document editor
      Home/        Landing page and hero sections
      PhotoShop/   Fabric.js canvas image studio
      PPT/         Presentation slide builder
      WhiteBoard/  Canvas drawing board
    App.jsx        Root router and suspense fallback
    main.jsx       Application entry point
server/
  constants/       System event names and language mappings
  controllers/     Business logic handlers (*.controller.js)
  middlewares/     Auth and global error handlers (*.middleware.js)
  models/          Mongoose schemas and models (*.model.js)
  routes/          Express REST route endpoints (*.routes.js)
  utils/           Database connection, mailer, JWT, and Socket.IO
  index.js         Express server initialization and socket bootstrap
temp/              Archived unused, deprecated, and stub files (git-ignored)
```

Generated build output, dependencies, caches, temporary files, and local environment files are excluded from Git. Keep deployable build output in the tool's expected `dist/` directory rather than moving it into a temporary directory.

## Setup

### Prerequisites
* Node.js (>= 22.0.0)
* MongoDB instance

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/shreyanshgangwar1509/Collaboration.git
   ```

2. **Backend Config**
   ```bash
   cd server
   npm install
   # Create a .env file with:
   # PORT=3000
   # JWT_SECERET=your_secret
   # EMAIL_USER/EMAIL_PASS=gmail_creds
   # MONGO_URL=your_mongo_uri
   npm start
   ```

3. **Frontend Config**
   ```bash
   cd client
   npm install
   # Create a .env file with:
   # VITE_SERVER=http://localhost:3000
   npm run dev
   ```

## Team
* Shreyansh Gangwar
* Anushka Verma
* Varsha Sakaray

## Live Demo
[collaboration-iota.vercel.app](https://collaboration-iota.vercel.app/)
