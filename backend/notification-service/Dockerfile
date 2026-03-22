FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN useradd --create-home --uid 10001 appuser
USER appuser

EXPOSE 3004

CMD ["npm", "start"]
