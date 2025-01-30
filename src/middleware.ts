import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/"];
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const jwtToken = (await cookies()).get("jwtToken")?.value;

  if (isPublicRoute && jwtToken) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isProtectedRoute && !jwtToken) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isProtectedRoute && jwtToken) {
    const apiUrl = new URL("/api/auth", req.nextUrl.origin).toString();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    if (response.status !== 200) {
      const response = NextResponse.redirect(new URL("/login", req.nextUrl));
      response.cookies.delete("jwtToken");
      return response;
    }
  }

  return NextResponse.next();
}
//! Uncomment this when maintenance
// if (isProtectedRoute || isPublicRoute)
//   return NextResponse.redirect(new URL("/maintenance", req.nextUrl));
