FROM public.ecr.aws/docker/library/node:22.12.0-alpine AS build

WORKDIR /usr/src/app

RUN apk add \
    python3 \
    make \
    g++ \
    curl

COPY package*.json ./

COPY . .

RUN npm ci

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
