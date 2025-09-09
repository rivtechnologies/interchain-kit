import './globals.css';

import { InterchainKit } from '@/context/InterchainKit';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <InterchainKit>{children}</InterchainKit>
      </body>
    </html>
  );
}
