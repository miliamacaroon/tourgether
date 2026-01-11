import { DollarSign, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY_OPTIONS } from '@/types/trip';

interface BudgetStepProps {
  budgetMin: number;
  budgetMax: number;
  currency: string;
  onBudgetMinChange: (value: number) => void;
  onBudgetMaxChange: (value: number) => void;
  onCurrencyChange: (value: string) => void;
}

export const BudgetStep = ({
  budgetMin,
  budgetMax,
  currency,
  onBudgetMinChange,
  onBudgetMaxChange,
  onCurrencyChange,
}: BudgetStepProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Wallet className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wide">Step 3</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          What's your budget?
        </h2>
        <p className="text-muted-foreground text-lg">
          Set your minimum and maximum budget for this trip
        </p>
      </div>

      {/* Currency Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Currency</label>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="h-14 rounded-xl border-2 text-lg">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCY_OPTIONS.map((curr) => (
              <SelectItem key={curr} value={curr}>
                {curr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Range Inputs */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Minimum Budget</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {currency}
            </div>
            <Input
              type="number"
              value={budgetMin}
              onChange={(e) => onBudgetMinChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-16 pl-16 pr-4 text-2xl font-bold rounded-xl border-2 bg-card"
              placeholder="0"
              min={0}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum amount you're willing to spend
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Maximum Budget</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {currency}
            </div>
            <Input
              type="number"
              value={budgetMax}
              onChange={(e) => onBudgetMaxChange(Math.max(budgetMin, parseInt(e.target.value) || budgetMin))}
              className="h-16 pl-16 pr-4 text-2xl font-bold rounded-xl border-2 bg-card"
              placeholder="0"
              min={budgetMin}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum amount you're comfortable with
          </p>
        </div>
      </div>

      {/* Budget Preview */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/30 rounded-2xl p-6 text-center space-y-2">
        <DollarSign className="w-8 h-8 mx-auto text-primary" />
        <p className="text-lg text-foreground">Your budget range</p>
        <p className="text-3xl font-bold text-primary">
          {currency} {budgetMin.toLocaleString()} – {budgetMax.toLocaleString()}
        </p>
      </div>

      {/* Quick Budget Options */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { min: 500, max: 1500, label: 'Budget' },
          { min: 1500, max: 4000, label: 'Moderate' },
          { min: 4000, max: 10000, label: 'Luxury' },
          { min: 10000, max: 25000, label: 'Premium' },
        ].map((option) => (
          <button
            key={option.label}
            onClick={() => {
              onBudgetMinChange(option.min);
              onBudgetMaxChange(option.max);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              budgetMin === option.min && budgetMax === option.max
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
