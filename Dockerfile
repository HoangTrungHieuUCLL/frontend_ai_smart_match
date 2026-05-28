FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "if [ ! -x node_modules/.bin/next ]; then npm ci; fi && npm run dev -- --hostname 0.0.0.0"]