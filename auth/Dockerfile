FROM python:3

WORKDIR /auth_service

ADD . /auth_service

RUN pip install -r requirements.txt

CMD ["python3", "-u", "auth.py"]