
DOCKER_COMPOSE := docker compose
YML_PATH = ./srcs/docker-compose.yml
ifeq ($(shell uname), Darwin)
# macOS인 경우
	DATA_DIR := /Users/${USER}/docker-data
else
# Linux인 경우
	DATA_DIR := /home/$(USER)/data
endif

# 기본 실행
all: up

# 이미지 빌드 후 컨테이너 인스턴스 생성
	

up: webpack
	make makeDirs
	$(DOCKER_COMPOSE) -f $(YML_PATH) up --build

# webpack 생성 및 복사 front src만 바뀌었을 때, webpack만 다시 빌드하고, nginx 재시작.
webpack :
	make -C ./srcs/frontend/ all
	rm -rf ./srcs/middleware/dist
	cp -r ./srcs/frontend/dist ./srcs/middleware/
	$(DOCKER_COMPOSE) -f $(YML_PATH) restart middleware

# 컨테이너 인스턴스 삭제
down:
	$(DOCKER_COMPOSE) -f $(YML_PATH) down

# 컨테이너 재시작
restart:
	$(DOCKER_COMPOSE) -f $(YML_PATH) restart

# 컨테이너 중지
stop:
	$(DOCKER_COMPOSE) -f $(YML_PATH) stop

# 이미지 빌드
build:
	$(DOCKER_COMPOSE) -f $(YML_PATH) build


# TODO: 필요한 도커 이미지만 삭제하도록, 암살 가능성 농후함
# 인스턴스와 이미지 및 네트워크 등 삭제
clean:
	make down
	make -C ./srcs/frontend/ 
	rm -rf ./srcs/middleware/dist
	docker system prune -f --all

# TODO: 필요한 도커 이미지만 삭제하도록, 암살 가능성 농후함
# 로컬 저장소를 포함하여 전부 삭제
fclean: 
	make clean
	docker builder prune -f
	sudo rm -rf $(DATA_DIR)
	docker volume rm $$(docker volume ls -q)
# $$는 $를 이스케이프하기 위한 것으로, 쉘에서 $를 쓴 것과 동일함

# 컨테이너 로그 확인
logs:
	$(DOCKER_COMPOSE) -f $(YML_PATH) logs $(SERVICE)

# 특정 컨테이너의 bash실행
bash:
	docker exec -it $(SERVICE) /bin/bash

# 전체 도커 모니터링
show: 
	docker ps -a | tail -n +1; echo
	docker images | tail -n +1; echo
	docker network ls | tail -n +1; echo
	docker volume ls | tail -n +1; echo

re : clean all


# 바인딩할 로컬 디렉토리 생성
makeDirs:
# mkdir -p $(DATA_DIR)/nginx > /dev/null 2>&1

.PHONY: all up down restart stop build clean fclean bash logs show makeDirs