FROM python:3.12.1-slim-bullseye

COPY . /game/
WORKDIR /game/
# for postgresql
RUN apt-get update && apt-get install -y libpq-dev postgresql-client gcc


RUN pip install -r requirements.txt;


EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
