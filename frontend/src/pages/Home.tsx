import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Brain, 
  Clock, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  Database,
  LineChart
} from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Data Collection",
    description: "Historical accident data is collected from traffic monitoring systems.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Machine learning models analyze patterns in time-series data.",
  },
  {
    icon: TrendingUp,
    title: "Forecasting",
    description: "ARIMA and Prophet models predict future accident probabilities.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Alert",
    description: "Authorities receive alerts for high-risk time slots.",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Proactive Response",
    description: "Allocate resources before accidents occur based on predictions.",
  },
  {
    icon: Shield,
    title: "Enhanced Safety",
    description: "Reduce accident rates through informed traffic management.",
  },
  {
    icon: LineChart,
    title: "Data-Driven Decisions",
    description: "Make evidence-based policy decisions for traffic safety.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-hero-gradient py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6 animate-fade-in">
              Time-Series Forecasting for{" "}
              <span className="text-accent">Peak Hour Traffic Accidents</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Predicting Peak Hour Traffic Accident Risks using AI and Time Series Forecasting
              for Smarter, Safer Cities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/dashboard">
                  <BarChart3 className="h-5 w-5" />
                  View Dashboard
                </Link>
              </Button>
              <Button asChild size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/prediction">
                  <Brain className="h-5 w-5" />
                  Predict Risk Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Problem Statement */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              The Challenge We're Solving
            </h2>
            <p className="text-lg text-muted-foreground">
              Traffic accidents during peak hours cause significant loss of life, economic damage,
              and urban congestion. Traditional reactive approaches are insufficient for modern
              smart cities.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="h-12 w-12 rounded-lg bg-danger/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1.35 Million Deaths</h3>
              <p className="text-sm text-muted-foreground">
                Annual global road traffic deaths according to WHO statistics.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Peak Hour Concentration</h3>
              <p className="text-sm text-muted-foreground">
                60% of accidents occur during morning and evening peak hours.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Predictable Patterns</h3>
              <p className="text-sm text-muted-foreground">
                Historical data reveals patterns that AI can leverage for prediction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              How Our System Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From data collection to real-time risk alerts, our AI-powered pipeline
              ensures proactive traffic safety management.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative bg-card rounded-xl p-6 shadow-card border border-border animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 mt-2">
                  <step.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Benefits to Traffic Authorities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empower decision-makers with actionable insights for safer roads.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Ready to Explore the System?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Dive into the dashboard to see real-time analytics or make a prediction
              for any time slot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/dashboard">
                  <BarChart3 className="h-5 w-5" />
                  View Dashboard
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/prediction">
                  Predict Risk Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
