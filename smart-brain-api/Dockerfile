# ---- Stage 1: build ----
# Uses the full node:20-alpine image (includes npm) purely to install dependencies. This stage is discarded after build - only the finished node_modules folder gets copied into the final image below. This keeps npm's own internal files (and their CVEs, e.g. a bundled brace-expansion vulnerability found via Trivy) out of the image we actually ship.
FROM node:20-alpine AS build

WORKDIR /app

# Copy only dependency manifests first, so Docker can cache this layer.
# As long as package.json/package-lock.json don't change, rebuilds skip npm install entirely and reuse this cached layer.
COPY package.json package-lock.json ./

# Install only production dependencies (skip devDependencies like nodemon).
# Clean npm cache after install, and remove any Dockerfiles that ship inside installed packages (e.g. bcrypt) - neither is needed at runtime, and their presence was flagged by Dockle (DKL-LI-0003: unnecessary files).
RUN npm ci --omit=dev \
    && npm cache clean --force \
    && rm -rf /root/.npm \
    && find node_modules -name "Dockerfile" -delete

# Now copy the rest of the application code
COPY . .

# ---- Stage 2: final runtime image ----
# Fresh image. No npm install runs here - we only copy over the already built node_modules and app code from the build stage above.
FROM node:20-alpine

WORKDIR /app

# Remove npm and its bundled internal dependencies (e.g. an outdated brace-expansion with known CVEs) from the final image. npm is only needed during the build stage above to install our dependencies - the running application never invokes npm (see CMD below).
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# Patch known CVEs in the base image's OpenSSL packagesfound via container scanning. This is a no-op if the base image is already up to date.
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app .

# Document which port the app listens on (actual value comes from env var PORT at runtime)
EXPOSE 3000

# Security best practice: don't run the container as root. The node:20-alpine image already includes a non-root "node" user, so we just switch to it and make sure it owns the app files it needs to read.
RUN chown -R node:node /app
# Explicit numeric UID (1000 = node user in this base image) rather than username, per Hadolint DL3066 - avoids relying on username resolution, which can behave inconsistently across host systems.
USER 1000

# Periodically verify the server is actually responding, not just running.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]

# Start the server. No .env/API.env file needed here - environment variables (PORT, DB_*, EDEN_AI_API_KEY) are injected by Kubernetes at runtime via ConfigMap/Secret, not baked into the image.
CMD ["node", "server.js"]