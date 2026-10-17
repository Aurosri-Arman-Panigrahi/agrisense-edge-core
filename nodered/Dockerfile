FROM nodered/node-red:latest-18

USER root
RUN apk add --no-cache openssl bash curl

# Set working directory
WORKDIR /usr/src/node-red

# Copy custom package.json if extra nodes are needed
COPY settings.js /data/settings.js
COPY flows.json /data/flows.json

# Expose Node-RED HTTP & WebSocket port
EXPOSE 1880

# Environment variables
ENV NODE_ENV=production
ENV PORT=1880

USER node-red

CMD ["npm", "start", "--cache", "/data/.npm", "--", "--userDir", "/data"]
