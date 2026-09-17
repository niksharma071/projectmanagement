# 1. Use the official Node 24 image (matching your EC2 server)
# The 'alpine' version is a stripped-down, ultra-lightweight Linux OS
FROM node:24-alpine

# 2. Create a working directory inside the container
WORKDIR /app

# 3. Copy ONLY your package files first
# This is a Docker caching trick to make future rebuilds extremely fast
COPY package*.json ./

# 4. Install production dependencies securely
RUN npm ci --omit=dev

# 5. Copy the rest of your application code into the container
COPY . .

# 6. Document the port your app runs on (change 3000 if your app uses a different port)
EXPOSE 8080

# 7. The command that actually starts your API
CMD ["node", "src/index.js"]