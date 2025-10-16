# Use node version 22.12.0
FROM node:22.12.0
# Metadata
LABEL maintainer="Sukhad Adhikari sukhadadhikari3@gmail.com"
LABEL description="Fragments node.js microservice"
# We default to use port 8080 in our service
ENV PORT=8080
# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn
# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false
# Use /app as our working directory
WORKDIR /app
# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/

# Option 2: relative path - Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
COPY package*.json ./

# Option 3: explicit filenames - Copy the package.json and package-lock.json
# files into the working dir (/app), using full paths and multiple source
# files.  All of the files will be copied into the working dir `./app`
COPY package.json package-lock.json ./


# Install node dependencies defied in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src


# Start the container by running our server
CMD npm start


# We run our service on port 8080
EXPOSE 8080
