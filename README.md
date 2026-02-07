# Nexus-TTT: Advanced NxN Multiplayer Engine

![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![Zustand](https://img.shields.io/badge/Zustand-5.0-orange)
![Testing](https://img.shields.io/badge/Testing-Jest-green)
![Tests Passing](https://img.shields.io/badge/Tests-23_passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-70%25_functions-yellow)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

Nexus-TTT is a high-performance, full-stack Tic-Tac-Toe platform designed for scalability and deep strategy. Moving beyond the classic 3x3 grid, Nexus-TTT allows players to compete on dynamic grids (up to 10x10) against a heuristic-driven Expert AI or real-time human opponents.

## 🚀 Core Features

- **Scalable Grid Engine:** Play on any board size from 3x3 to 10x10 with dynamic win-condition detection.
- **Tiered AI Opponent:** Features a custom-built AI with four difficulty levels:
  - **Easy:** Random placement.
  - **Normal/Hard:** Heuristic-based blocking and winning.
  - **Expert:** Minimax algorithm with Alpha-Beta pruning and depth-limited search for large boards.
- **Real-Time Multiplayer:** (In Progress) Bi-directional game synchronization using Socket.io.
- **Custom Theming System:** 6+ premium themes (Neon, Retro, Deep Space, etc.) using CSS variables for high-performance rendering.
- **Game State Persistence:** Full Undo/Redo history and session recovery via Zustand and local storage.

## 🛠️ The Tech Stack

- **Frontend:** React, Tailwind CSS, Zustand (State Management), React Router.
- **Backend:** Node.js, Express, Socket.io (Real-time events).
- **Database:** MongoDB (Player profiles & Global Leaderboards).
- **Testing:** Jest & React Testing Library.

## 📁 Project Structure

```text
Nexus-TTT/
├── client/           # React Frontend (Vite)
│   ├── src/store/    # Zustand Logic
│   └── src/utils/    # Game & AI Engines
├── server/           # Node.js Backend (Socket.io)
│   ├── sockets/      # Real-time Game Logic
│   └── models/       # Database Schemas
└── README.md
