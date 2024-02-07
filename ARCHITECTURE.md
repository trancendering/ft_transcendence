# Project Architecture Overview

<div style="text-align: center;">
    <img width="472" alt="스크린샷 2024-02-07 오후 1 38 20" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/adcebf3e-ecc4-4828-8f4d-d424122dbfff">
</div>

## Frontend

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js&logoColor=white) ![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white) ![Webpack](https://img.shields.io/badge/Webpack-8DD6F9?logo=webpack&logoColor=black) ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socket.io&logoColor=white)


- **Framework/Library**: The frontend is built using vanilla JavaScript, leveraging several libraries for UI components and state management.
- **Single Page Application (SPA)**: The frontend implements SPA architecture for smooth user experiences without page reloads.
- **State Management**: Implements a custom state management system with a Store pattern, similar to Redux or Vuex, located in `srcs/frontend/src/store/index.js`.
- **Styling**: Utilizes Bootstrap for UI components and custom styles with CSS and SCSS. The project employs Webpack to compile SCSS to CSS.
- **Module Bundler**: Webpack is configured for bundling JavaScript modules, as seen in `srcs/frontend/webpack.config.js`.
- **Development Tools**: Docker is used for containerization, evident from the [Dockerfile](file:///Users/leetaekwon/Documents/coding/trans/srcs/docker-compose.yml#10%2C25-10%2C25) and `docker-compose.yml` for service orchestration.
- **Internationalization**: Features a custom implementation for language selection and dynamic text rendering based on the selected language.
- **3D Rendering**: Three.js is used for 3D graphics, especially in the game canvas component (`srcs/frontend/src/views/components/game/gameCanvas.js`).

## Middleware 

![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white) ![HTTPS](https://img.shields.io/badge/HTTPS-565656?logo=letsencrypt&logoColor=white)

- **Reverse Proxy**: Nginx serves as a reverse proxy, routing requests to the appropriate backend service, configured in `srcs/middleware/conf/default.conf`.
- **SSL/TLS**: Nginx is configured to use SSL/TLS for secure HTTP communication, as shown in `srcs/middleware/conf/default.conf.`

## Backend

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=yellow) ![Django REST Framework](https://img.shields.io/badge/Django_REST_Framework-092E20?logo=django&logoColor=white) ![Daphne](https://img.shields.io/badge/Daphne-512BD4?logo=django&logoColor=white) ![HTTPS](https://img.shields.io/badge/HTTPS-565656?logo=letsencrypt&logoColor=white) ![OAuth](https://img.shields.io/badge/OAuth-4285F4?logo=oauth&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white) ![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=white) ![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)

- **Framework**: The backend is powered by Django, a Python-based web framework, with settings and URL configurations in `srcs/game/config/settings.py` and `srcs/game/config/urls.py`.
- **Database**: PostgreSQL is used for data storage, as specified in the `docker-compose.yml` configuration for the database service.
- **WebSocket Communication**: [Socket.IO](http://socket.io/) is employed for real-time bidirectional event-based communication, indicated by the use of `socket.io-client` in `srcs/frontend/src/store/actions/gameActionHandler.js`.
- **Authentication with 42 OAuth** : Implemented for user authentication, allowing login via external providers. The logic is encapsulated in `srcs/game/users/views.py`, particularly in the OAuthCallbackAPIView.
- **Blockchain Integration** : Smartcontract with Ethereum blockchain for secure tournament log recording and retrieval.
- **SSL/TLS**: Daphneis configured to use SSL/TLS for secure HTTP communication, as shown in `srcs/game/tool/docker_entrypoint.sh`.



- **Blockchain Integration**: Utilizes Ethereum blockchain and Solidity for smart contracts, ensuring secure and transparent tournament logs.

## Deployment and Development

![Docker Compose](https://img.shields.io/badge/Docker_Compose-1DA1F2?logo=docker&logoColor=white)

<div style="text-align: center;">
	<img width="470" alt="스크린샷 2024-02-07 오후 1 38 36" src="https://github.com/trancendering/Transcendence_Backend/assets/84652799/e66c41b5-ad92-459a-8533-96d8c1301843">
</div>

- **Containerization**: Docker and Docker Compose are pivotal in creating isolated environments for both the frontend and backend, streamlining development and deployment processes. The `Dockerfile` and `docker-compose.yml` files detail the container configurations.














