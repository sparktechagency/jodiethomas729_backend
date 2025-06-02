FROM node:20

WORKDIR /app
 
RUN npm install -g nodemon
 
COPY package*.json ./
 
RUN npm install --legacy-peer-deps
 
COPY . .
 
EXPOSE 5007
 
CMD ["npm", "run", "dev"]
