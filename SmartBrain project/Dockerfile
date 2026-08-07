# ---- Stage 1: Build ----
# Use Node to install dependencies and build the static Vite app.
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first for build caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the frontend source
COPY . .

# VITE_API_URL must be available at BUILD time, not runtime -
# Vite bakes env vars starting with VITE_ directly into the compiled
# JavaScript bundle. Pass this in via: docker build --build-arg VITE_API_URL=...
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Produces static files in /app/dist
RUN npm run build


# ---- Stage 2: Serve ----
# Use nginx-unprivileged - purpose-built by the nginx team to run correctly
# as a non-root user out of the box (avoids /run permission issues that
# plain nginx:alpine has when forced to run non-root).
FROM nginxinc/nginx-unprivileged:alpine

# Copy the built static files from the "build" stage into nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Explicitly set the pid file to a writable location. Recent nginx-unprivileged
# alpine builds have a known regression where the default nginx.conf still
# points pid to /run/nginx.pid, which isn't writable by the non-root user.
# We replace that existing line rather than adding a new one, to avoid a
# "duplicate pid directive" error.
RUN sed -i 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf

# nginx-unprivileged listens on 8080 by default instead of 80
EXPOSE 8080

# Already runs as the "nginx" non-root user by default - no USER line needed
CMD ["nginx", "-g", "daemon off;"]