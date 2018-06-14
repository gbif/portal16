FROM node:7.9

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Default environment variables
ENV NODE_ENV=prod

# Keep secrets external
VOLUME /etc/portal16

# Setting to use the GBIF NPM registry mirror, which doesn't work.
# The --registry option below also seems not to work.
COPY .docker-npmrc /root/.npmrc

# Install app and dependencies
COPY . /usr/src/app
RUN npm install --registry http://repository.gbif.org/content/repositories/npmjs/
RUN node node_modules/gulp/bin/gulp.js --prod

EXPOSE 80
CMD [ "npm", "start" ]
