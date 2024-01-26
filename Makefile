
DOCKER_COMPOSE := docker compose

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
up:
	make makeDirs
	$(DOCKER_COMPOSE) -f srcs/docker-compose.yml up -d --build

# 컨테이너 인스턴스 삭제
down:
	$(DOCKER_COMPOSE) -f srcs/docker-compose.yml down

# 컨테이너 재시작
restart:
	$(DOCKER_COMPOSE) -f srcs/docker-compose.yml restart

# 컨테이너 중지
stop:
	$(DOCKER_COMPOSE) -f srcs/docker-compose.yml stop

# 이미지 빌드
build:
	$(DOCKER_COMPOSE) -f srcs/docker-compose.yml build

# 인스턴스와 이미지 및 네트워크 등 삭제
clean:
	make down
	docker system prune -f --all

# 로컬 저장소를 포함하여 전부 삭제
fclean:
	make clean
	docker builder prune -f
	sudo rm -rf $(DATA_DIR)
	docker volume rm $$(docker volume ls -q)
# $$는 $를 이스케이프하기 위한 것으로, 쉘에서 $를 쓴 것과 동일함

# 컨테이너 로그 확인
logs:
	$(DOCKER_COMPOSE) -f srcs/docker-compose.yml logs $(SERVICE)

# 특정 컨테이너의 bash실행
bash:
	docker exec -it $(SERVICE) /bin/bash

# 전체 도커 모니터링
show: 
	docker ps -a | tail -n +1; echo
	docker images | tail -n +1; echo
	docker network ls | tail -n +1; echo
	docker volume ls | tail -n +1; echo

# 바인딩할 로컬 디렉토리 생성
makeDirs:
	mkdir -p $(DATA_DIR)/nginx > /dev/null 2>&1

.PHONY: all up down restart stop build clean fclean bash logs show makeDirs