import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = true }: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4 } : {}}
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
