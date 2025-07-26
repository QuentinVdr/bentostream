import { useCallback, useMemo, useState } from 'react';

interface StreamsFormProps {
  onSubmit?: (values: string[]) => void;
}

const StreamsForm = ({ onSubmit }: StreamsFormProps) => {
  const [inputs, setInputs] = useState<Array<{ id: string; value: string }>>([{ id: crypto.randomUUID(), value: '' }]);

  const validInputs = useMemo(() => inputs.filter(input => input.value.trim() !== ''), [inputs]);

  const handleRemoveInput = useCallback((index: number) => {
    setInputs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setInputs([{ id: crypto.randomUUID(), value: '' }]);
  }, []);

  const handleInputChange = useCallback((index: number, value: string) => {
    setInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = { ...newInputs[index], value };

      const isLastInput = index === prev.length - 1;
      const hasValue = value.trim() !== '';
      const hasReachedMax = prev.length >= 6;

      if (isLastInput && hasValue && !hasReachedMax) {
        newInputs.push({ id: crypto.randomUUID(), value: '' });
      }

      return newInputs;
    });
  }, []);

  const cleanInputs = useCallback(() => {
    setInputs(prev => {
      const filtered = prev.filter((input, index) => {
        if (input.value.trim() !== '') return true;
        return index === prev.length - 1;
      });

      return filtered.length > 0 ? filtered : [{ id: crypto.randomUUID(), value: '' }];
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validInputs.length > 0 && onSubmit) {
        onSubmit(validInputs.map(input => input.value));
      }
    },
    [onSubmit, validInputs]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        } else {
          handleSubmit(e);
        }
      }

      if (e.key === 'Backspace') {
        if (index === 0 && inputs.length === 2) {
          setInputs(prev => prev.filter((_, i) => i !== 1));
          return;
        }

        if (inputs[index].value === '' && index > 0) {
          setInputs(prev => prev.filter((_, i) => i !== index));
          setTimeout(() => {
            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
            if (prevInput) {
              prevInput.focus();
            }
          }, 0);
        }
      }
    },
    [inputs, handleSubmit]
  );

  return (
    <div className="mx-auto w-full max-w-2xl rounded-lg bg-zinc-900 p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-white">Add Streams</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {inputs.map((input, index) => (
          <div key={input.id} className="relative">
            <input
              type="text"
              value={input.value}
              onChange={e => handleInputChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(e, index)}
              onBlur={cleanInputs}
              data-index={index}
              placeholder={`${'Enter stream URL...'} ${index + 1}`}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {index > 0 && input.value === '' && (
              <button
                type="button"
                onClick={() => handleRemoveInput(index)}
                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-zinc-400 transition-colors hover:text-red-400"
                aria-label="Remove input"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {validInputs.length > 0 && (
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none"
            >
              Watch Streams ({validInputs.length})
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-lg bg-zinc-700 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-zinc-600 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none"
            >
              Clear All
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default StreamsForm;
