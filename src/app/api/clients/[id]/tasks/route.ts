import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getTasksForClient } from "@/lib/data";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await getAuthenticatedUser();
  const tasks = await getTasksForClient(params.id, auth?.firmId);
  return NextResponse.json({ tasks });
}
