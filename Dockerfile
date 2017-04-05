FROM node:7.8

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Default environment variables
ENV NODE_ENV=prod

# Keep secrets external
VOLUME /etc/portal16

# Install app and dependencies
COPY . /usr/src/app
RUN npm install --registry http://repository.gbif.org/content/repositories/npmjs/
RUN node node_modules/bower/bin/bower --allow-root install
RUN node node_modules/gulp/bin/gulp.js --prod

EXPOSE 80
CMD [ "npm", "start" ]
