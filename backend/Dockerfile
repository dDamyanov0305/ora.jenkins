# Use the official Docker image as the base image
FROM docker:dind

# Install necessary packages (including Ubuntu utilities and Node.js)
RUN apk add --no-cache \
    bash \
    curl \
    ca-certificates \
    tar \
    zip \
    unzip \
    gzip \
    openssh-client \
    nodejs \
    npm \
    && rm -rf /var/cache/apk/*

# Set environment variables
ENV DOCKER_TLS_CERTDIR=/certs

WORKDIR /home/server

COPY . .

RUN npm install

EXPOSE 5000

# Default command to run when the container starts
CMD ["npm", "start"]
