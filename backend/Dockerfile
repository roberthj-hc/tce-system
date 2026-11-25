FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node . .
# Carpeta de imágenes subidas: se monta como volumen persistente
RUN mkdir -p /app/src/public/products && chown -R node:node /app/src/public

USER node
EXPOSE 4000
CMD ["node", "src/index.js"]
