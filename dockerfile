FROM hub.agcs.agetic.gob.bo/dockerhub-proxy/library/node:20-alpine AS base
WORKDIR /home/node/app

RUN mkdir -p node_modules && \
    chown -R node:node /home/node

COPY --chown=node:node --link package*.json ./

USER node

RUN npm set registry https://registry.agcs.agetic.gob.bo/ && \
    npm set strict-ssl false

RUN npm ci --prefer-offline --progress=false --no-audit 

FROM base AS build
USER root
RUN npm install -g turbo
COPY --chown=node:node --link . .

ARG TURBO_API
ARG TURBO_TEAM
ARG TURBO_TOKEN

ENV TURBO_TELEMETRY_DISABLED=${TURBO_TELEMETRY_DISABLED}
ENV DO_NOT_TRACK=${DO_NOT_TRACK}
ENV TURBO_API=${TURBO_API}
ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}

run printenv

RUN turbo build-docker
RUN npm ci --production --no-optional --prefer-offline --progress=false --no-audit

FROM hub.agcs.agetic.gob.bo/dockerhub-proxy/library/node:20-alpine AS release
WORKDIR /home/node/app
RUN chown -R node:node /home/node

COPY --from=build --link --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=build --link --chown=node:node /home/node/app/dist ./dist

USER node

ARG CI_COMMIT_SHORT_SHA
ARG CI_COMMIT_MESSAGE
ARG CI_COMMIT_REF_NAME
ENV CI_COMMIT_SHORT_SHA=${CI_COMMIT_SHORT_SHA} \
    CI_COMMIT_MESSAGE=${CI_COMMIT_MESSAGE} \
    CI_COMMIT_REF_NAME=${CI_COMMIT_REF_NAME}

FROM release AS testing-base
USER node
CMD ["sh", "-c", "node dist/src/main"]
EXPOSE 3000

FROM release AS development-base
USER node
CMD ["sh", "-c", "node dist/src/main"]
EXPOSE 3000
