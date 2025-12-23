FROM directus/directus:latest

USER root

# Create extensions directory
RUN mkdir -p /directus/extensions && chown -R node:node /directus/extensions

USER node

EXPOSE 8055

CMD ["node", "cli.js", "bootstrap", "&&", "node", "cli.js", "start"]
