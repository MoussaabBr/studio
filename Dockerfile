# Use the official Node.js image as a base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code to the working directory
COPY . .

# Expose the port your application listens on (adjust as needed)
EXPOSE 3000

# Define the command to run your application
#CMD ["node", "server.js"]
