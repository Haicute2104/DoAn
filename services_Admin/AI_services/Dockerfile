FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (có thể override bằng env trong docker-compose)
ARG PORT=5012
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["npm", "start"]