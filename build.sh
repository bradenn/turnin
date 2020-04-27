docker build -t turnin-gateway .
docker tag turnin-gateway bradenn/turnin-gateway:1.0.0
docker run -p 0.0.0.0:3000:3000/tcp bradenn/turnin-gateway:1.0.0