# FASE 1: "base" (A nossa fundação comum)
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /usr/src/app

# FASE 2: "development" – Instala dependências para desenvolvimento
FROM base AS development

# Copia da máquina para o container
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# FASE 3: "prod-dependencies" – Instala as dependências de produção
FROM base AS prod-dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# FASE 4: "builder" – Usada para o build de produção.
FROM development AS builder

# Copia todos arquivos da máquina para o container
COPY . .
RUN pnpm run build

# FASE 5: "production" – Final, sem dependencias desnecessárias
FROM base AS production
ENV NODE_ENV=production

# Copia o 'dist' da fase builder
COPY --from=builder /usr/src/app/dist ./dist

# Copia o 'node_modules' (SÓ de produção) da fase 'prod-dependencies'
COPY --from=prod-dependencies /usr/src/app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main.js"]