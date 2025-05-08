# ──────────────── Builder Stage ────────────────
FROM node:20-alpine AS builder

# 1. Set working directory
WORKDIR /app

# 2. Install dependencies based on your lockfile
COPY package*.json ./
RUN npm ci

# 3. Copy the rest of your source code
COPY . .

# 4. Build for production
ENV NODE_ENV=production
RUN npm run build


# ─────────────── Production Stage ───────────────
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# 1. Copy only package files, then install production deps
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# 2. Copy the compiled output
COPY --from=builder /app/.next ./.next

# 3. Copy any static assets if you have them
#    — uncomment only if these folders/files exist in your project!
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.js ./
# COPY --from=builder /app/components.json ./

# 4. Expose and launch
EXPOSE 3000
CMD ["npm", "start"]
