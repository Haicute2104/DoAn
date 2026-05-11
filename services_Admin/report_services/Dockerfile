FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

ARG PORT=5014
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["npm", "start"]
