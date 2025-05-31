import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/coachings/')({
  component: Coachings,
});

function Coachings() {
  return (
    <div>
      <p>Coachings</p>
    </div>
  );
}