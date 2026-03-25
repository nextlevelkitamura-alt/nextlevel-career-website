import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { generateJobPdf, PdfStyle } from "@/lib/pdf/generateJobPdf";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // 認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // スタイルパラメータ取得
    const { searchParams } = new URL(request.url);
    const style = (searchParams.get("style") || "detailed") as PdfStyle;
    if (style !== "detailed" && style !== "modern") {
      return NextResponse.json({ error: "Invalid style" }, { status: 400 });
    }

    // 求人データ取得（gig_to_fulltime_job_details含む）
    const { data: job, error } = await supabase
      .from("jobs")
      .select("*, clients(name), dispatch_job_details(*), fulltime_job_details(*), gig_to_fulltime_job_details(*)")
      .eq("id", params.id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // PDF生成
    const pdfBuffer = await generateJobPdf(job, style);

    const jobCode = job.job_code || job.id.slice(0, 8);
    const styleName = style === "modern" ? "モダン" : "詳細";
    const fileName = encodeURIComponent(`求人票_${jobCode}_${styleName}.pdf`);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF生成に失敗しました" },
      { status: 500 }
    );
  }
}
