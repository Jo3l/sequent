# ── Sequent — Combined app image ─────────────────────────────────────────────
# Builds the frontend SPA and the Nitro backend, then packages both into a
# single image:
#   • nginx  (port 80) — serves the Nuxt SPA + proxies /api/* → Nitro
#   • Nitro  (port 3233) — listens on 127.0.0.1 only (not exposed externally)
#   • supervisord — keeps both processes running
# ────────────────────────────────────────────────────────────────────────────

# ── Stage 1: build frontend ────────────────────────────────────────────────
FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm AS fe-builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace root + backend (pnpm workspace needs backend to resolve)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN pnpm install --frozen-lockfile

COPY frontend/ frontend/
RUN pnpm --filter frontend generate

# ── Stage 2: build backend ─────────────────────────────────────────────────
FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm AS be-builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json backend/package.json

RUN pnpm install --frozen-lockfile

COPY backend/ backend/
RUN pnpm --filter backend build

# ── Stage 3: final image ───────────────────────────────────────────────────
FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm
WORKDIR /app

# System dependencies: unar (CBR/CBZ), poppler-utils (pdfinfo), ghostscript (PDF render), libvips (sharp)
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    nginx supervisor unar poppler-utils ghostscript libvips42 ca-certificates libvulkan1 mesa-vulkan-drivers zip && \
  rm -rf /var/lib/apt/lists/* && \
  mkdir -p /var/log/supervisor /var/log/nginx /run/nginx /app/data && \
  chmod 777 /app/data

# ── Upscayl-ncnn (AI image upscaling) ─────────────────────────────────────
# Download prebuilt Linux binary from GitHub releases
ADD https://github.com/upscayl/upscayl-ncnn/releases/download/20251207-174704/upscayl-bin-20251207-174704-linux.zip /tmp/upscayl.zip
RUN unzip -q /tmp/upscayl.zip -d /tmp/upscayl && \
    mv /tmp/upscayl/upscayl-bin-*/upscayl-bin /usr/local/bin/ && \
    chmod +x /usr/local/bin/upscayl-bin && \
    rm -rf /tmp/upscayl.zip /tmp/upscayl

# Download upscaling models
RUN mkdir -p /opt/upscayl-models && \
    curl -sL https://github.com/upscayl/custom-models/raw/main/models/realesr-animevideov3-x2.bin -o /opt/upscayl-models/realesr-animevideov3-x2.bin && \
    curl -sL https://github.com/upscayl/custom-models/raw/main/models/realesr-animevideov3-x2.param -o /opt/upscayl-models/realesr-animevideov3-x2.param
ENV UPSCAYL_MODEL_DIR=/opt/upscayl-models


# ── Backend artefacts ──────────────────────────────────────────────────────
COPY --from=be-builder /app/backend/.output  .output
COPY --from=be-builder /app/backend/node_modules node_modules

# ── Frontend artefacts ─────────────────────────────────────────────────────
RUN rm -rf /usr/share/nginx/html/*
COPY --from=fe-builder /app/frontend/.output/public  /usr/share/nginx/html

# nginx site config (SPA + /api/* proxy to loopback Nitro)
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Process supervisor config
COPY supervisord.conf /etc/supervisord.conf

# Entrypoint: auto-generates JWT secret if not provided
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Single data volume: DB, covers cache, page cache, localcvdb
VOLUME /data
# Comics (read-only, mounted at /app/comics for relative ./comics path)
VOLUME /app/comics

ENV NODE_ENV=production
ENV NITRO_HOST=127.0.0.1
ENV NITRO_PORT=3233
ENV DATA_DIR=/data

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
