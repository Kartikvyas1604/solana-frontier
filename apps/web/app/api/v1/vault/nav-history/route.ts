export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get('hours') || '24');

  const snapshots = [];
  const now = Date.now();

  for (let i = 0; i < Math.min(hours * 2, 100); i++) {
    snapshots.push({
      price: (100_000000 + Math.random() * 5_000000).toString(),
      timestamp: now - i * 30 * 60 * 1000,
    });
  }

  return Response.json({ snapshots });
}
