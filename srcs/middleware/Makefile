
NGINX_CONTAINER_NAME = my-nginx-container
NGINX_PORT = 443

all: build run

build:
	docker build -t nginx-custom .

run:
	docker run -d --env-file=.env --name $(NGINX_CONTAINER_NAME) -p $(NGINX_PORT):$(NGINX_PORT) nginx-custom

clean:
	docker stop $(NGINX_CONTAINER_NAME) || true
	docker rm $(NGINX_CONTAINER_NAME) || true

fclean: clean
	docker rmi nginx-custom || true

re: fclean all

exec:
	docker exec -it $(NGINX_CONTAINER_NAME) /bin/bash
.PHONY: all build run clean fclean rem
