import HorizontalRule from "@/components/horizontal";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen max-w-4xl mx-auto flex-col items-center justify-between p-20">
      <div>
        <h1 className="text-3xl font-bold text-primary">KCS. 2.0</h1>
        <HorizontalRule />
      </div>
      <div>
        <Image src="/logo.png" alt="logo" width={250} height={250} />
        <p className="mt-2 text-muted-foreground text-center text-sm">
          Attendance Made Simple
        </p>
      </div>

      <Button size={"lg"} className="w-full" asChild aria-label="Get Started">
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </div>
  );
}
