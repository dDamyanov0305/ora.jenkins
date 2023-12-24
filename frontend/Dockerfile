# Use an official Node.js runtime as a base image
FROM node:16

# Set the working directory in the container
WORKDIR /home/client

# Copy the client files to the working directory
COPY . .

# Install app dependencies
RUN npm install

# RUN npm audit fix --force

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
