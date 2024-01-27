# Docker image name
IMAGE_NAME = mygame

# Docker container name
CONTAINER_NAME = mygame-container

# Docker run command
DOCKER_RUN = docker run -p 8000:8000 --name $(CONTAINER_NAME) $(IMAGE_NAME)

all: build run

build:
	docker build -t $(IMAGE_NAME) .

run:
	$(DOCKER_RUN)

clean:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

fclean: clean
	docker rmi $(IMAGE_NAME) || true

re: fclean all
