
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Users, User } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="flex flex-1 flex-col items-center p-4 sm:p-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-center text-3xl font-headline">About Camood</CardTitle>
                    <CardDescription className="text-center pt-2">
                        Meet the team behind the music and the mood.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator />
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 font-semibold text-lg">
                            <User className="w-5 h-5 text-primary" />
                            Founder
                        </h3>
                        <p className="pl-7 text-muted-foreground">vinish</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 font-semibold text-lg">
                            <Users className="w-5 h-5 text-primary" />
                            Co-Founders
                        </h3>
                        <ul className="pl-7 list-disc list-inside text-muted-foreground space-y-1">
                            <li>nithya sri</li>
                            <li>srijit</li>
                        </ul>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 font-semibold text-lg">
                            <Mail className="w-5 h-5 text-primary" />
                            Contact Us
                        </h3>
                        <a href="mailto:viniv6687@gmail.com" className="pl-7 text-primary hover:underline">
                            viniv6687@gmail.com
                        </a>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
