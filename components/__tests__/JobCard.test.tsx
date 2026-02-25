import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import JobCard from "@/components/JobCard";
import type { Job } from "@/app/jobs/jobsData";

jest.mock("next/link", () => {
  function MockNextLink({ children, href, className }: { children: ReactNode; href: string; className?: string }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return MockNextLink;
});

const baseJob: Job = {
  id: "job-1",
  title: "テスト求人",
  area: "東京都 渋谷区",
  type: "正社員",
  salary: "月給30万円〜",
  category: "事務",
  tags: ["未経験OK"],
  nearest_station: "渋谷駅",
};

describe("JobCard station row visibility", () => {
  it("areaCount=1 の場合は駅行を表示する", () => {
    render(<JobCard job={{ ...baseJob, search_areas: ["東京都 渋谷区"] }} />);
    expect(screen.getByText("最寄駅: 渋谷駅")).toBeInTheDocument();
  });

  it("areaCount=2 以上の場合は駅行を表示しない", () => {
    render(
      <JobCard
        job={{
          ...baseJob,
          search_areas: ["東京都 渋谷区", "神奈川県 横浜市"],
        }}
      />
    );

    expect(screen.queryByText("渋谷駅")).not.toBeInTheDocument();
  });

  it("推定フラグがある場合は推定ラベル付きで表示する", () => {
    render(
      <JobCard
        job={{
          ...baseJob,
          search_areas: ["東京都 渋谷区"],
          nearest_station_is_estimated: true,
        }}
      />
    );

    expect(screen.getByText("最寄駅: 渋谷駅（推定）")).toBeInTheDocument();
  });
});
