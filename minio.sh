docker rm $(docker ps --format '{{.ID}}.{{.Names}}' -a | grep 'minio'| sed 's/\..*$//')

docker run -d -p 9000:9000 --name minio  \
                     -e "MINIO_ACCESS_KEY=minioadmin"  \
                     -e "MINIO_SECRET_KEY=minioadmin"  \
                     -v /tmp/data:/data  \
                     -v /tmp/config:/root/.minio  \
                     minio/minio server /data 

export AWS_ACCESS_KEY_ID=minioadmin
export AWS_SECRET_ACCESS_KEY=minioadmin
export AWS_EC2_METADATA_DISABLED=true

sleep 5
aws --endpoint-url http://127.0.0.1:9000/ s3 mb s3://testbucket  

export          AWS_S3_BUCKET=testbucket
export          AWS_S3_ACCESS_KEY=minioadmin
export          AWS_S3_SECRET_KEY=minioadmin
export          AWS_S3_ENDPOINT=http://127.0.0.1:9000


