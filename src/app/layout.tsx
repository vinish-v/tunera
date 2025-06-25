
import type { Metadata, Viewport } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { Info, Music, Heart, Sparkles, Library } from 'lucide-react';
import Link from 'next/link';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Tunera',
  description: 'Find music that matches your mood.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: "#1A191B",
};

const navItems = [
    { href: '/', label: 'Home', icon: Sparkles },
    { href: '/favourites', label: 'Favourites', icon: Heart },
    { href: '/my-music', label: 'My Music', icon: Library },
    { href: '/about', label: 'About Us', icon: Info },
];

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
                        <span className="text-2xl font-headline group-data-[collapsible=icon]:hidden">Tunera</span>
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
                            <SidebarMenuButton tooltip="My Music" asChild>
                                <Link href="/my-music">
                                    <Library />
                                    <span>My Music</span>
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
                {children}
            </SidebarInset>
        </SidebarProvider>
        
        <footer className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur-sm md:hidden z-20">
            <nav className="flex h-full items-center justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground transition-colors hover:text-primary"
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </footer>

        <Toaster />
      </body>
    </html>
  );
}
