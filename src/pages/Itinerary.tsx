import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Calendar, Wallet, Users, Download, Share2, Sparkles, Clock, Loader2, MapPin, Star, Database, Search, Compass, Plane, Map } from 'lucide-react';
import ItineraryContent from '@/components/itinerary/ItineraryContent';
import ItineraryMap from '@/components/itinerary/ItineraryMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { AttractionData, RestaurantData } from '@/services/itineraryService';

interface StoredTripData {
  destination: string;
  startDate: string;
  endDate: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  tripType: string;
  pace: string;
  diningStyle: string;
  travelers: number;
  daysCount: number;
}

interface StoredSources {
  databaseAttractions: number;
  databaseRestaurants: number;
  webSources: number;
}

const Itinerary = () => {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState<StoredTripData | null>(null);
  const [itinerary, setItinerary] = useState<string>('');
  const [attractions, setAttractions] = useState<AttractionData[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [sources, setSources] = useState<StoredSources | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const itineraryContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedTripData = sessionStorage.getItem('tripData');
    const storedItinerary = sessionStorage.getItem('generatedItinerary');
    const storedAttractions = sessionStorage.getItem('generatedAttractions');
    const storedRestaurants = sessionStorage.getItem('generatedRestaurants');
    const storedSources = sessionStorage.getItem('generatedSources');
    
    if (storedTripData) {
      setTripData(JSON.parse(storedTripData));
    }
    
    if (storedItinerary) {
      setItinerary(storedItinerary);
    }

    if (storedAttractions) {
      setAttractions(JSON.parse(storedAttractions));
    }

    if (storedRestaurants) {
      setRestaurants(JSON.parse(storedRestaurants));
    }

    if (storedSources) {
      setSources(JSON.parse(storedSources));
    }
    
    if (!storedTripData || !storedItinerary) {
      navigate('/plan');
      return;
    }
    
    setIsLoading(false);
  }, [navigate]);

  // Handle marker click - scroll to the attraction/restaurant in the itinerary
  const handleMarkerClick = useCallback((markerId: number, type: 'attraction' | 'restaurant') => {
    // Find the element by data attribute and scroll to it
    const element = document.querySelector(`[data-marker-id="${type}-${markerId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect
      element.classList.add('ring-4', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const exportToPDF = async () => {
    if (!tripData) return;
    
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = margin;

      // Colors - Teal, Amber, Pink palette
      const primary = { r: 20, g: 184, b: 166 };        // Teal-500
      const primaryDark = { r: 15, g: 118, b: 110 };    // Teal-700
      const primaryLight = { r: 204, g: 251, b: 241 };  // Teal-50
      const accent = { r: 236, g: 72, b: 153 };         // Pink-500
      const accentDark = { r: 190, g: 24, b: 93 };      // Pink-700
      const accentLight = { r: 252, g: 231, b: 243 };   // Pink-50
      const gold = { r: 234, g: 179, b: 8 };            // Amber-500
      const goldDark = { r: 161, g: 98, b: 7 };         // Amber-700
      const goldLight = { r: 254, g: 249, b: 195 };     // Amber-50
      const darkGray = { r: 30, g: 30, b: 46 };
      const mediumGray = { r: 100, g: 100, b: 120 };
      const lightGray = { r: 248, g: 250, b: 252 };

      // Helper to strip emojis from text (jsPDF doesn't support them)
      const stripEmojis = (text: string) => {
        return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu, '').trim();
      };

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - 30) {
          doc.addPage();
          yPosition = margin + 5;
          return true;
        }
        return false;
      };

      // Helper function to load image as base64
      const loadImageAsBase64 = async (url: string): Promise<string | null> => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        } catch {
          return null;
        }
      };

      // Pre-load all images
      const attractionImagesMap: globalThis.Map<number, string> = new globalThis.Map();
      const restaurantImagesMap: globalThis.Map<number, string> = new globalThis.Map();
      
      await Promise.all([
        ...attractions.map(async (attraction) => {
          if (attraction.picture) {
            const base64 = await loadImageAsBase64(attraction.picture);
            if (base64) attractionImagesMap.set(attraction.id, base64);
          }
        }),
        ...restaurants.map(async (restaurant) => {
          if (restaurant.picture) {
            const base64 = await loadImageAsBase64(restaurant.picture);
            if (base64) restaurantImagesMap.set(restaurant.id, base64);
          }
        })
      ]);

      // ==================== COVER PAGE ====================
      
      // Full page teal header
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(0, 0, pageWidth, 100, 'F');
      
      // Decorative pink accent corner
      doc.setFillColor(accent.r, accent.g, accent.b);
      doc.triangle(pageWidth - 50, 0, pageWidth, 0, pageWidth, 50, 'F');
      
      // Decorative amber accent
      doc.setFillColor(gold.r, gold.g, gold.b);
      doc.circle(0, 100, 30, 'F');
      
      // Brand name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('TourGether', pageWidth / 2, 40, { align: 'center' });
      
      // Destination - Large centered
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(tripData.destination.toUpperCase(), pageWidth / 2, 65, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`${tripData.daysCount}-Day Travel Itinerary`, pageWidth / 2, 85, { align: 'center' });
      
      yPosition = 120;
      
      // Trip Details Table
      doc.setFillColor(primaryLight.r, primaryLight.g, primaryLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 15, 3, 3, 'F');
      doc.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Trip Details', margin + 5, yPosition + 10);
      
      yPosition += 18;
      
      // Helper to format text: replace underscores and capitalize each word
      const toTitleCase = (str: string) => {
        return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      };

      const tripDetails = [
        { label: 'Duration', value: `${tripData.daysCount} Days` },
        { label: 'Dates', value: `${formatDate(tripData.startDate)} - ${formatDate(tripData.endDate)}` },
        { label: 'Budget', value: `${tripData.currency} ${tripData.budgetMin.toLocaleString()} - ${tripData.budgetMax.toLocaleString()}` },
        { label: 'Travelers', value: `${tripData.travelers} ${tripData.travelers === 1 ? 'Person' : 'People'}` },
        { label: 'Focus', value: toTitleCase(tripData.tripType) },
        { label: 'Pace', value: toTitleCase(tripData.pace) },
        { label: 'Dining', value: toTitleCase(tripData.diningStyle) },
        { label: 'Generated', value: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
      ];
      
      tripDetails.forEach((detail, i) => {
        const rowY = yPosition + i * 12;
        doc.setFillColor(i % 2 === 0 ? 255 : lightGray.r, i % 2 === 0 ? 255 : lightGray.g, i % 2 === 0 ? 255 : lightGray.b);
        doc.rect(margin, rowY, contentWidth, 12, 'F');
        
        doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.label, margin + 5, rowY + 8);
        
        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFont('helvetica', 'bold');
        doc.text(detail.value, margin + 60, rowY + 8);
      });
      
      yPosition += tripDetails.length * 12 + 15;
      
      // Disclaimer
      doc.setFillColor(goldLight.r, goldLight.g, goldLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
      doc.setTextColor(goldDark.r, goldDark.g, goldDark.b);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      const disclaimer = 'This itinerary was AI-generated based on your preferences. Please verify opening hours, prices, and availability before your trip.';
      const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 10);
      doc.text(disclaimerLines, margin + 5, yPosition + 10);
      
      // ==================== ITINERARY PAGES ====================
      doc.addPage();
      yPosition = margin;
      
      // Page header
      doc.setFillColor(primaryLight.r, primaryLight.g, primaryLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 12, 3, 3, 'F');
      doc.setTextColor(primaryDark.r, primaryDark.g, primaryDark.b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Itinerary', margin + 5, yPosition + 8);
      
      yPosition += 20;
      
      // Parse and render markdown content
      const lines = itinerary.split('\n');
      let currentDayColor = primary;
      let inTable = false;
      let tableHeaders: string[] = [];
      let tableRows: string[][] = [];
      
      const renderTable = () => {
        if (tableHeaders.length === 0 && tableRows.length === 0) return;
        
        checkPageBreak(20 + tableRows.length * 12);
        
        const colCount = tableHeaders.length || (tableRows[0]?.length || 2);
        const colWidth = (contentWidth - 10) / colCount;
        
        // Table header
        if (tableHeaders.length > 0) {
          doc.setFillColor(primaryDark.r, primaryDark.g, primaryDark.b);
          doc.rect(margin + 5, yPosition, contentWidth - 10, 10, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          
          tableHeaders.forEach((header, i) => {
            const cleanHeader = stripEmojis(header);
            const truncated = cleanHeader.length > 25 ? cleanHeader.substring(0, 22) + '...' : cleanHeader;
            doc.text(truncated, margin + 8 + i * colWidth, yPosition + 7);
          });
          yPosition += 10;
        }
        
        // Table rows
        tableRows.forEach((row, rowIndex) => {
          checkPageBreak(12);
          doc.setFillColor(rowIndex % 2 === 0 ? 255 : lightGray.r, rowIndex % 2 === 0 ? 255 : lightGray.g, rowIndex % 2 === 0 ? 255 : lightGray.b);
          doc.rect(margin + 5, yPosition, contentWidth - 10, 10, 'F');
          
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          
          row.forEach((cell, i) => {
            const cleanCell = stripEmojis(cell);
            const truncated = cleanCell.length > 30 ? cleanCell.substring(0, 27) + '...' : cleanCell;
            doc.text(truncated, margin + 8 + i * colWidth, yPosition + 7);
          });
          yPosition += 10;
        });
        
        yPosition += 5;
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      };
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          if (inTable) renderTable();
          yPosition += 3;
          continue;
        }
        
        // Skip horizontal rules (---, ***, ___)
        if (/^[-*_]{3,}$/.test(trimmedLine)) {
          continue;
        }
        
        // Detect markdown table
        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
          const cells = trimmedLine.split('|').filter(c => c.trim()).map(c => c.trim());
          
          // Check if this is a separator row (|---|---|)
          if (cells.every(c => /^[-:]+$/.test(c))) {
            continue; // Skip separator
          }
          
          if (!inTable) {
            inTable = true;
            tableHeaders = cells;
          } else {
            tableRows.push(cells);
          }
          continue;
        } else if (inTable) {
          renderTable();
        }
        
        // Day headers (## Day X)
        if (trimmedLine.startsWith('## ')) {
          checkPageBreak(25);
          yPosition += 8;
          
          const dayMatch = trimmedLine.match(/Day (\d+)/);
          const dayNumber = dayMatch ? parseInt(dayMatch[1]) : 1;
          const dayTitle = stripEmojis(trimmedLine.replace('## ', ''));
          
          // Cycle colors: teal, pink, amber
          const colors = [primary, accent, gold];
          currentDayColor = colors[(dayNumber - 1) % 3];
          
          // Day header bar
          doc.setFillColor(currentDayColor.r, currentDayColor.g, currentDayColor.b);
          doc.roundedRect(margin, yPosition, contentWidth, 16, 3, 3, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(dayTitle, margin + 8, yPosition + 11);
          
          yPosition += 22;
        }
        // Section headers (### like "Estimated Total Costs", "Travel Tips")
        else if (trimmedLine.startsWith('### ')) {
          checkPageBreak(18);
          yPosition += 8;
          
          const sectionTitle = stripEmojis(trimmedLine.replace('### ', '').replace(/\*/g, ''));
          
          // Section header with accent color
          doc.setFillColor(accentLight.r, accentLight.g, accentLight.b);
          doc.roundedRect(margin, yPosition, contentWidth, 14, 3, 3, 'F');
          
          doc.setTextColor(accentDark.r, accentDark.g, accentDark.b);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(sectionTitle, margin + 8, yPosition + 10);
          
          yPosition += 20;
        }
        // Bold text with time (e.g., **8:00 AM - Activity**)
        else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          checkPageBreak(14);
          doc.setTextColor(currentDayColor.r, currentDayColor.g, currentDayColor.b);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const cleanText = stripEmojis(trimmedLine.replace(/\*\*/g, ''));
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 15);
          doc.text(splitText, margin + 10, yPosition);
          yPosition += splitText.length * 5 + 4;
        }
        // Numbered list items (1. 2. 3. etc)
        else if (/^\d+\.\s/.test(trimmedLine)) {
          checkPageBreak(14);
          
          doc.setFillColor(currentDayColor.r, currentDayColor.g, currentDayColor.b);
          doc.circle(margin + 14, yPosition - 1, 1.5, 'F');
          
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const cleanText = stripEmojis(trimmedLine.replace(/\*\*/g, '').replace(/\*/g, ''));
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 25);
          doc.text(splitText, margin + 20, yPosition);
          yPosition += splitText.length * 5 + 4;
        }
        // List items
        else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          checkPageBreak(14);
          
          // Colored bullet
          doc.setFillColor(currentDayColor.r, currentDayColor.g, currentDayColor.b);
          doc.circle(margin + 14, yPosition - 1, 1.5, 'F');
          
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const cleanText = stripEmojis(trimmedLine.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').replace(/\*/g, ''));
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 25);
          doc.text(splitText, margin + 20, yPosition);
          yPosition += splitText.length * 5 + 4;
        }
        // Regular paragraphs
        else if (!trimmedLine.startsWith('#')) {
          checkPageBreak(14);
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const cleanText = stripEmojis(trimmedLine.replace(/\*\*/g, '').replace(/\*/g, ''));
          const splitText = doc.splitTextToSize(cleanText, contentWidth - 20);
          doc.text(splitText, margin + 10, yPosition);
          yPosition += splitText.length * 5 + 3;
        }
      }
      
      // Render any remaining table
      if (inTable) renderTable();
      
      // ==================== BUDGET BREAKDOWN ====================
      checkPageBreak(90);
      yPosition += 12;
      
      // Budget section header
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.roundedRect(margin, yPosition, contentWidth, 14, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Budget Breakdown', margin + 5, yPosition + 10);
      
      yPosition += 20;
      
      // Budget table
      const budgetData = [
        { category: 'Activities & Attractions', allocation: '40%', notes: 'Entry fees, tours, experiences' },
        { category: 'Dining & Food', allocation: '35%', notes: 'Meals, snacks, beverages' },
        { category: 'Transport & Misc', allocation: '25%', notes: 'Local transport, tips, souvenirs' },
      ];
      
      // Table header
      doc.setFillColor(primaryDark.r, primaryDark.g, primaryDark.b);
      doc.rect(margin, yPosition, contentWidth, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Expense Category', margin + 5, yPosition + 7);
      doc.text('Allocation', margin + 85, yPosition + 7);
      doc.text('Notes', margin + 115, yPosition + 7);
      
      yPosition += 10;
      
      // Table rows
      budgetData.forEach((row, i) => {
        const rowY = yPosition + i * 10;
        doc.setFillColor(i % 2 === 0 ? 255 : lightGray.r, i % 2 === 0 ? 255 : lightGray.g, i % 2 === 0 ? 255 : lightGray.b);
        doc.rect(margin, rowY, contentWidth, 10, 'F');
        
        doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(row.category, margin + 5, rowY + 7);
        doc.setFont('helvetica', 'bold');
        doc.text(row.allocation, margin + 85, rowY + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(row.notes, margin + 115, rowY + 7);
      });
      
      yPosition += 35;
      
      // Total row
      doc.setFillColor(goldLight.r, goldLight.g, goldLight.b);
      doc.rect(margin, yPosition, contentWidth, 12, 'F');
      doc.setTextColor(goldDark.r, goldDark.g, goldDark.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Budget Range: ${tripData.currency} ${tripData.budgetMin.toLocaleString()} - ${tripData.budgetMax.toLocaleString()} (Flexible based on choices)`, margin + 5, yPosition + 8);
      
      // ==================== FEATURED ATTRACTIONS ====================
      if (attractions.length > 0) {
        doc.addPage();
        yPosition = margin;
        
        // Section header
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.roundedRect(margin, yPosition, contentWidth, 14, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Featured Attractions', margin + 5, yPosition + 10);
        
        yPosition += 22;
        
        // Display attractions with images (2 columns)
        const attractionRows = Math.ceil(attractions.length / 2);
        const cardWidth = (contentWidth - 10) / 2;
        const cardHeight = 45;
        
        for (let row = 0; row < attractionRows; row++) {
          checkPageBreak(cardHeight + 10);
          
          for (let col = 0; col < 2; col++) {
            const idx = row * 2 + col;
            if (idx >= attractions.length) break;
            
            const attraction = attractions[idx];
            const xPos = margin + col * (cardWidth + 10);
            
            // Card background
            doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
            doc.roundedRect(xPos, yPosition, cardWidth, cardHeight, 3, 3, 'F');
            
            // Card border
            doc.setDrawColor(primary.r, primary.g, primary.b);
            doc.setLineWidth(0.5);
            doc.roundedRect(xPos, yPosition, cardWidth, cardHeight, 3, 3, 'S');
            
            // Image area (left side of card)
            const imgWidth = 35;
            const imgHeight = cardHeight - 6;
            const imageBase64 = attractionImagesMap.get(attraction.id);
            
            if (imageBase64) {
              try {
                doc.addImage(imageBase64, 'JPEG', xPos + 3, yPosition + 3, imgWidth, imgHeight);
              } catch {
                // Fallback if image fails
                doc.setFillColor(primaryLight.r, primaryLight.g, primaryLight.b);
                doc.roundedRect(xPos + 3, yPosition + 3, imgWidth, imgHeight, 2, 2, 'F');
              }
            } else {
              doc.setFillColor(primaryLight.r, primaryLight.g, primaryLight.b);
              doc.roundedRect(xPos + 3, yPosition + 3, imgWidth, imgHeight, 2, 2, 'F');
              doc.setTextColor(primary.r, primary.g, primary.b);
              doc.setFontSize(8);
              doc.setFont('helvetica', 'normal');
              doc.text('No Image', xPos + 10, yPosition + imgHeight / 2 + 3);
            }
            
            // Attraction name
            const textXPos = xPos + imgWidth + 8;
            const textWidth = cardWidth - imgWidth - 12;
            
            doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            const nameLines = doc.splitTextToSize(attraction.name, textWidth);
            doc.text(nameLines.slice(0, 2), textXPos, yPosition + 10);
            
            // Rating
            if (attraction.rating) {
              const ratingY = yPosition + (nameLines.length > 1 ? 22 : 18);
              doc.setFillColor(gold.r, gold.g, gold.b);
              doc.circle(textXPos + 3, ratingY - 1, 3, 'F');
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(6);
              doc.setFont('helvetica', 'bold');
              doc.text('★', textXPos + 1.5, ratingY + 1);
              
              doc.setTextColor(goldDark.r, goldDark.g, goldDark.b);
              doc.setFontSize(8);
              doc.text(`${attraction.rating}`, textXPos + 9, ratingY);
            }
            
            // Description snippet
            if (attraction.description) {
              const descY = attraction.rating ? yPosition + 30 : yPosition + 22;
              doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
              doc.setFontSize(7);
              doc.setFont('helvetica', 'normal');
              const descLines = doc.splitTextToSize(stripEmojis(attraction.description), textWidth);
              doc.text(descLines.slice(0, 2), textXPos, descY);
            }
          }
          
          yPosition += cardHeight + 8;
        }
      }
      
      // ==================== DINING RECOMMENDATIONS ====================
      if (restaurants.length > 0) {
        checkPageBreak(80);
        if (yPosition > margin + 20) {
          yPosition += 10;
        }
        
        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = margin;
        }
        
        // Section header
        doc.setFillColor(accent.r, accent.g, accent.b);
        doc.roundedRect(margin, yPosition, contentWidth, 14, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Dining Recommendations', margin + 5, yPosition + 10);
        
        yPosition += 22;
        
        // Display restaurants with images (2 columns)
        const restaurantRows = Math.ceil(restaurants.length / 2);
        const cardWidth = (contentWidth - 10) / 2;
        const cardHeight = 45;
        
        for (let row = 0; row < restaurantRows; row++) {
          checkPageBreak(cardHeight + 10);
          
          for (let col = 0; col < 2; col++) {
            const idx = row * 2 + col;
            if (idx >= restaurants.length) break;
            
            const restaurant = restaurants[idx];
            const xPos = margin + col * (cardWidth + 10);
            
            // Card background
            doc.setFillColor(lightGray.r, lightGray.g, lightGray.b);
            doc.roundedRect(xPos, yPosition, cardWidth, cardHeight, 3, 3, 'F');
            
            // Card border
            doc.setDrawColor(accent.r, accent.g, accent.b);
            doc.setLineWidth(0.5);
            doc.roundedRect(xPos, yPosition, cardWidth, cardHeight, 3, 3, 'S');
            
            // Image area (left side of card)
            const imgWidth = 35;
            const imgHeight = cardHeight - 6;
            const imageBase64 = restaurantImagesMap.get(restaurant.id);
            
            if (imageBase64) {
              try {
                doc.addImage(imageBase64, 'JPEG', xPos + 3, yPosition + 3, imgWidth, imgHeight);
              } catch {
                // Fallback if image fails
                doc.setFillColor(accentLight.r, accentLight.g, accentLight.b);
                doc.roundedRect(xPos + 3, yPosition + 3, imgWidth, imgHeight, 2, 2, 'F');
              }
            } else {
              doc.setFillColor(accentLight.r, accentLight.g, accentLight.b);
              doc.roundedRect(xPos + 3, yPosition + 3, imgWidth, imgHeight, 2, 2, 'F');
              doc.setTextColor(accent.r, accent.g, accent.b);
              doc.setFontSize(8);
              doc.setFont('helvetica', 'normal');
              doc.text('No Image', xPos + 10, yPosition + imgHeight / 2 + 3);
            }
            
            // Restaurant name
            const textXPos = xPos + imgWidth + 8;
            const textWidth = cardWidth - imgWidth - 12;
            
            doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            const nameLines = doc.splitTextToSize(restaurant.name, textWidth);
            doc.text(nameLines.slice(0, 2), textXPos, yPosition + 10);
            
            // Rating
            if (restaurant.rating) {
              const ratingY = yPosition + (nameLines.length > 1 ? 22 : 18);
              doc.setFillColor(gold.r, gold.g, gold.b);
              doc.circle(textXPos + 3, ratingY - 1, 3, 'F');
              doc.setTextColor(255, 255, 255);
              doc.setFontSize(6);
              doc.setFont('helvetica', 'bold');
              doc.text('★', textXPos + 1.5, ratingY + 1);
              
              doc.setTextColor(goldDark.r, goldDark.g, goldDark.b);
              doc.setFontSize(8);
              doc.text(`${restaurant.rating}`, textXPos + 9, ratingY);
            }
            
            // Cuisines
            if (restaurant.cuisines && restaurant.cuisines.length > 0) {
              const cuisineY = restaurant.rating ? yPosition + 30 : yPosition + 22;
              doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
              doc.setFontSize(7);
              doc.setFont('helvetica', 'italic');
              const cuisineText = restaurant.cuisines.slice(0, 3).join(', ');
              const cuisineLines = doc.splitTextToSize(cuisineText, textWidth);
              doc.text(cuisineLines.slice(0, 1), textXPos, cuisineY);
            }
          }
          
          yPosition += cardHeight + 8;
        }
      }
      
      // ==================== TRAVEL TIPS ====================
      checkPageBreak(60);
      yPosition += 12;
      
      doc.setFillColor(accentLight.r, accentLight.g, accentLight.b);
      doc.roundedRect(margin, yPosition, contentWidth, 14, 3, 3, 'F');
      doc.setTextColor(accentDark.r, accentDark.g, accentDark.b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Travel Tips:', margin + 5, yPosition + 10);
      
      yPosition += 18;
      
      const tips = [
        '• Book accommodations and major attractions in advance',
        '• Keep digital and physical copies of important documents',
        '• Check visa requirements and travel advisories',
        '• Consider travel insurance for peace of mind',
        '• Download offline maps and translation apps',
      ];
      
      doc.setTextColor(darkGray.r, darkGray.g, darkGray.b);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      tips.forEach((tip, i) => {
        doc.text(tip, margin + 5, yPosition + i * 7);
      });
      
      // ==================== FOOTER ON ALL PAGES ====================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Simple footer line
        doc.setDrawColor(primary.r, primary.g, primary.b);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        doc.setTextColor(mediumGray.r, mediumGray.g, mediumGray.b);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated by TourGether`, margin, pageHeight - 8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      }
      
      // Save the PDF
      const fileName = `TourGether-${tripData.destination.replace(/[^a-zA-Z0-9]/g, '-')}-Itinerary.pdf`;
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !tripData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/plan" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Edit Trip</span>
          </Link>
          
          <Link to="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">TourGether</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => toast.success('Sharing coming soon!')}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button onClick={exportToPDF} disabled={isExporting} className="gap-2">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/20 via-background to-accent/20 py-20 overflow-hidden">
        {/* Animated decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.8s' }} />
        
        {/* Geometric patterns */}
        <div className="absolute top-10 left-10 w-16 h-16 border-2 border-primary/20 rounded-2xl rotate-12 animate-spin-slow" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border-2 border-accent/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        
        <div className="container max-w-6xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-primary/30 shadow-lg animate-fade-in">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              AI-Generated Itinerary
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Your Trip to{' '}
            <span className="bg-gradient-to-r from-primary via-primary to-accent-foreground bg-clip-text text-transparent">
              {tripData.destination}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {tripData.daysCount} days of unforgettable adventure await you ✨
          </p>
        </div>
      </section>

      {/* Trip Summary */}
      <section className="py-8 border-b border-border relative">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group flex items-center gap-3 p-5 bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Dates</p>
                <p className="font-bold text-sm text-foreground">{formatDate(tripData.startDate)} - {formatDate(tripData.endDate)}</p>
              </div>
            </div>
            <div className="group flex items-center gap-3 p-5 bg-gradient-to-br from-primary/25 via-primary/15 to-primary/10 rounded-2xl border border-primary/40 shadow-lg shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 rounded-xl bg-primary/30">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-primary/80 font-medium">Duration</p>
                <p className="font-bold text-sm text-primary">{tripData.daysCount} days</p>
              </div>
            </div>
            <div className="group flex items-center gap-3 p-5 bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
              <div className="p-2.5 rounded-xl bg-accent/30 group-hover:bg-accent/40 transition-colors">
                <Wallet className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Budget</p>
                <p className="font-bold text-sm text-foreground">{tripData.currency} {tripData.budgetMin.toLocaleString()} - {tripData.budgetMax.toLocaleString()}</p>
              </div>
            </div>
            <div className="group flex items-center gap-3 p-5 bg-gradient-to-br from-card to-card/80 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Travelers</p>
                <p className="font-bold text-sm text-foreground">{tripData.travelers} {tripData.travelers === 1 ? 'person' : 'people'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAG Sources Info */}
      {sources && (sources.databaseAttractions > 0 || sources.databaseRestaurants > 0 || sources.webSources > 0) && (
        <section className="py-6 border-b border-border bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="text-muted-foreground font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Powered by:
              </span>
              {sources.databaseAttractions > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-2 rounded-full border border-primary/30 shadow-sm">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-primary font-bold">{sources.databaseAttractions} Attractions</span>
                </div>
              )}
              {sources.databaseRestaurants > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-accent/30 to-accent/10 px-4 py-2 rounded-full border border-accent/30 shadow-sm">
                  <MapPin className="w-4 h-4 text-accent-foreground" />
                  <span className="text-accent-foreground font-bold">{sources.databaseRestaurants} Restaurants</span>
                </div>
              )}
              {sources.webSources > 0 && (
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full border border-border shadow-sm">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-bold">{sources.webSources} Web Sources</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Attractions Gallery */}
      {attractions.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-20 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 px-5 py-2.5 rounded-full mb-6 border border-primary/30 shadow-md">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary">Featured Attractions</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Amazing{' '}
                <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                  Places You'll Visit
                </span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Handpicked attractions based on your preferences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {attractions.slice(0, 6).map((attraction, index) => (
                <Card 
                  key={attraction.id} 
                  className="overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-0 bg-card hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {attraction.picture ? (
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={attraction.picture} 
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {attraction.rating && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold">{attraction.rating}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <MapPin className="w-14 h-14 text-muted-foreground/30" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {attraction.name}
                    </h3>
                    {attraction.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{attraction.description}</p>
                    )}
                    {attraction.categories && attraction.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(attraction.categories) 
                          ? attraction.categories 
                          : JSON.parse(String(attraction.categories).replace(/'/g, '"'))
                        ).slice(0, 3).map((cat: string, i: number) => (
                          <span key={i} className="text-xs bg-gradient-to-r from-primary/15 to-primary/10 text-primary px-3 py-1 rounded-full font-medium border border-primary/20">
                            {String(cat).replace(/[\[\]'"]/g, '').trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Restaurants */}
      {restaurants.length > 0 && (
        <section className="py-16 border-t border-border relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute bottom-20 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/30 to-accent/10 px-5 py-2.5 rounded-full mb-6 border border-accent/30 shadow-md">
                <span className="text-xl">🍽️</span>
                <span className="text-sm font-bold text-accent-foreground">Dining Recommendations</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Delicious{' '}
                <span className="bg-gradient-to-r from-accent-foreground to-primary bg-clip-text text-transparent">
                  Places to Eat
                </span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Curated dining experiences for every taste
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.slice(0, 6).map((restaurant) => (
                <Card key={restaurant.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-border">
                  {restaurant.picture ? (
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={restaurant.picture} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      {restaurant.rating && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold">{restaurant.rating}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <span className="text-4xl">🍽️</span>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{restaurant.name}</h3>
                    {restaurant.cuisines && restaurant.cuisines.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {restaurant.cuisines.slice(0, 3).map((cuisine, i) => (
                          <span key={i} className="text-xs bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full">
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Itinerary Content with Map */}
      <section className="py-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-0 w-80 h-80 bg-gradient-to-tr from-accent-foreground/10 to-transparent rounded-full blur-3xl" />
        
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-primary/30 shadow-lg">
              <Compass className="w-5 h-5 text-primary animate-spin-slow" />
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Your Day-by-Day Adventure
              </span>
              <Plane className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Complete{' '}
              <span className="bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
                Travel Itinerary
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every moment of your {tripData.daysCount}-day journey, carefully crafted with AI precision
            </p>
            
            {/* Map toggle button */}
            <Button
              variant={showMap ? "default" : "outline"}
              onClick={() => setShowMap(!showMap)}
              className="mt-6 gap-2"
            >
              <Map className="w-4 h-4" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>
          
          {/* Two-column layout: Itinerary + Map */}
          <div className={`grid gap-8 ${showMap ? 'lg:grid-cols-[1fr,400px]' : 'max-w-4xl mx-auto'}`}>
            {/* Day cards container */}
            <div ref={itineraryContentRef} className="space-y-8">
              <ItineraryContent 
                itinerary={itinerary} 
                attractions={attractions}
                restaurants={restaurants}
                daysCount={tripData.daysCount}
              />
            </div>
            
            {/* Sticky Map */}
            {showMap && (
              <div className="hidden lg:block">
                <div className="sticky top-24 h-[calc(100vh-8rem)]">
                  <ItineraryMap
                    attractions={attractions}
                    restaurants={restaurants}
                    daysCount={tripData.daysCount}
                    destination={tripData.destination}
                    onMarkerClick={handleMarkerClick}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Budget Breakdown */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4 border border-primary/20">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Estimated Budget</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Budget Breakdown
            </h2>
          </div>
          
          <Card className="overflow-hidden border border-border shadow-lg">
            <div className="h-1 bg-primary"></div>
            <CardContent className="p-0">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="px-6 py-4 text-left font-semibold">Category</th>
                      <th className="px-6 py-4 text-center font-semibold">Allocation</th>
                      <th className="px-6 py-4 text-right font-semibold">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎭</span>
                          <div>
                            <p className="font-medium text-foreground">Activities & Attractions</p>
                            <p className="text-xs text-muted-foreground">Entry fees, tours, experiences</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-14 h-8 bg-primary/15 text-primary font-bold rounded-full">40%</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        {tripData.currency} {Math.round((tripData.budgetMin + tripData.budgetMax) / 2 * 0.4).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🍽️</span>
                          <div>
                            <p className="font-medium text-foreground">Dining & Food</p>
                            <p className="text-xs text-muted-foreground">Meals, snacks, beverages</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-14 h-8 bg-primary/15 text-primary font-bold rounded-full">35%</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        {tripData.currency} {Math.round((tripData.budgetMin + tripData.budgetMax) / 2 * 0.35).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🚗</span>
                          <div>
                            <p className="font-medium text-foreground">Transport & Misc</p>
                            <p className="text-xs text-muted-foreground">Local transport, tips, souvenirs</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-14 h-8 bg-primary/15 text-primary font-bold rounded-full">25%</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        {tripData.currency} {Math.round((tripData.budgetMin + tripData.budgetMax) / 2 * 0.25).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-primary/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💰</span>
                          <div>
                            <p className="font-bold text-foreground">Total Budget Range</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              For {tripData.travelers} {tripData.travelers === 1 ? 'traveler' : 'travelers'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-primary text-primary-foreground font-bold rounded-full">100%</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xl font-bold text-primary">
                          {tripData.currency} {tripData.budgetMin.toLocaleString()} - {tripData.budgetMax.toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-4">Want to make changes?</h3>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/plan')}>
              Edit Trip Details
            </Button>
            <Button onClick={() => {
              sessionStorage.removeItem('tripData');
              sessionStorage.removeItem('generatedItinerary');
              navigate('/plan');
            }}>
              Plan New Trip
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 TourGether • Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Itinerary;
