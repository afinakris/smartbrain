# Small, fast Node base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy only dependency manifests first, so Docker can cache this layer.
# As long as package.json/package-lock.json don't change, rebuilds skip
# npm install entirely and reuse this cached layer.
COPY package.json package-lock.json ./

# Install only production dependencies (skip devDependencies like nodemon)
RUN npm ci --omit=dev

# Now copy the rest of the application code
COPY . .

# Document which port the app listens on (actual value comes from env var PORT at runtime)
EXPOSE 3000

# Security best practice: don't run the container as root.
# The node:20-alpine image already includes a non-root "node" user, so we
# just switch to it and make sure it owns the app files it needs to read.
RUN chown -R node:node /app
USER node

# Start the server. No .env/API.env file needed here -
# environment variables (PORT, DB_*, EDEN_AI_API_KEY) are injected
# by Kubernetes at runtime via ConfigMap/Secret, not baked into the image.
CMD ["node", "server.js"]
