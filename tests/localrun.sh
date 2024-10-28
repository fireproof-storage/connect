pnpm run prepare-s3-test
docker buildx build -t fireproof-ucan:latest -f ./Dockerfile.fp-ucan .
docker run -d -p 8787:8787  fireproof-ucan:latest
pnpm run setup-gateway-servers &

docker buildx build -t connect-partykit:latest -f ./Dockerfile.connect-partykit .
docker run -d -p 1999:1999 connect-partykit

docker buildx build -t connect-netlify:latest -f ./Dockerfile.connect-netlify .
docker run -d -p 8888:8888 connect-netlify
