# forms-queue
This ia a monorepo for forms-queue/worker. 
A monorepo has been set up so it is easy to add new related services or code in future.

## Prerequisites
1. A node version manager, like [nvm](https://formulae.brew.sh/formula/nvm), or [n](https://github.com/tj/n)
2. node 20.x.x
3. yarn >= v1.22. This project uses yarn 4. Yarn v1.22 will load the correct version of yarn by looking at [.yarnrc](./.yarnrc.yml) and [.yarn](./yarn)
4. Docker >= 3.9 - [Install docker engine](https://docs.docker.com/engine/install/)

Install the dependencies by running `yarn install` from the root of the project.

## @forms-queue/worker

Worker is a process which listens to a database-backed queue, and sends it to the configured webhook.

To start the project, you will need a running postgres database. You can start the database with docker by running the following command:

```sh
    docker compose up postgres
```

Or in detached mode (i.e. without tailing the logs) 

```sh
    docker compose up postgres -d 
```

This will start the postgres container running on port 5432; with username `user` and password `root`, 
and a database created called `queue` (`postgres://user:root@localhost:5432/queue`).
[`init.sql`](init.sql) is also loaded as a volume into the container, and will create a database named `notarial` 
(`postgres://user:root@localhost:5432/notarial`). This is useful if you are going to be running [notarial-api](https://github.com/UKForeignOffice/notarial-api) 
at the same time. If you are running postgres from this repo, you do not need to run it in `notarial-api`.

Then to start the worker in dev mode, 

```sh
    yarn worker start:local
```


### Running with docker
You may use docker and docker compose to build and start the project with the right components (e.g. database, microservices), 
but will not be able to run the application(s) in dev mode (i.e. with watch and recompile).

To do this, simply run this command from the root of the project:
```
docker compose up -d
```

This will then run the server in a docker container in detached mode, allowing you to continue making commands through your terminal, but still keep the docker container running.

If you have already started a postgres container, you can comment out the postgres service in the docker-compose file.

To rebuild the server after making some changes, run the following commands:

```
docker compose down
docker compose -d --build
```



### Formatting
This project uses ESLint and Prettier to ensure consistent formatting. It is recommended that you add and turn on the prettier plugin for your IDE, and reformat on save.

## CI/CD
There is a CI/CD pipeline currently set up for deploying new versions of the project to test environments. For more information, please refer to the [CI/CD docs](https://github.com/UKForeignOffice/notarial-api/blob/main/docs/ci.md)

## Troubleshooting
See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) on how to troubleshoot the worker and errors when running the service.

## Environment variables

| Environment variable       | type       | Default                                   | Description                                                                                                                                                  |
|----------------------------|------------|-------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| QUEUE_URL                  | string     | postgres://user:root@localhost:5432/queue | The connection string to the database, including username and password                                                                                       |
| ARCHIVE_FAILED_AFTER_DAYS  | string/int | 30                                        | How long to keep failed jobs in the pgboss.job before moving it to pgboss.archive                                                                            |
| DELETE_ARCHIVED_IN_DAYS    | string/int | 7                                         | How long to keep jobs in pgboss.archive before deleting it                                                                                                   |
| SUBMISSION_REQUEST_TIMEOUT | string/int | 2000                                      | How long to keep the POST request alive for in milliseconds. This should be higher (20-30s) if integrating into CASEBOOK/Orbit which has long response times |
| NEW_JOB_CHECK_INTERVAL     | string/int | 2000                                      | The frequency to check for new jobs in milliseconds                                                                                                          |

Types are described as string/int since kubernetes only accepts strings. Strings are parsed into int.