import { describe, expect, it } from "@jest/globals";
import { diversifyJobsByCompany } from "@/utils/jobListDiversify";

type TestJob = {
    id: string;
    company?: string | null;
};

function companyPairs(jobs: TestJob[]) {
    return jobs.slice(1).map((job, index) => [jobs[index].company, job.company]);
}

describe("diversifyJobsByCompany", () => {
    it("keeps the first job and spreads repeated companies when alternatives exist", () => {
        const jobs: TestJob[] = [
            { id: "a1", company: "株式会社A" },
            { id: "a2", company: "株式会社A" },
            { id: "a3", company: "株式会社A" },
            { id: "b1", company: "株式会社B" },
            { id: "c1", company: "株式会社C" },
            { id: "d1", company: "株式会社D" },
            { id: "a4", company: "株式会社A" },
            { id: "e1", company: "株式会社E" },
        ];

        const result = diversifyJobsByCompany(jobs, (job) => job.company);

        expect(result.map((job) => job.id)).toEqual(["a1", "b1", "a2", "c1", "a3", "d1", "a4", "e1"]);
        expect(result[0].id).toBe("a1");
        expect(companyPairs(result).some(([prev, next]) => prev === next)).toBe(false);
    });

    it("preserves order within the same company", () => {
        const jobs: TestJob[] = [
            { id: "a1", company: "株式会社A" },
            { id: "a2", company: "株式会社A" },
            { id: "b1", company: "株式会社B" },
            { id: "a3", company: "株式会社A" },
            { id: "c1", company: "株式会社C" },
        ];

        const result = diversifyJobsByCompany(jobs, (job) => job.company);
        const companyAIds = result.filter((job) => job.company === "株式会社A").map((job) => job.id);

        expect(companyAIds).toEqual(["a1", "a2", "a3"]);
    });

    it("treats jobs without a company name as independent entries", () => {
        const jobs: TestJob[] = [
            { id: "a1", company: "株式会社A" },
            { id: "a2", company: "株式会社A" },
            { id: "unknown1", company: null },
            { id: "unknown2" },
            { id: "a3", company: "株式会社A" },
        ];

        const result = diversifyJobsByCompany(jobs, (job) => job.company);

        expect(result.map((job) => job.id)).toEqual(["a1", "unknown1", "a2", "unknown2", "a3"]);
    });
});
