
CONTAINER_NAME = webpack
IMAGE_NAME = webpack
NGINX_PORT = /Users/leetaekwon/Documents/coding/trans/srcs/frontend

DOCKER_RUN = docker run -v /app/node_modules -v .:/app -d --env-file=.env --name 

all: build run

build:
	docker build -t $(IMAGE_NAME) .

run:
	$(DOCKER_RUN)$(CONTAINER_NAME) $(IMAGE_NAME)

port :
	$(DOCKER_RUN)$(CONTAINER_NAME) -p $(NGINX_PORT):$(NGINX_PORT) $(IMAGE_NAME)


clean:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

fclean: clean
	docker rmi $(IMAGE_NAME) || true

re: fclean all

exec:
	docker exec -it $(CONTAINER_NAME) /bin/bash
.PHONY: all build run clean fclean rem
