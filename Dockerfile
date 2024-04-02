FROM node:20-alpine 
# AS build-image

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

RUN npm run build

# # production stage
# FROM node:alpine

# WORKDIR /app

# COPY --from=build-image /app/.next ./.next
# COPY --from=build-image /app/public ./public
# COPY --from=build-image /app/package*.json ./
# COPY --from=build-image /app/node_modules ./

EXPOSE 3000

CMD [ "npm" , "start" ]


