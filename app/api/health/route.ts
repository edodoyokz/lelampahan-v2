export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'lelampahan',
    timestamp: new Date().toISOString(),
  });
}
