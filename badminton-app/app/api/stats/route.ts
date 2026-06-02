const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!;

export async function GET() {
  const res = await fetch(APPS_SCRIPT_URL, { cache: "no-store" });
  const data = await res.json();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(body),
    redirect: "follow",
  });
  const data = await res.json();
  return Response.json(data);
}
