import StreamsForm from '../components/StreamsForm/StreamsForm';

function Home() {
  const handleFormSubmit = (streams: string[]) => {
    console.log('Submitted streams:', streams);
    // Here you can handle the form submission:
    // - Save to state
    // - Send to API
    // - Store in localStorage
    // etc.
  };

  return (
    <div className="flex min-h-dvh w-dvw items-center justify-center bg-zinc-950 p-4">
      <StreamsForm onSubmit={handleFormSubmit} />
    </div>
  );
}

export default Home;
