docker rm -f $(docker ps --format '{{.ID}}.{{.Names}}' -a | grep 'netlify'| sed 's/\..*$//')
docker buildx build -t connect-netlify:latest -f ./tests/Dockerfile.connect-netlify .
docker run --name netlify -d -p 8888:8888 connect-netlify
