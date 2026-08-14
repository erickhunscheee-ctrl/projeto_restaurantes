import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/contracts/validation";

export function apiError(error: unknown, fallback = "Não foi possível concluir a operação.") {
  if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: error.status });
  return NextResponse.json({ error: error instanceof Error ? error.message : fallback }, { status: 400 });
}
