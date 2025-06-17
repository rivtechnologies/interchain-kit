"use client";
import "@interchain-kit/react/styles.css";
import { InterchainKit } from "@/context/InterchainKit";
import { Starship } from "@/context/starship";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Starship>
          <InterchainKit>{children}</InterchainKit>
        </Starship>
      </body>
    </html>
  );
}
