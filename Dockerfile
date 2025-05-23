# Is the latest version of node.js
FROM node:latest

# Install pnpm globally
RUN npm install -g pnpm 
# The WORKDIR instruction sets the working directory for any RUN, CMD, ENTRYPOINT, COPY and ADD instructions that follow it in the Dockerfile.
  WORKDIR /usr/src/app
# copy folders and files from the host to the container
  COPY package.json pnpm-lock.yaml ./
# Run the pnpm install in the container
  RUN pnpm install
# Copy the rest of the files to the container
  COPY . .