import { motion } from 'framer-motion';
import { Course } from '../../types';
import { CourseCard } from './CourseCard';

interface CourseListProps {
  courses: Course[];
  title?: string;
}

export function CourseList({ courses, title }: CourseListProps) {
  return (
    <div>
      {title && (
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} index={index} />
        ))}
      </div>
    </div>
  );
}
