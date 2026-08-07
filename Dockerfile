FROM node:24.14.1-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM node:24.14.1-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
# Build-time env vars (públicas) — para que Next.js las inline en el bundle.
# OJO: en un build con Dockerfile, Next SOLO ve las NEXT_PUBLIC_* que estén como
# ENV en esta etapa. Railway inyecta las service vars como --build-arg, pero hay
# que declararlas aquí o quedan vacías (síntoma: "El SDK de Facebook aún no cargó").
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_USE_MOCKS
ARG NEXT_PUBLIC_FACEBOOK_APP_ID
ARG NEXT_PUBLIC_WHATSAPP_ES_CONFIG_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_USE_MOCKS=$NEXT_PUBLIC_USE_MOCKS
ENV NEXT_PUBLIC_FACEBOOK_APP_ID=$NEXT_PUBLIC_FACEBOOK_APP_ID
ENV NEXT_PUBLIC_WHATSAPP_ES_CONFIG_ID=$NEXT_PUBLIC_WHATSAPP_ES_CONFIG_ID
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

FROM node:24.14.1-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone bundle es autocontenido — incluye solo lo necesario en runtime
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static
COPY --from=builder /usr/src/app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
