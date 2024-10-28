docker rm -f $(docker ps --format '{{.ID}}.{{.Names}}' -a | grep 'partykit'| sed 's/\..*$//')
docker buildx build -t connect-partykit:latest -f ./tests/Dockerfile.connect-partykit .
docker run --name partykit -d -p 1999:1999 connect-partykit
