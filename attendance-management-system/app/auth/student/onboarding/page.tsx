import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

const OnboardingPage = () => {
  return (
    <div className="flex h-screen max-w-4xl mx-auto flex-col items-center justify-evenly bg-gray-100">
      <p className="text-lg text-center text-balance-700 max-w-md px-5">
        <span className="text-primary font-semibold">Note: </span>
        <span>
          you&apos;d be redirected to te login page to fill your login details
        </span>
      </p>
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/memo-image.png"
          alt="Memo Image"
          width={300}
          height={300}
          className="mt-6"
        />
      </div>
      <div className="w-full flex items-center justify-center max-w-md px-5">
        <Button size="lg" className="w-full" asChild>
          <Link href="/auth/student/log-in"> Done </Link>
        </Button>
      </div>
    </div>
  );
}

export default OnboardingPage