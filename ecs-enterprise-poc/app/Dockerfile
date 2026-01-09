# Stage 1: Build React client
FROM node:18-alpine AS client-builder
WORKDIR /usr/src/app/client
COPY client/package.json client/package-lock.json* ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:18-alpine
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install --only=production

COPY --from=client-builder /usr/src/app/client/dist ./client/dist
COPY server.js .

ENV PORT=80
EXPOSE 80

CMD ["npm", "start"]
