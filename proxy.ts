import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Fetch user profile to check role — only redirect if we can confirm wrong role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Only enforce role-based redirect if we successfully got the profile
    if (profile?.role) {
      const isVolunteerPath = request.nextUrl.pathname.startsWith("/dashboard/volunteer");
      const isCoordinatorPath = request.nextUrl.pathname.startsWith("/dashboard/coordinator");

      if (isVolunteerPath && profile.role !== "volunteer") {
        return NextResponse.redirect(new URL("/dashboard/coordinator", request.url));
      }

      if (isCoordinatorPath && profile.role !== "coordinator") {
        return NextResponse.redirect(new URL("/dashboard/volunteer", request.url));
      }
    }
    // If profile is null/missing, let the user through — dashboard will handle it
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
