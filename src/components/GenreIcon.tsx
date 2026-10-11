import React from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Flame,
  Hourglass,
  Shield,
  BookOpen,
  Heart,
  Key,
  TrendingUp,
  Brain,
  Sparkles,
  Sun,
  Compass,
  Palette,
  Crown,
  Feather,
  Scroll,
  Moon,
  Infinity as InfinityIcon,
  Minimize2,
} from 'lucide-react';

interface GenreIconProps extends LucideProps {
  name: string;
}

export const GenreIcon: React.FC<GenreIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Flame':
      return <Flame {...props} />;
    case 'Hourglass':
      return <Hourglass {...props} />;
    case 'Shield':
      return <Shield {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Heart':
      return <Heart {...props} />;
    case 'Key':
      return <Key {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'Brain':
      return <Brain {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Sun':
      return <Sun {...props} />;
    case 'Compass':
      return <Compass {...props} />;
    case 'Palette':
      return <Palette {...props} />;
    case 'Crown':
      return <Crown {...props} />;
    case 'Feather':
      return <Feather {...props} />;
    case 'Scroll':
      return <Scroll {...props} />;
    case 'Moon':
      return <Moon {...props} />;
    case 'Infinity':
      return <InfinityIcon {...props} />;
    case 'Minimize2':
      return <Minimize2 {...props} />;
    default:
      return <BookOpen {...props} />;
  }
};
