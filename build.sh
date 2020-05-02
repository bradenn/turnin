docker build -t turnin-gateway .
docker tag turnin-gateway bradenn/turnin-gateway:2.0.4
docker run -p 0.0.0.0:3000:3000/tcp bradenn/turnin-gateway:2.0.4