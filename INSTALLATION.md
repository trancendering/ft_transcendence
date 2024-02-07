# Getting Started

## Prerequisites
Before diving into the setup, ensure you have the following installed on your system:
- Docker
- Docker Compose

You will also need to set up environment variables for both the backend and frontend components of the project.

## Setting up .env Files
To configure your environment variables correctly, follow these steps:

1. **Reference .env.example Files**: We have provided `.env.example` files in both the [srcs/](file:///Users/leetaekwon/Documents/coding/trans/Makefile#3%2C14-3%2C14) and `srcs/frontend/` directories to guide you.
   
2. **Create .env Files**: You need to create `.env` files based on the examples provided:
   - For backend settings: `/srcs/.env`
   - For frontend settings: `/srcs/frontend/.env`

3. **Configure OAuth for Authentication**:
   - Fill in the [CLIENT_ID](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#10%2C28-10%2C28), [CLIENT_SECRET](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#10%2C42-10%2C42), and [REDIRECT_URI](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#13%2C1-13%2C1) with your Ecole 42 OAuth credentials.
   - If you haven't set up an OAuth app yet, register a new app at [42 OAuth Applications](https://profile.intra.42.fr/oauth/applications/new) to obtain these credentials.

4. **Local Testing**:
   - Ensure the [REDIRECT_URI](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#13%2C1-13%2C1) and [MAIN_URL](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#14%2C1-14%2C1) are set to your local environment, typically [https://localhost](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#13%2C16-13%2C16) or a similar local domain.

5. **Blockchain Configuration** (Optional):
   - The [WEB3_PROVIDER](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#27%2C1-27%2C1), [MY_ADDRESS](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#28%2C1-28%2C1), and [PRIVATE_OWNER_KEY](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#29%2C1-29%2C1) are necessary for blockchain interactions. If you're not using these features, these can be left unset.

6. **Django and Additional Settings**:
   - The [DJANGO_SECRET_KEY](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#22%2C1-22%2C1) is crucial for Django's security. If not provided, ensure your setup generates one for you.
   - Adjust the database settings ([DB_USER](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#2%2C1-2%2C1), [DB_PASSWORD](file:///Users/leetaekwon/Documents/coding/trans/srcs/.env.example#3%2C1-3%2C1), etc.) as needed to match your PostgreSQL setup.

## Installation

Follow these steps to get your environment up and running:

1. **Clone the Repository**:
   ```shell
   git clone https://github.com/trancendering/ft_transcendence.git
   ```

2. **Navigate to the Project Directory**:
   ```shell
   cd ft_transcendence
   ```

3. **Build and Run the Containers**:
   ```shell
   make all
   ```
   This command utilizes the Makefile to build the Docker images and start the containers as defined in the `docker-compose.yml` file.

### Accessing the Game
- Once the containers are up, you can access the game by navigating to `https://localhost` in your web browser.

### Additional Tips

- **Troubleshooting**: If you encounter issues with containers not starting correctly, check the Docker logs for errors and ensure all environment variables are correctly set.

This guide should help you get started with the project setup. For more detailed information, refer to the specific README files within each directory.
