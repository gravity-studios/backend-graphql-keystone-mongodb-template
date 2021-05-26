const Queue = require('bee-queue');
const getLogger = require('../helpers/logger');

const queueLogger = getLogger('Queue');
let queue;

module.exports = {
    queue,
    initializeQueue: (keystone) => {
        queue = new Queue('tasks', {
            redis: {
                url: process.env.REDIS_URL,
            },
        });

        queue.process(async (job, done) => {
            queueLogger.info(`Processing job ${job.id}`);

            const { type } = job.data;
            const logger = getLogger(`job-${job.id}`);

            return done(null, false);
        });

        queue.on('job failed', (jobId, err) => {
            queueLogger.error(`Job ${jobId} failed with error ${err.message}`);
            queueLogger.error(err);
        });
    },
    scheduleTask: async (task) => {
        const job = queue.createJob(task);

        await job.save();
    },
};
