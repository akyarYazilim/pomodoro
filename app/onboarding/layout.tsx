export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Hoş Geldiniz</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hadi her şeyi birlikte ayarlayalım.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
