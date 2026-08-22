FROM node:22-slim
WORKDIR /app

RUN apt-get update && apt-get install -y libcurl4 openssl

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "start"]