import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Slide, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { ConnectivityAlert } from "@/components";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "SE Electronics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConnectivityAlert />
        {children}
        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          draggable
          pauseOnHover
          theme="colored"
          transition={Slide}
        />
      </body>
    </html>
  );
}
