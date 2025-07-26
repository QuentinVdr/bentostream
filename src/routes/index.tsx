import { createFileRoute } from '@tanstack/react-router';
import StreamsForm from '../components/StreamsForm/StreamsForm';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const handleFormSubmit = (streams: string[]) => {
    console.log('Submitted streams:', streams);
  };

  return (
    <div className="flex min-h-dvh w-dvw items-center justify-center bg-zinc-950 p-4">
      <StreamsForm onSubmit={handleFormSubmit} />
    </div>
  );
}

export default Index;
