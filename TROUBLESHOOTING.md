# Troubleshooting

Use this guide to troubleshoot issues and resolve errors that may occur when forms-worker is deployed.

## Error codes

| Error code              | Reason                                                                                                 |  
|-------------------------|--------------------------------------------------------------------------------------------------------|
| `SUBMIT_REQUEST_ERROR`  | Something went wrong creating or sending the request                                                   |
| `SUBMIT_RESPONSE_ERROR` | The webhook_url responded with a non 200 error                                                         | 
| `SUBMIT_UNKNOWN_ERROR`  | An error was thrown, possibly unrelated to the reqeuest. Inspect the logs and database for more detail | 


## pgboss

Connect to the database:
```sh
kubectl run -it --rm --env PGPASSWORD='<PASSWORD>' --env PAGER= --image=postgres:16  --restart=Never postgres-client -- psql -h <ENDPOINT_URL> -U master -d queue
```
Replace PASSWORD with the password for the database, ENDPOINT_URL with the endpoint URL for the database.



[pgboss](https://github.com/timgit/pg-boss) is used to manage queueing jobs. On application start, pgboss will automatically create necessary tables in the database.

### Jobs table
The jobs table `pgboss.job` is where all the current jobs are stored. Jobs will remain here, until they are completed or failed. Then they will move to `pgboss.archive`

The jobs table has the following columns:

```
    Column    |            Type             | Collation | Nullable |           Default           
--------------+-----------------------------+-----------+----------+-----------------------------
 id           | uuid                        |           | not null | gen_random_uuid()
 name         | text                        |           | not null | 
 priority     | integer                     |           | not null | 0
 data         | jsonb                       |           |          | 
 state        | pgboss.job_state            |           | not null | 'created'::pgboss.job_state
 retrylimit   | integer                     |           | not null | 0
 retrycount   | integer                     |           | not null | 0
 retrydelay   | integer                     |           | not null | 0
 retrybackoff | boolean                     |           | not null | false
 startafter   | timestamp with time zone    |           | not null | now()
 startedon    | timestamp with time zone    |           |          | 
 singletonkey | text                        |           |          | 
 singletonon  | timestamp without time zone |           |          | 
 expirein     | interval                    |           | not null | '00:15:00'::interval
 createdon    | timestamp with time zone    |           | not null | now()
 completedon  | timestamp with time zone    |           |          | 
 keepuntil    | timestamp with time zone    |           | not null | now() + '14 days'::interval
 on_complete  | boolean                     |           | not null | false
 output       | jsonb                       |           |          | 
```

Columns/values to note are 
- `name`: the name of the job. This will be "submission" for forms-worker
- `state`: the state of the job. Read more about them in [pgboss documentation](https://github.com/timgit/pg-boss/blob/master/docs/readme.md#job-states)
  - `created`: the job has been created
  - `failed`: the job has failed
  - `completed`: the job has been completed (successfully)
  - `active`: the job is currently being processed
- `data`: the data associated with the job. This will contain the payload of the job. For this worker, it will follow this format:
    ```json5
    {
        "data": {}, // the user's answers
        "webhook_url": "webhook_url", // the webhook URL to send the data to
    }
    ```
- `output`: the output of the job. This will contain the reference number, or the error message if the job has failed
- `keepuntil`: the time until the job will be kept in the table. After this time, the job will be moved to `pgboss.archive`. If you need more time to resolve the issue, you can update this value to a later time.



## Finding jobs
To find jobs that have failed, run the following query:

```postgresql
    select id, output from pgboss.job where state = 'failed' and name = 'submission';
```

## Fixing data 
If the retrylimit has not been hit (retrylimit > retrycount) and the retrylimit is not 0, the job will be automatically retried.

It is recommended you run every query in a transaction, so that you can abort the changes if they are incorrect.

```postgresql
    begin;
    -- First run a query to print the current state of the job you are trying to change     
    select data from pgboss.job where state = 'failed' and id = '<id>';

    update pgboss.job
    set state = 'created',
    completedon = null,
    retrycount = 0,
    state = 'created'
    where id = '<id>';
    
    -- Run the query again, to see if you've made the correct changes
    select data from pgboss.job where state = 'failed' and id = '<id>';
    
    -- Run the following query to commit the changes
    -- commit; 
    -- Run the following to abort the changes
    -- rollback;
```

The following queries will assume that you are running them in a transaction.

### Incorrect URLs
If the webhook URL is incorrect, you can update the URL in the database. 

```postgresql
    update pgboss.job
    set data = jsonb_set(
            data,
            '{webhook_url}',
            '"<NEW_URL>"'
        )
    where id = '<id>';
```

## Incorrect data
If the data is incorrect, you can update the data in the database.

```postgresql
    update pgboss.job
    set data = jsonb_set(
            data,
            '{data, questions, 0, answer}',
            '"<NEW_ANSWER>"'
        )
    where id = '<id>';
```
where `0` is the index of the question, and `answer` is the key of the answer. However, you may find it easier to copy the data to a text editor, make the changes, and then update the data in the database.

```postgresql
    update pgboss.job
    set data = '<NEW_DATA>'
    where id = '<id>';
```



### Retry a job
If a job has failed, and you want to retry it, you can update the job to `created` state, and reset the `retrycount` to 0.

```postgresql
    update pgboss.job
    set state = 'created',
    completedon = null,
    retrycount = 0,
    state = 'created'
--  output = null  
    where id = '<id>';
```
You may also want to update output to null, to clear the error message.

## Creating a new job
If the job does not seem to be retrying, or it is easier to just create a new job you need to create a new job, you can do so by running the following query:

```postgresql
    insert into pgboss.job (name, data)
    values ('submission', '{"data": {"questions": []}, "webhook_url": "https://example.com"}');
```

Alternatively, you can copy the data from the failed job, and create a new job with the same data.

```postgresql
    insert into pgboss.job (name, data)
    SELECT name, data
    from pgboss.job where id = '<id>';
```

### Moving a job from archive to job
If a job has been moved to the archive, and you want to retry it, you can move it back to the jobs table.

```postgresql
    insert into pgboss.job (name, data)
    SELECT name, data
    from pgboss.archive where id = '<id>';
```