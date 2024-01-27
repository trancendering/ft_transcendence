FROM debian:bullseye-slim

RUN apt-get update && \
    apt-get install -y nginx openssl dumb-init

COPY ./conf/default.conf /etc/nginx/conf.d/default.conf
COPY tools/docker-entrypoint.sh /docker-entrypoint.sh
COPY ./static /var/www/html/static/

RUN chmod +x /docker-entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/docker-entrypoint.sh"]
