import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CourseIndex = () => {
  const { t } = useTranslation();

  return (
    <div className="course-area min-h-screen bg-course-background text-course-foreground flex flex-col items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-course-primary/10 text-course-primary mb-4">
          <GraduationCap size={32} />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-course-foreground">
          {t('course.courseArea')}
        </h1>
        <p className="font-body text-lg text-course-muted-foreground">
          {t('course.description')}
        </p>
        <div className="inline-block px-4 py-2 rounded-full bg-course-card border border-course-border text-course-muted-foreground text-sm">
          {t('course.comingSoon')}
        </div>
        <div className="pt-6">
          <Link to="/">
            <Button variant="outline" className="border-course-border text-course-foreground hover:bg-course-accent hover:text-course-accent-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('course.backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseIndex;
