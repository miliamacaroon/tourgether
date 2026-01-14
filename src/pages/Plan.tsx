import { ArrowLeft, Globe, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TripWizard } from '@/components/trip-wizard/TripWizard';

const Plan = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-primary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-all duration-300 group">
            <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-medium">Back</span>
          </Link>
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 group-hover:from-primary group-hover:to-accent-foreground bg-clip-text text-transparent transition-all">
              TourGether
            </span>
          </Link>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Hero section for wizard */}
      <div className="relative z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent py-8 border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/10 px-4 py-2 rounded-full mb-4 border border-primary/20 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI Trip Planner</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Plan Your{' '}
            <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Perfect Trip
            </span>
          </h1>
          <p className="text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Tell us about your dream vacation and we'll create a personalized itinerary
          </p>
        </div>
      </div>

      {/* Wizard */}
      <div className="relative z-10">
        <TripWizard />
      </div>
    </div>
  );
};

export default Plan;
