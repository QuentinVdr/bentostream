import StreamsForm from '@/components/StreamsForm/StreamsForm';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  const handleFormSubmit = (streams: string[]) => {
    navigate({ to: `/watch`, search: { streams: streams } });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <StreamsForm onSubmit={handleFormSubmit} />
    </div>
  );
}
