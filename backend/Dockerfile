# Stage 1 — build
FROM node:20-alpine AS builder
WORKDIR /app

# Outils de compilation pour les modules natifs (argon2)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Génère le client Prisma dans node_modules/.prisma/client
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Supprime les devDependencies avant la copie dans le runner
RUN npm prune --omit=dev

# Stage 2 — runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# node_modules pruned : binaires natifs compilés + client Prisma inclus
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/index.js"]
