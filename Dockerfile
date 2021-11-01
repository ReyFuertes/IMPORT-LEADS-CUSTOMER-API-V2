FROM node:12.18-alpine
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm rm -rf node_modules/ && rm package-lock.json
RUN npm i -g @nestjs/cli
RUN npm install rimraf
RUN npm install --only=production
COPY . .
EXPOSE 80
CMD ["npm", "start"]