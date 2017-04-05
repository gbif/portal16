# Docker experiment

To run the portal using Docker:

1. [Install Docker](https://docs.docker.com/engine/installation/)

2. Build the Docker image

```
docker build --tag gbif/portal16 .
```

3. Make sure you have a directory with the necessary credentials somewhere

4. Run the image

```
docker run --publish 1234:80 --volume /path/to/gbif-configuration/portal16/prod/:/etc/portal16 --rm --name portal16 --interactive --tty gbif/portal16
```

Those arguments:

* `--publish 1234:80` exposes port 80 (from within the container) to port 1234 on the host machine
* `--volume /abcd:/etc/portal16` mounts the host directory `/abcd` to `/etc/portal16` within the container
* `--rm` deletes the container when it exits
* `--name` assigns a name to it
* `--interactive` and `--tty` are so it receives input, so `^C` works to exit.

Or use the short versions of several of the arguments:

```
docker run -p 1234:80 -v /path/to/gbif-configuration/portal16/prod/:/etc/portal16 --rm --name portal16 -it gbif/portal16
```

5. To stop the container

Type `^C` or `docker stop portal16`.

## Debugging

* To get a shell inside the running container

```
docker exec -it portal16 bash
```

* To start a container with only a shell (no node app running)

```
docker run -p 1234:80 -v /path/to/gbif-configuration/portal16/prod/:/etc/portal16 --rm --name portal16 -it gbif/portal16 bash
```

(Addition of `bash` compared to the run command.)

## Not investigated

* The `bower install` isn't run automatically by `npm install`
* The GBIF repository isn't used by `npm install`.
