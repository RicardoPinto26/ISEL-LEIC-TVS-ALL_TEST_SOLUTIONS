FROM node:alpine
WORKDIR /home/node/webapp
COPY README.md .
COPY images/* ./images
USER node
ENV PORT=80
COPY package.json app.js .
RUN chown -R node.node /home/node
RUN npm install
EXPOSE $PORT
CMD ["node", "app,js"]
