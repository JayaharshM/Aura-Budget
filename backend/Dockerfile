# ─────────────────────────────────────────────────────────────
#  Aura Budget Backend — Dockerfile
#  Runtime: Node.js 20 (LTS) + Python 3 for ML forecast scripts
# ─────────────────────────────────────────────────────────────

# ── Stage 1: dependency installer ────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app

# Copy only manifests first so Docker cache is reused on code-only changes
COPY package.json package-lock.json ./

RUN npm ci --omit=dev


# ── Stage 2: final runtime image ─────────────────────────────
FROM node:20-slim AS runtime

# Install Python 3, pip, and build tools needed by some pip packages
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-venv \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Install Python ML dependencies into a virtual environment
RUN python3 -m venv /app/.venv \
    && /app/.venv/bin/pip install --no-cache-dir --upgrade pip \
    && /app/.venv/bin/pip install --no-cache-dir -r ml/requirements.txt

# Make the venv available to Node child processes that call Python
ENV PATH="/app/.venv/bin:$PATH"

# Ensure the uploads directory exists at runtime
RUN mkdir -p /app/uploads

# Expose the port defined in .env (default 5001)
EXPOSE 5001

# Use non-root user for security
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser \
    && chown -R appuser:appgroup /app
USER appuser

# Health-check so orchestrators know when the server is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5001/health', r => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
