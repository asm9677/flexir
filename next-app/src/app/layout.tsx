import type { Metadata } from "next";
import "./globals.css";

import React from "react";
import { Suspense } from "react";
// import { fonts } from "./fonts";
import { Providers } from "./providers";
import { Box } from "@chakra-ui/react";
import { AccountProvider } from "@/context/AccountProvider";
import { Header } from "@/components/organisms/Header";
import { PointBar } from "@/components/organisms/PointBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Flexir",
  description: "Trade First, Stay Ahead",
  icons: {
    icon: "/images/Flexir.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastContainer />
        <Providers>
          <Box maxW={"1920px"} minH={"100vh"} mx="auto">
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
