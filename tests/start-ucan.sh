docker rm -f $(docker ps --format '{{.ID}}.{{.Names}}' -a | grep 'ucan'| sed 's/\..*$//')
docker buildx build -t fireproof-ucan:latest -f ./tests/Dockerfile.fp-ucan .
docker run --name ucan -d -p 8787:8787 fireproof-ucan
