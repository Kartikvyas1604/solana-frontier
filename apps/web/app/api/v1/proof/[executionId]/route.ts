export async function GET(
  request: Request,
  { params }: { params: { executionId: string } }
) {
  return Response.json(null);
}
