
FROM node:14.16-buster-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000/tcp
CMD npm run serve