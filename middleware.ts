import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }),
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@auth.marmita-ja.local";
    if (user.email !== adminEmail || user.user_metadata?.platform_admin !== true) {
      return NextResponse.redirect(new URL("/restaurantes", request.url));
    }
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
