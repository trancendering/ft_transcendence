FROM python:3.12.1-slim-bullseye

# COPY . /game/
WORKDIR /game/
# for postgresql
RUN apt-get update && apt-get install -y libpq-dev postgresql-client gcc openssl

COPY tools/docker-entrypoint.sh /docker-entrypoint.sh

COPY requirements.txt /game/    
RUN pip install -r requirements.txt;


EXPOSE 443

CMD ["/docker-entrypoint.sh"]
