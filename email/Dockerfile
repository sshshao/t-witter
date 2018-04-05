FROM python:3

WORKDIR /email_service

ADD . /email_service

RUN pip install -r requirements.txt

CMD ["python3", "email_sender.py"]