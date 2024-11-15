import type { Metadata } from "next";

import React from "react";
import { Suspense } from "react";
import { Providers } from "../app/providers";
import { Box } from "@chakra-ui/react";
import { AccountProvider } from "@/context/AccountProvider";
import { Header } from "./organisms/Header";
import { PointBar } from "./organisms/PointBar";

export const metadata: Metadata = {
  title: "Flexir",
  description: "Trade First, Stay Ahead",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Box maxW={"1920px"} mx="auto">
            <AccountProvider>
              <Box>
                <Header />
                <PointBar />
                <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              </Box>
            </AccountProvider>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
