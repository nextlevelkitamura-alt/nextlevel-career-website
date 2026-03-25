import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { generateJobPdf, PdfStyle } from "@/lib/pdf/generateJobPdf";
import { formDataToJobShape } from "@/lib/pdf/helpers/formToJobData";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { jobData, style = "detailed" } = body;

    if (!jobData) {
      return NextResponse.json({ error: "jobData is required" }, { status: 400 });
    }

    const validStyle = (style === "detailed" || style === "modern") ? style as PdfStyle : "detailed";

    // フォームデータ → DB風構造 → PDF生成
    const jobShape = formDataToJobShape(jobData);
    const pdfBuffer = await generateJobPdf(jobShape, validStyle);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("PDF preview error:", error);
    return NextResponse.json(
      { error: "PDFプレビュー生成に失敗しました" },
      { status: 500 }
    );
  }
}
