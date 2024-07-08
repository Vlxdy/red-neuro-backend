FROM hub.agcs.agetic.gob.bo/dockerhub-proxy/library/node:20-alpine AS base
WORKDIR /home/node/app

RUN mkdir -p node_modules && \
    chown -R node:node /home/node

COPY --chown=node:node package*.json ./

USER node

RUN npm set registry https://registry.agcs.agetic.gob.bo/ && \
    npm set strict-ssl false

RUN npm ci --prefer-offline --progress=false --no-audit 

FROM base AS build
COPY --chown=node:node . .

RUN npm run build
RUN npm ci --production --no-optional --prefer-offline --progress=false --no-audit

FROM hub.agcs.agetic.gob.bo/dockerhub-proxy/library/node:20-alpine AS release
WORKDIR /home/node/app
RUN chown -R node:node /home/node

COPY --from=build --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=build --chown=node:node /home/node/app/dist ./dist

USER node

ARG CI_COMMIT_SHORT_SHA
ARG CI_COMMIT_MESSAGE
ARG CI_COMMIT_REF_NAME
ENV CI_COMMIT_SHORT_SHA=${CI_COMMIT_SHORT_SHA} \
    CI_COMMIT_MESSAGE=${CI_COMMIT_MESSAGE} \
    CI_COMMIT_REF_NAME=${CI_COMMIT_REF_NAME}

FROM release AS production
USER node
CMD ["sh", "-c", "node dist/src/main"]
EXPOSE 3000

FROM release AS sandbox
USER node
CMD ["sh", "-c", "node dist/src/main"]
EXPOSE 3000

FROM release AS testing-base
USER node
CMD ["sh", "-c", "node dist/src/main"]
EXPOSE 3000

FROM release AS development-base
USER node
CMD ["sh", "-c", "node dist/src/main"]
EXPOSE 3000
