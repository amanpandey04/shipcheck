FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm ci

COPY . .

RUN DATABASE_URL="postgresql://release_user:release_password@localhost:5432/release_checklist?schema=public" npx prisma generate --config ./prisma7.config.js

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --config ./prisma7.config.js && npm start"]