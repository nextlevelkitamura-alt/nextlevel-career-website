type CompanyName = string | null | undefined;

type JobQueue<T> = {
    key: string;
    entries: Array<{ job: T; index: number }>;
};

function normalizeCompanyKey(companyName: CompanyName) {
    const normalized = companyName?.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
    return normalized || null;
}

function compareQueues<T>(a: JobQueue<T>, b: JobQueue<T>) {
    const remainingDiff = b.entries.length - a.entries.length;
    if (remainingDiff !== 0) return remainingDiff;
    return a.entries[0].index - b.entries[0].index;
}

function takeNext<T>(queue: JobQueue<T>) {
    const entry = queue.entries.shift();
    if (!entry) {
        throw new Error("Cannot take from an empty job queue");
    }
    return entry.job;
}

export function diversifyJobsByCompany<T>(
    jobs: T[],
    getCompanyName: (job: T, index: number) => CompanyName
): T[] {
    if (jobs.length <= 2) return [...jobs];

    const queues: JobQueue<T>[] = [];
    const queueByKey = new Map<string, JobQueue<T>>();

    jobs.forEach((job, index) => {
        const companyKey = normalizeCompanyKey(getCompanyName(job, index));
        const key = companyKey ?? `__single_job_${index}`;
        const existing = queueByKey.get(key);

        if (existing) {
            existing.entries.push({ job, index });
            return;
        }

        const queue = { key, entries: [{ job, index }] };
        queueByKey.set(key, queue);
        queues.push(queue);
    });

    if (queues.length <= 1) return [...jobs];

    const firstQueue = queues.find((queue) => queue.entries[0]?.index === 0);
    if (!firstQueue) return [...jobs];

    const diversified: T[] = [takeNext(firstQueue)];
    let previousKey = firstQueue.key;

    while (diversified.length < jobs.length) {
        const nonEmptyQueues = queues.filter((queue) => queue.entries.length > 0);
        const candidates = nonEmptyQueues.filter((queue) => queue.key !== previousKey);
        const pool = candidates.length > 0 ? candidates : nonEmptyQueues;
        const nextQueue = [...pool].sort(compareQueues)[0];

        diversified.push(takeNext(nextQueue));
        previousKey = nextQueue.key;
    }

    return diversified;
}
