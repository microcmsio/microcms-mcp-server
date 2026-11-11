FROM node:26.13.0-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY dist/ ./dist/
COPY bin/ ./bin/

# Run as non-root user for security
USER node

ENV NODE_ENV=production
ENV MCP_TRANSPORT=http
ENV MCP_HTTP_PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
