FROM node:20-alpine

# Installer les outils pour compiler les packages natifs
RUN apk add --no-cache python3 g++ make git


# Installer pnpm globalement
RUN npm install -g pnpm @nestjs/cli

  WORKDIR /usr/src/app

# Installer toutes les dépendances
# Copier package.json et lockfile
  COPY package.json pnpm-lock.yaml* ./

  RUN pnpm install --frozen-lockfile

# Copier tout le code
  COPY . .

