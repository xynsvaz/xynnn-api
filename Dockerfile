# Gunakan sistem operasi Linux Alpine yang sangat ringan
FROM node:20-alpine

# Instal Chromium dan semua library pendukungnya (pengganti libnss3)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Beritahu Puppeteer untuk JANGAN download browser sendiri, pakai yang dari OS saja
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Masukkan kode bot ke dalam Container
COPY package*.json ./
RUN npm install

COPY . .

# Buka port 3000
EXPOSE 3000

# Jalankan server
CMD ["npm", "start"]
