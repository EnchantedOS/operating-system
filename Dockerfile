FROM node:latest
RUN corepack enable
COPY . ./app
WORKDIR /app
RUN pnpm i
RUN pnpm run build
CMD [ "pnpm", "run", "preview" ]
