import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import StreamsForm from '../StreamsForm';

interface StreamsFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: string[]) => void;
  initialStreams?: string[];
}

const StreamsFormPopup = ({ isOpen, onClose, onSubmit, initialStreams = [] }: StreamsFormPopupProps) => {
  const navigate = useNavigate();

  const handleSubmit = (streamNames: string[]) => {
    if (onSubmit) {
      onSubmit(streamNames);
    } else {
      // Default behavior: navigate to watch page
      navigate({ to: `/watch`, search: { streams: streamNames } });
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Invisible backdrop button for click handling */}
      <button
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={handleBackdropClick}
        aria-label="Close popup"
        tabIndex={-1}
      />

      {/* Modal content */}
      <div className="relative z-10 mx-4 w-full max-w-2xl">
        {/* StreamsForm with popup-specific props */}
        <StreamsForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialStreams={initialStreams}
          submitButtonText="Update Streams"
          title="Edit Streams"
          inputDataAttribute="popup-index"
        />
      </div>
    </div>
  );
};

export default StreamsFormPopup;
