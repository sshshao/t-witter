export NAMESPACE=default && \
export DOCKER_REPOSITORY=richackard && \
export RABBITMQ_REPLICAS=1 && \
export RABBITMQ_DEFAULT_USER=guest && \
export RABBITMQ_DEFAULT_PASS=guest && \
export RABBITMQ_ERLANG_COOKIE=secret && \
export RABBITMQ_EXPOSE_MANAGEMENT=TRUE && \
export RABBITMQ_MANAGEMENT_SERVICE_TYPE=LoadBalancer && \
export RABBITMQ_HA_POLICY='{\"ha-mode\":\"all\"}' && \
export RABBITMQ_LOG_LEVEL=info && \
export RABBITMQ_ADDITIONAL_YAML="" && \
export SUDO="" && \
make deploy