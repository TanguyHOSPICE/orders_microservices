FROM node:20-alpine

# Installer les outils pour compiler les packages natifs
RUN apk add --no-cache python3 g++ make git

WORKDIR /usr/src/app

# Installer pnpm globalement
RUN npm install -g pnpm

# Copier package.json et lockfile
COPY package.json pnpm-lock.yaml* ./

# Installer toutes les dépendances
RUN pnpm install

# Copier tout le code
COPY . .

EXPOSE 3001

CMD ["pnpm", "run", "start:dev"]
