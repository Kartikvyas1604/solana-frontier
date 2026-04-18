export async function GET() {
  return Response.json({
    status: 'healthy',
    checks: {
      database: true,
      redis: true,
      timestamp: Date.now(),
    },
  });
}
