FROM tiangolo/uwsgi-nginx-flask:python3.5

WORKDIR /app

ENV UWSGI_INI /app/uwsgi.ini

ENV STATIC_INDEX 1

COPY requirements.txt /tmp

RUN pip install -U pip

RUN pip install -r /tmp/requirements.txt

COPY ./app /app


