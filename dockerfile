FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY . .
ENV CI=true
RUN pnpm install
EXPOSE 3333

CMD ["pnpm", "run", "start:dev"]