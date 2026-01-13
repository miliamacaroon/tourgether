import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Star } from 'lucide-react';
import DayCard from './DayCard';
import { AttractionData } from '@/services/itineraryService';

interface ItineraryContentProps {
  itinerary: string;
  attractions: AttractionData[];
  daysCount: number;
}

interface DayContent {
  dayNumber: number;
  title: string;
  content: string;
}

const ItineraryContent = ({ itinerary, attractions, daysCount }: ItineraryContentProps) => {
  // Parse itinerary into day sections
  const dayContents = useMemo(() => {
    const days: DayContent[] = [];
    const lines = itinerary.split('\n');
    let currentDay: DayContent | null = null;
    let contentLines: string[] = [];
    
    for (const line of lines) {
      const dayMatch = line.match(/^## Day (\d+)/);
      
      if (dayMatch) {
        // Save previous day if exists
        if (currentDay) {
          currentDay.content = contentLines.join('\n');
          days.push(currentDay);
        }
        
        // Start new day
        currentDay = {
          dayNumber: parseInt(dayMatch[1]),
          title: line.replace('## ', '').trim(),
          content: ''
        };
        contentLines = [];
      } else if (currentDay) {
        contentLines.push(line);
      }
    }
    
    // Save last day
    if (currentDay) {
      currentDay.content = contentLines.join('\n');
      days.push(currentDay);
    }
    
    return days;
  }, [itinerary]);

  // Distribute attractions across days
  const getAttractionsForDay = (dayIndex: number) => {
    const attractionsPerDay = Math.ceil(attractions.length / daysCount);
    return attractions.slice(
      dayIndex * attractionsPerDay,
      (dayIndex + 1) * attractionsPerDay
    ).slice(0, 3);
  };

  // If no day structure found, render as a single card
  if (dayContents.length === 0) {
    return (
      <div className="bg-card rounded-3xl border border-border/50 shadow-xl p-6 md:p-10">
        <ReactMarkdown
          components={markdownComponents}
          remarkPlugins={[remarkGfm]}
        >
          {itinerary}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <>
      {dayContents.map((day) => (
        <DayCard
          key={day.dayNumber}
          dayNumber={day.dayNumber}
          title={day.title}
          attractions={getAttractionsForDay(day.dayNumber - 1)}
          totalDays={daysCount}
        >
          <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
          >
            {day.content}
          </ReactMarkdown>
        </DayCard>
      ))}
    </>
  );
};

// Markdown component styling
const markdownComponents = {
  h3: ({ children }: { children?: React.ReactNode }) => (
    <div className="mt-6 mb-4 first:mt-0">
      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/15 to-accent/15 text-foreground px-4 py-2.5 rounded-xl border border-primary/20 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent-foreground animate-pulse" />
        <span className="text-sm font-semibold">{children}</span>
      </div>
    </div>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-foreground/85 leading-relaxed mb-4 text-sm md:text-base">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="space-y-2 mb-6 list-none">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="space-y-2 mb-6 list-none">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex items-start gap-3 text-foreground/85 text-sm md:text-base p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 border-l-4 border-primary/50 hover:border-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/5 transition-all duration-300 shadow-sm hover:shadow-md">
      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent-foreground mt-2 shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground bg-gradient-to-r from-primary/10 to-transparent px-1 rounded">
      {children}
    </strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <span className="text-muted-foreground italic">{children}</span>
  ),
  hr: () => (
    <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border/50 shadow-lg">
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody className="bg-card">
      {children}
    </tbody>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-4 py-3 text-left font-semibold text-sm">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-4 py-3 text-sm text-foreground">
      {children}
    </td>
  ),
};

export default ItineraryContent;
