import "@/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";

import { Providers } from "@/providers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Nav from "@/components/Navbar";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Ticket Support System",
  description: "This is a ticket support system",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <html lang="en">
      <body className="min-h-screen w-full">
        <Providers>
          <TRPCReactProvider>
            <Nav session={session} />
            {children}
            <ReactQueryDevtools />
            <Toaster richColors closeButton />
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}
