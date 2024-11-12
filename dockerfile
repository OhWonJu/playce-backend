# # Build stage
# FROM node:20 AS builder
# WORKDIR /usr/src/app
# RUN corepack enable
# RUN corepack prepare yarn@4.3.1 --activate
# COPY package*.json yarn.lock ./
# COPY prisma ./prisma/
# RUN npm install -g dotenv-cli pm2
# RUN yarn
# COPY . .
# RUN npx prisma generate
# RUN yarn build

# # Production iamge
# FROM node:20-slim
# # RUN apt update && apt install libssl-dev dumb-init -y --no-install-recommends
# WORKDIR /usr/src/app
# RUN corepack enable
# RUN corepack prepare yarn@4.3.1 --activate
# RUN npm install -g dotenv-cli pm2
# COPY --from=builder /usr/src/app/node_modules ./node_modules
# COPY --from=builder /usr/src/app/package*.json ./
# COPY --from=builder /usr/src/app/package*.json ./
# COPY --from=builder /usr/src/app/yarn.lock ./
# COPY --from=builder /usr/src/app/dist ./dist
# RUN yarn install
# # ENV NODE_ENV=stage
# EXPOSE 4000
# CMD ["yarn", "start:stage"]


FROM node:20
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN corepack enable
RUN corepack prepare yarn@4.2.2 --activate
RUN npm install -g dotenv-cli pm2
COPY . .
RUN yarn install
RUN yarn build
EXPOSE 4000
CMD [ "yarn", "daemon:stage" ]