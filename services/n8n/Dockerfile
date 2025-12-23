FROM n8nio/n8n:latest

USER root

# Create data directory
RUN mkdir -p /home/node/.n8n && chown -R node:node /home/node/.n8n

USER node

EXPOSE 5678

CMD ["n8n", "start"]
