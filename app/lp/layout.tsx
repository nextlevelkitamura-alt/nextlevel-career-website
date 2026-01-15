import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "会員登録 | Next Level Career",
    description: "Next Level Careerに無料会員登録して、非公開求人にアクセスしましょう。",
};

export default function LPLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="lp-page">
            {children}
        </div>
    );
}
