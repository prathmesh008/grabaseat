import { Raleway, Work_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";



const raleway = Raleway({ subsets: ["latin"] });
const worksans = Work_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Grab A Seat",
  description: "Developed By Sharad Jadhav",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={worksans.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
