FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY ./server package-lock.json /app/server/

EXPOSE 5001

CMD ["npm", "run", "server"]