import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Heart, PenLine, Home } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Biblioteca', icon: Home },
  { path: '/favorites', label: 'Favoritos', icon: Heart },
  { path: '/diary', label: 'Diário', icon: PenLine },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-ultra-thin border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={active ? 'text-primary' : 'text-muted-foreground'}
                strokeWidth={active ? 2 : 1.5}
              />
              <span className={`text-[10px] font-body ${active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
