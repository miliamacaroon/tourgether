import { ArrowLeft, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TripWizard } from '@/components/trip-wizard/TripWizard';

const Plan = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          
          <Link to="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">TourGether</span>
          </Link>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Wizard */}
      <TripWizard />
    </div>
  );
};

export default Plan;
