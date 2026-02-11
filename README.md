# Nexus-TTT: Advanced NxN Multiplayer Engine

![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![Zustand](https://img.shields.io/badge/Zustand-5.0-orange)
![Redis](https://img.shields.io/badge/Redis-5.10-red)
![Nodejs](https://img.shields.io/badge/Nodejs-20.0-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-blue)
![Testing](https://img.shields.io/badge/Testing-Jest-green)
![Tests Passing](https://img.shields.io/badge/Tests-23_passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-70%25_functions-yellow)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

**Nexus TTT** is a high-performance, real-time multiplayer Tic-Tac-Toe game featuring an AI mode, 6 customizable neon themes, and authoritative server-side game logic. Built with a modern tech stack focused on speed and responsiveness.

## ✨ Features

* **Online Multiplayer:** Join rooms via room codes powered by Socket.io and Redis.
* **AI Opponent:** Face off against a strategic algorithm in local mode.
* **Theming Engine:** Dynamic neon themes with SVG-based win-line rendering and confetti celebrations.
* **Authoritative Logic:** Game state is managed on the server to prevent cheating and ensure synchronization.
* **Undo/Redo System:** Full history tracking for moves in both local and online play.
* **Real-time Chat:** Communicate with opponents during matches via a dedicated room chat.
* **Monorepo Architecture:** Single-command execution for both frontend and backend development.

---

## 🛠️ Tech Stack

### Frontend

* **React 19 + Vite:** Fast UI rendering and ultra-fast development server.
* **Tailwind CSS:** Modern styling with neon-gradient components.
* **Zustand:** Lightweight, high-performance state management.
* **Socket.io-client:** Real-time event handling for multiplayer synchronization.

### Backend

* **Node.js + Express:** Scalable server architecture.
* **Redis:** High-speed session and game-state storage for instant move syncing.
* **MongoDB:** User accounts, XP tracking, and persistent leaderboards.
* **Socket.io:** Bidirectional communication for real-time gameplay.

---

## 🛠️ The Tech Stack

* **Frontend:** React, Tailwind CSS, Zustand (State Management), React Router.
* **Backend:** Node.js, Express, Socket.io (Real-time events).
* **Database:** MongoDB (Player profiles & Global Leaderboards).
* **Testing:** Jest & React Testing Library.

## 📁 Project Structure

```text
/nexus-ttt
├── client/           # Vite + React Frontend
├── server/           # Node.js + Express + Redis Backend
├── package.json      # Root scripts for monorepo management
├── README.md         # Documentation
└── LICENSE           # MIT License

```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)

* Redis (Running locally or via cloud)

* MongoDB (Connection string)

### Installation

### 1. Clone the repository

``` bash
    git clone [https://github.com/mallickperwez43/nexus-ttt.git](https://github.com/mallickperwez43/nexus-ttt.git)
    cd nexus-ttt
```

### 2. Install dependencies for all packages

``` bash
    npm run install-all
```

### 3. Environment Variables: Create a .env file in the server directory

``` bash
    PORT=5000
    MONGO_URI=your_mongodb_uri
    REDIS_URL=redis://localhost:6379
    JWT_SECRET=your_secret_key
```

---

### Running the App

### Run both the frontend and backend with a single command from the root directory**

``` bash
    npm run dev 
```

* **Frontend:** <http://localhost:5173>

* **Backend:** <http://localhost:5000>

---

### 🎮 Game Controls

* **Undo Move:** `Ctrl + Z`

* **Redo Move:** `Ctrl + Y`

* **Keyboard Help:** `H` or click the Help icon.

* **Exit Game:** Cleanly leaves the room and resets local state.

---

## 📄 License

This project is licensed under the **MIT** License

---

### Developed with ⚡ and ❤ by [Mallick Perwez](https://github.com/mallickperwez43)
