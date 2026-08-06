import { ReactNode, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  title: string;
  children: ReactNode;
};

export const CourseRow = ({ title, children }: Props) => {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4 px-6">
        <h2 className="font-display text-2xl font-semibold text-course-foreground">{title}</h2>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="scroll left"
            onClick={() => scrollBy(-1)}
            className="rounded-full border border-course-border bg-course-card p-2 text-course-muted-foreground transition-colors hover:text-course-foreground"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="scroll right"
            onClick={() => scrollBy(1)}
            className="rounded-full border border-course-border bg-course-card p-2 text-course-muted-foreground transition-colors hover:text-course-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto px-6 pb-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
};
