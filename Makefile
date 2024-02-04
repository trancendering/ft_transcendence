
DOCKER_COMPOSE := docker compose
YML_PATH = ./srcs/docker-compose.yml
DATEBASE_DIR=./srcs/database

# 기본 실행
all: up

# 이미지 빌드 후 컨테이너 인스턴스 생성
	

up:
	if [ ! -d $(DATEBASE_DIR) ]; then mkdir -p $(DATEBASE_DIR); fi
	$(DOCKER_COMPOSE) -f $(YML_PATH) up -d --build


# webpack 생성 및 복사 front src만 바뀌었을 때, webpack만 다시 빌드하고, nginx 재시작.
webpack :
	$(DOCKER_COMPOSE) -f $(YML_PATH) restart frontend

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

clean_db:
	rm -rf ./srcs/database

# TODO: 필요한 도커 이미지만 삭제하도록, 암살 가능성 농후함
# 인스턴스와 이미지 및 네트워크 등 삭제
clean:
	$(DOCKER_COMPOSE) -f $(YML_PATH) down -v

# TODO: 필요한 도커 이미지만 삭제하도록, 암살 가능성 농후함
# 로컬 저장소를 포함하여 전부 삭제

fclean: clean_db
	$(DOCKER_COMPOSE) -f $(YML_PATH) down -v --rmi all 	

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


.PHONY: all up down restart stop build clean fclean bash logs show 