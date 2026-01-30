# Dockerfile.microservice (dev)
FROM node:20-alpine

WORKDIR /usr/src/app

# Copier package.json et lockfile
COPY package.json pnpm-lock.yaml* ./

# Installer pnpm
RUN npm install -g pnpm

# Installer les dépendances
RUN pnpm install

# Copier tout le code
COPY . .

# Exposer le port si nécessaire (optionnel, pour microservices HTTP)
EXPOSE 3001

# Lancer le service (à adapter selon ton script dev)
CMD ["pnpm", "run", "dev"]