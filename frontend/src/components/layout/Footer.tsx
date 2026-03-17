import { Activity, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold">
                Traffic<span className="text-accent">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered traffic accident prediction system for smart city safety management.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/prediction" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Predict Risk
              </Link>
              <Link to="/dataset" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View Dataset
              </Link>
            </nav>
          </div>

          {/* Project Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Project Info</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Final Year Engineering Project</p>
              <p>Time-Series Forecasting for Peak Hour Traffic Accidents</p>
              <p className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-danger fill-danger" /> by [Developer Name]
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TrafficAI. Final Year B.E. Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
