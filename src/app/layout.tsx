
import type { Metadata, Viewport } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { User, Info, Music, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Camood',
  description: 'Find music that matches your mood.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ptSans.variable} dark`}>
      <head />
      <body className="font-body antialiased">
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className="p-2 justify-between">
                    <div className="flex items-center gap-2">
                        <Music className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-headline group-data-[collapsible=icon]:hidden">Camood</span>
                    </div>
                    <SidebarTrigger className="hidden md:flex" />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Home" asChild>
                                <Link href="/">
                                    <Sparkles />
                                    <span>Home</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Favourites" asChild>
                                <Link href="/favourites">
                                    <Heart />
                                    <span>Favourites</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="About Us" asChild>
                                <Link href="/about">
                                    <Info />
                                    <span>About Us</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="flex items-center justify-start p-2 border-b md:hidden sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 ml-2">
                        <Music className="w-6 h-6 text-primary" />
                        <h1 className="text-xl font-headline">Camood</h1>
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
