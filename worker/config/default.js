module.exports = {
  Queue: {
    url: "postgres://user:root@localhost:5432/queue",
    archiveFailedInDays: 30,
    deleteArchivedAfterDays: 7,
  },
  Submission: {
    requestTimeout: 2000,
  },
  newJobCheckInterval: "2000",
  SUPPRESS_NO_CONFIG_WARNING: true,
};
