import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getTasksForClient } from "@/lib/data";
import { apiError, ErrorCode } from "@/lib/api-response";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return apiError("Unauthorized", ErrorCode.UNAUTHORIZED, 401);
  }

  const tasks = await getTasksForClient(params.id, auth.firmId);
  return NextResponse.json({ tasks });
}
