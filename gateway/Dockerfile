FROM tiangolo/uwsgi-nginx-flask:python3.5

COPY requirements.txt /tmp

ENV STATIC_INDEX 1

RUN pip install -U pip

RUN pip install -r /tmp/requirements.txt

COPY ./app /app


