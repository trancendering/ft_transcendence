# Getting Started

## Prerequisites
Before you begin, ensure you have the following installed:
- Docker
- Docker Compose

Additionally, you will need to configure environment variables:
- **Directories**:
  - `/srcs/.env` for backend settings
  - `/srcs/frontend/.env` for frontend settings

- **Contents**:
  - Authentication credentials for Ecole 42 OAuth, including the client ID, secret key, and redirection URI.
  - Your local host IP address for local testing.

## Setting up .env Files
1. We have provided **.env.example** files as a reference.
2. You need to create two .env files:
   - `/srcs/.env`
   - `/srcs/frontend/.env`
3. Fill in the Ecole 42 OAuth variables (client ID, key, redirection URI).
4. If you don't have ouath app, enter [42 OAuth app ](https://profile.intra.42.fr/oauth/applications/new)and register new App
5. For local hosting, ensure your URI matches the localhost.
6. **Note**: If you prefer to play without Ecole 42 OAuth, you can skip this step by visiting the specified repository.
7. Additional configurations like the Django secret key and blockchain settings are optional, except for the default variables.

## Installation

1. Clone the repository:
```shell
https://github.com/trancendering/ft_transcendence.git
```

2. Navigate to the project directory:
```shell
cd ft_transcendence
```

3. Build and run the containers:
```shell
make
```


### Server run
We have prepared a Makefile to streamline the installation process.
Use the Makefile to execute our `ft_transcendence` setup efficiently.

```

make

```

### Accessing the Game
- After the containers are operational, access the game at `https://localhost`.
