FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install firebase && npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]