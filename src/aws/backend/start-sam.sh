#!/bin/sh
cd src/aws/backend || exit 1

mkdir -p ../../../dist/aws-backend
cp * ../../../dist/aws-backend

cd ../../../dist/aws-backend || exit 1

sam build

sam local start-api --docker-network tests_default --port 8017


