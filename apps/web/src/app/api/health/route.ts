export async function GET() {
  return Response.json({
    service: "lingo-deutsch",
    status: "ok",
  });
}
