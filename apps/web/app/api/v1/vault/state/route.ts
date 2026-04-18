export async function GET() {
  return Response.json({
    address: 'VaultAddr1111111111111111111111111111111111',
    totalAssets: '1000000000',
    totalShares: '1000000000',
    currentNav: '1000000000',
    peakNav: '1000000000',
    activeHedge: false,
    userCount: 0,
    hedgePositions: 0,
  });
}
