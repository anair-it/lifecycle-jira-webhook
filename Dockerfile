FROM node:18-alpine
MAINTAINER Anoop Nair<anoopnair.in@outlook.com>
LABEL description="Lifecycle Jira integrator image"

WORKDIR /app
COPY package*.json /app/
RUN npm install ci --only=production
COPY index.js /app/
COPY src/ /app/src
EXPOSE 3000
CMD [ "node", "index.js" ]