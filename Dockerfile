FROM quay.io/ukhomeofficedigital/nodejs-base:v6.9.1

RUN adduser -u 1000 app

USER 1000
WORKDIR /home/app

COPY package.json ./
RUN npm install --no-optional

COPY . .
RUN npm test && \
    npm prune --production

EXPOSE 8080
CMD ["npm", "start"]

