// app/not-found.tsx
import NotFoundGoBackButton from "@/components/NotFoundGoBackButton";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-semibold mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn’t find that page. Try going back or head to the homepage.
        </p>

        <div className="flex justify-center">
          <NotFoundGoBackButton />
        </div>
      </div>
    </main>
  );
}
