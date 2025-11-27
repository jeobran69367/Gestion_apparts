import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const depositId = request.nextUrl.searchParams.get("depositId");

  const response = await fetch(`https://api.sandbox.pawapay.io/v2/deposits/${depositId}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAWAPAY_API_KEY}`
    }
  });

  const data = await response.json();
  return NextResponse.json(data);
}
        