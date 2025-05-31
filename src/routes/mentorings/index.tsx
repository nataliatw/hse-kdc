import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/mentorings/')({
  component: Mentorings,
});

function Mentorings() {
  return (
    <div>
      <p>Mentorings</p>
    </div>
  );
}