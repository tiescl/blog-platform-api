FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . /app
CMD ["npm", "run", "dev"]
