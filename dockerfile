FROM node:20-alpine

WORKDIR /app

CMD ["sh", "-c", "tail -f /dev/null"]
