
FROM node:20

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the app (use nodemon for live reload during dev if installed)
CMD ["npm", "start"]
