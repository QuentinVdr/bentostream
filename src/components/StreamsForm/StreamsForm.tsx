import { useCallback, useEffect, useMemo, useState } from 'react';

interface StreamInput {
  id: string;
  value: string;
}

interface StreamsFormProps {
  onSubmit?: (values: string[]) => void;
  onCancel?: () => void;
  initialStreams?: string[];
  submitButtonText?: string;
  title?: string;
  className?: string;
  inputDataAttribute?: string;
}

const StreamsForm = ({
  onSubmit,
  onCancel,
  initialStreams = [],
  submitButtonText = 'Watch Streams',
  title = 'Add Streams',
  className = '',
  inputDataAttribute = 'index',
}: StreamsFormProps) => {
  const [inputs, setInputs] = useState<StreamInput[]>([{ id: crypto.randomUUID(), value: '' }]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialStreams.length > 0) {
      const newInputs: StreamInput[] = initialStreams.map(stream => ({
        id: crypto.randomUUID(),
        value: stream,
      }));
      if (newInputs.length < 6) {
        newInputs.push({ id: crypto.randomUUID(), value: '' });
      }
      setInputs(newInputs);
    }
  }, [initialStreams]);

  const validInputs = useMemo(
    () => inputs.filter(input => input.value.trim() !== '').map(input => input.value),
    [inputs]
  );

  // Helper function to clear all drag states
  const clearDragStates = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleClearInput = useCallback((index: number) => {
    setInputs(prev => {
      const newInputs = prev.filter((_, i) => i !== index);

      // Ensure we always have at least one input field
      if (newInputs.length === 0) {
        return [{ id: crypto.randomUUID(), value: '' }];
      }

      // Add empty field if all remaining are filled and under max capacity
      const allFilled = newInputs.every(input => input.value.trim() !== '');
      if (allFilled && newInputs.length < 6) {
        newInputs.push({ id: crypto.randomUUID(), value: '' });
      }

      return newInputs;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setInputs([{ id: crypto.randomUUID(), value: '' }]);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      if (draggedIndex === null || draggedIndex === dropIndex) {
        clearDragStates();
        return;
      }

      setInputs(prev => {
        const newInputs = [...prev];
        const draggedItem = newInputs[draggedIndex];

        // Remove the dragged item
        newInputs.splice(draggedIndex, 1);

        // Insert it at the new position
        const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newInputs.splice(adjustedDropIndex, 0, draggedItem);

        return newInputs;
      });

      clearDragStates();
    },
    [draggedIndex, clearDragStates]
  );

  const handleDragEnd = useCallback(() => {
    clearDragStates();
  }, [clearDragStates]);

  const handleInputChange = useCallback((index: number, value: string) => {
    setInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = { ...newInputs[index], value };

      // Add new empty field if typing in the last field and haven't reached max
      const isLastInput = index === prev.length - 1;
      const hasValue = value.trim() !== '';
      const hasReachedMax = prev.length >= 6;

      if (isLastInput && hasValue && !hasReachedMax) {
        newInputs.push({ id: crypto.randomUUID(), value: '' });
      }

      // Clean up empty fields: keep only non-empty fields + one trailing empty field
      const nonEmptyInputs = newInputs.filter(input => input.value.trim() !== '');
      const result = [...nonEmptyInputs];

      // Always ensure there's one empty field at the end (unless at max capacity)
      if (result.length < 6) {
        result.push({ id: crypto.randomUUID(), value: '' });
      }

      return result;
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validInputs.length > 0 && onSubmit) {
        onSubmit(validInputs);
      }
    },
    [onSubmit, validInputs]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const nextInput = document.querySelector(
          `input[data-${inputDataAttribute}="${index + 1}"]`
        ) as HTMLInputElement;
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
            const prevInput = document.querySelector(
              `input[data-${inputDataAttribute}="${index - 1}"]`
            ) as HTMLInputElement;
            if (prevInput) {
              prevInput.focus();
            }
          }, 0);
        }
      }
    },
    [inputs, handleSubmit, inputDataAttribute]
  );

  const formClassName = className || 'mx-auto w-full max-w-2xl rounded-lg bg-zinc-900 p-6 shadow-lg';

  return (
    <div className={formClassName}>
      {title && <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {inputs.map((input, index) => (
          <div key={input.id} className="relative">
            {/* Hidden description for accessibility */}
            {input.value.trim() !== '' && (
              <span id={`stream-${input.id}-desc`} className="sr-only">
                Drag the handle icon to reorder this stream input, or use Alt+Arrow keys for keyboard navigation
              </span>
            )}

            {/* Drop zone indicator above */}
            {draggedIndex !== null && draggedIndex !== index && dragOverIndex === index && (
              <div className="absolute -top-1 right-0 left-0 z-10 h-0.5 rounded-full bg-violet-500" />
            )}

            <div
              className={`relative transition-all duration-200 ${draggedIndex === index ? 'scale-95 opacity-50' : ''} ${
                draggedIndex !== null && dragOverIndex === index && draggedIndex !== index
                  ? 'translate-y-1 border-violet-500/30 bg-violet-500/5'
                  : ''
              }`}
              onDragOver={e => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, index)}
            >
              <div className="flex items-center">
                {input.value.trim() !== '' && (
                  <div
                    draggable={true}
                    onDragStart={e => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    className="mr-2 cursor-move rounded p-1 text-zinc-400 hover:text-zinc-300"
                    role="button"
                    tabIndex={0}
                    aria-label={`Drag to reorder stream ${index + 1}. Use Alt+Arrow keys for keyboard navigation`}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      // Allow keyboard navigation for reordering
                      if (e.key === 'ArrowUp' && e.altKey && index > 0) {
                        e.preventDefault();
                        // Move item up
                        setInputs(prev => {
                          const newInputs = [...prev];
                          [newInputs[index - 1], newInputs[index]] = [newInputs[index], newInputs[index - 1]];
                          return newInputs;
                        });
                      } else if (e.key === 'ArrowDown' && e.altKey && index < inputs.length - 1) {
                        e.preventDefault();
                        // Move item down
                        setInputs(prev => {
                          const newInputs = [...prev];
                          [newInputs[index], newInputs[index + 1]] = [newInputs[index + 1], newInputs[index]];
                          return newInputs;
                        });
                      } else if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // Could add alternative drag behavior here
                      }
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="drag-handle">
                      <circle cx="4" cy="4" r="1" />
                      <circle cx="4" cy="8" r="1" />
                      <circle cx="4" cy="12" r="1" />
                      <circle cx="8" cy="4" r="1" />
                      <circle cx="8" cy="8" r="1" />
                      <circle cx="8" cy="12" r="1" />
                      <circle cx="12" cy="4" r="1" />
                      <circle cx="12" cy="8" r="1" />
                      <circle cx="12" cy="12" r="1" />
                    </svg>
                  </div>
                )}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input.value}
                    onChange={e => handleInputChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    {...{ [`data-${inputDataAttribute}`]: index }}
                    placeholder={`Enter stream name... ${index + 1}`}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                  {input.value.trim() !== '' && (
                    <button
                      type="button"
                      onClick={() => handleClearInput(index)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 transform text-zinc-400 transition-colors hover:text-red-400"
                      aria-label="Clear input"
                      title="Clear this input"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {validInputs.length > 0 && (
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-violet-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none"
            >
              {submitButtonText} ({validInputs.length})
            </button>
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg bg-zinc-700 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-zinc-600 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-lg bg-zinc-700 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-zinc-600 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default StreamsForm;
