import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:4187";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;

  return {
    title: "KFlow · 企业智能工作客户端",
    description: "面向企业研发与日常办公的任务对话式智能工作客户端 Demo",
    openGraph: {
      title: "KFlow · 企业智能工作客户端",
      description: "任务即对话，Agent 按需调用。",
      images: [{ url: imageUrl, width: 1668, height: 939 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "KFlow · 企业智能工作客户端",
      description: "任务即对话，Agent 按需调用。",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
