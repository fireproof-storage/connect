docker rm -f $(docker ps --format '{{.ID}}.{{.Names}}' -a | grep 'cloud'| sed 's/\..*$//')
docker buildx build -t fireproof-cloud:latest --progress plain --no-cache -f ./tests/Dockerfile.connect-cloud .
# --no-cache-filter
docker run --name cloud \
   -e ACCESS_KEY_ID="minioadmin" \
   -e SECRET_ACCESS_KEY="minioadmin" \
   -e BUCKET_NAME="testbucket" \
   -e STORAGE_URL="http://localhost:9000/testbucket" \
   -e FP_STACK=fp \
   -e FP_DEBUG=Fireproof \
   -d -p 1968:1968 fireproof-cloud


