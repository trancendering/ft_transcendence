# ft_transcendence



## Overview


![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)  ![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js&logoColor=white) ![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white) ![Webpack](https://img.shields.io/badge/Webpack-8DD6F9?logo=webpack&logoColor=black) ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socket.io&logoColor=white) 

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=yellow) ![Django REST Framework](https://img.shields.io/badge/Django_REST_Framework-092E20?logo=django&logoColor=white) ![Daphne](https://img.shields.io/badge/Daphne-512BD4?logo=django&logoColor=white)  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white) 



 ![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white)  ![OAuth](https://img.shields.io/badge/OAuth-4285F4?logo=oauth&logoColor=white)
![HTTPS](https://img.shields.io/badge/HTTPS-565656?logo=letsencrypt&logoColor=white) ![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=white) ![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white) ![Docker Compose](https://img.shields.io/badge/Docker_Compose-1DA1F2?logo=docker&logoColor=white)


This project is the final assignment of the 6th circle at Ecole 42, named ft_transcendence. Also, This project is a modern take on the classic Pong game, featuring a Django-powered backend and a vanilla JavaScript frontend. It supports remote pingpong game, real-time interactions, and dynamic content based on user preferences.



## Screen
<div align="center">
	<img width="400" alt="스크린샷 2024-02-07 오후 2 26 15" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/72660f21-0932-4b8d-ba43-3d6fe6ae4482">

  <img width="400" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/2e92e6b2-dacc-4b0c-b4f4-d545af8bcae8">
  <img width="400" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/03939448-3dc9-401a-b178-dd9e51157d68">
<img width="400" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/d461cec6-cf7d-424a-9268-e0dba093fcfc">	
  <img width="400" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/033facb1-f18d-4e81-ae51-d315052dd7d4">
  <img width="400" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/ac2b601c-7b3b-4f88-8870-e786d9724371">
  <img width="400" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/511433d2-af9e-44c2-a299-faec1cf02e71">
  <img width="400" alt="스크린샷 2024-02-07 오후 2 34 15" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/aae0aff8-93fd-44f5-a0f6-ef6a18e2b853">


</div>

## Features

- **Web**
	- *Major module*: Use a framework as backend :white_check_mark:
	- *Minor module*: Use a front-end framework or toolkit :white_check_mark:
	- *Minor module*: Use a database for the backend :white_check_mark:
	- *Major module*: Store the score of a tournament in the Blockchain :white_check_mark:
- **User Management**
	- *Major module*: Implementing a remote authentication :white_check_mark:
- **Gameplay and User Experience**
	- *Major module*: Remote players :white_check_mark:
	- *Minor module*: Game customization options :white_check_mark:

- **Graphics**
	- *Major module*: Use advanced 3D techniques :white_check_mark:
   
- **Accessibility**
	- *Minor module*: Multiple language support :white_check_mark:
   


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
