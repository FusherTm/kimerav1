FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Next.js dev server port (mapped to host in compose)
EXPOSE 3002
CMD ["npm", "run", "dev"]
