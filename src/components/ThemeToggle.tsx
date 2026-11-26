import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Включить светлую тему «Светлая студия»' : 'Включить тёмную тему «Вечерняя сцена»'}
      title={isDark ? 'Светлая студия' : 'Вечерняя сцена'}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B45309]/40 hover:text-[#B45309] dark:border-white/10 dark:bg-[#16151C] dark:text-[#F5F3EF] dark:hover:border-[#E2A856]/50 dark:hover:text-[#E2A856] dark:gold-glow-hover cursor-pointer"
    >
      <span className="sr-only">{isDark ? 'Светлая студия' : 'Вечерняя сцена'}</span>
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}
