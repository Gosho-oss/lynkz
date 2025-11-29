import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Link2, Palette, BarChart3, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Link2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Lynkz</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" data-testid="link-login">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button data-testid="link-register">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Your links, your style
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            One link to share{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              everything
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Create a beautiful, customizable page with all your important links. 
            Share your content, social profiles, and more with a single URL.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="min-h-12 px-8 text-base" data-testid="button-get-started">
                Create Your Lynkz
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/u/demo">
              <Button variant="outline" size="lg" className="min-h-12 px-8 text-base" data-testid="button-see-demo">
                See Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Simple, powerful tools to manage and share your online presence.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={<Link2 className="w-6 h-6" />}
              title="Unlimited Links"
              description="Add as many links as you want. Organize, reorder, and manage them with ease."
            />
            <FeatureCard
              icon={<Palette className="w-6 h-6" />}
              title="Beautiful Themes"
              description="Choose from stunning pre-built themes or customize colors, fonts, and styles."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Simple Analytics"
              description="Track views and clicks to understand what your audience loves most."
            />
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Express your style
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Pick a theme that matches your vibe. From minimal to vibrant.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ThemePreview name="Minimal" bg="bg-white" />
            <ThemePreview name="Sunset" bg="bg-gradient-to-br from-orange-400 to-pink-500" />
            <ThemePreview name="Ocean" bg="bg-gradient-to-b from-blue-500 to-cyan-400" />
            <ThemePreview name="Neon" bg="bg-gradient-to-br from-purple-900 to-pink-600" premium />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-8 sm:p-12 border border-primary/20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of creators sharing their content with Lynkz.
          </p>
          <Link href="/register">
            <Button size="lg" className="min-h-12 px-8 text-base" data-testid="button-create-free">
              Create Your Free Page
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Link2 className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold">Lynkz</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with care for creators everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-card-border hover-elevate">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function ThemePreview({ name, bg, premium }: { name: string; bg: string; premium?: boolean }) {
  return (
    <div className="relative group">
      <div className={`aspect-[3/4] rounded-xl ${bg} p-4 flex flex-col items-center justify-center gap-2 border border-border/50 transition-transform group-hover:scale-[1.02]`}>
        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur" />
        <div className="w-16 h-2 rounded-full bg-white/40" />
        <div className="space-y-2 w-full px-2 mt-2">
          <div className="h-6 rounded-full bg-white/20" />
          <div className="h-6 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1">
        <span className="text-sm font-medium">{name}</span>
        {premium && (
          <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full">
            PRO
          </span>
        )}
      </div>
    </div>
  );
}
