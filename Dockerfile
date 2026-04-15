FROM tiger AS initial

FROM ubuntu:noble

COPY script/devel/payload.tgz /tmp

RUN /usr/bin/apt update && \
    /usr/bin/apt install -y perl cpanminus carton build-essential file adduser passwd && \
    /usr/bin/rm -rf /var/lib/apt/lists/* && \
    /usr/bin/mkdir /tiger && \
    /usr/bin/tar -xvf /tmp/payload.tgz -C /tiger && \
    cd /tiger && \
    /usr/bin/cpanm -L local --installdeps --notest --quiet . && \
    /usr/bin/rm -f /tmp/payload.tgz

ENV MOJO_PORT=8080

EXPOSE ${MOJO_PORT}

CMD ["/tiger/entrypoint.sh"]
