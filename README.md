# Pong Game Project

## Overview
This project is a modern take on the classic Pong game, featuring a Django-powered backend and a vanilla JavaScript frontend. It supports multiplayer functionality, real-time interactions, and dynamic content based on user preferences.

## Tech Stack

- **Frontend**: Vanilla JavaScript, Bootstrap, SCSS/CSS, Webpack
  - **JavaScript**: Core programming language for dynamic content.
  - **HTML/CSS**: Markup and styling of web pages.
  - **Webpack**: Module bundler for JavaScript applications.
  - **SASS**: CSS preprocessor for enhanced styling capabilities.

- **Backend**: Django, PostgreSQL
  - **Django**: Python-based web framework for the backend logic.
  - **PostgreSQL**: Database for persistent data storage.
  - **Django Channels**: For WebSocket communication.
  - **Django REST Framework**: For building RESTful APIs.

- **Middleware**: Nginx
  - **Nginx**: Web server and reverse proxy for routing requests and serving static files.

- **Infrastructure**
  - **Docker**: Containerization platform for encapsulating components.
  - **Docker Compose**: Tool for defining and running multi-container Docker applications.

- **Development Tools**
  - **EditorConfig**: Helps maintain consistent coding styles.
  - **Makefile**: Automates the build and deployment process.

- **Blockchain**
  - **Web3.js**: Ethereum JavaScript API for interacting with the Ethereum blockchain.
  - **Solidity**: Programming language for writing smart contracts.

- **Authentication**
  - **OAuth**: Open standard for access delegation, used for user authentication.

- **Real-Time Communication**: Socket.IO

- **Containerization**: Docker

## Features
- Multiplayer gameplay
- Real-time game updates
- User authentication and profile management
- Internationalization support
- 3D game rendering

## Getting Started

### Prerequisites
- Docker
- Docker Compose
- .env
	- directory
		- /srcs/.env
		- /srcs/frontend/.env
	- contents
		- Ecole 42 AOuth 
		- Host IP 

### IF you want to play without 42 OAUTH 
- ENTER THIS REPO

### Installation
1. Clone the repository:
```shell
git clone <repository-url>
```

2. Navigate to the project directory:
```shell
cd <project-directory>
```

3. Build and run the containers:
```shell
make
```

### Accessing the Game
- The game can be accessed at `http://localhost:8080` after the containers are up and running.
# Project Architecture Overview
<div style="text-align: center;">
    <img width="472" alt="스크린샷 2024-02-07 오후 1 38 20" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/adcebf3e-ecc4-4828-8f4d-d424122dbfff">
</div>

## Frontend

- **Framework/Library**: The frontend is built using vanilla JavaScript, leveraging several libraries for UI components and state management.
- **Single Page Application (SPA)**: The frontend implements SPA architecture for smooth user experiences without page reloads.
- **State Management**: Implements a custom state management system with a Store pattern, similar to Redux or Vuex, located in `srcs/frontend/src/store/index.js`.
- **Styling**: Utilizes Bootstrap for UI components and custom styles with CSS and SCSS. The project employs Webpack to compile SCSS to CSS.
- **Module Bundler**: Webpack is configured for bundling JavaScript modules, as seen in `srcs/frontend/webpack.config.js`.
- **Development Tools**: Docker is used for containerization, evident from the `Dockerfile` and `docker-compose.yml` for service orchestration.
- **Internationalization**: Features a custom implementation for language selection and dynamic text rendering based on the selected language.
- **3D Rendering**: Three.js is used for 3D graphics, especially in the game canvas component (`srcs/frontend/src/views/components/game/gameCanvas.js`).

## Middleware

- **Reverse Proxy**: Nginx serves as a reverse proxy, routing requests to the appropriate backend service, configured in `srcs/middleware/conf/default.conf`.
- **SSL/TLS**: Nginx is configured to use SSL/TLS for secure HTTP communication, as shown in `srcs/middleware/conf/default.conf.`

## Backend

- **Framework**: The backend is powered by Django, a Python-based web framework, with settings and URL configurations in `srcs/game/config/settings.py` and `srcs/game/config/urls.py`.
- **Database**: PostgreSQL is used for data storage, as specified in the `docker-compose.yml` configuration for the database service.
- **WebSocket Communication**: [Socket.IO](http://socket.io/) is employed for real-time bidirectional event-based communication, indicated by the use of `socket.io-client` in `srcs/frontend/src/store/actions/gameActionHandler.js`.
- **Authentication with 42 OAuth** : Implemented for user authentication, allowing login via external providers. The logic is encapsulated in `srcs/game/users/views.py`, particularly in the OAuthCallbackAPIView.
- **Blockchain Integration** : Smartcontract with Ethereum blockchain for secure tournament log recording and retrieval.
- **SSL/TLS**: Daphneis configured to use SSL/TLS for secure HTTP communication, as shown in `srcs/game/tool/docker_entrypoint.sh`

## Deployment and Development
<div style="text-align: center;">
	<img width="470" alt="스크린샷 2024-02-07 오후 1 38 36" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/e66c41b5-ad92-459a-8533-96d8c1301843">
</div>


- **Containerization**: Docker facilitates the creation of containerized environments for both frontend and backend services, as detailed in the `Dockerfile` and `docker-compose.yml`.
