import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const slides = [
  {
    title: 'Private access, made simple',
    description:
      'Connect securely with one tap. LiveMask protects your network traffic without the technical complexity.',
    image: 'https://mgx-backend-cdn.metadl.com/generate/images/319396/2026-05-14/ordkjbyaagqq/onboarding-secure-connection.png',
  },
  {
    title: 'Fast nodes across regions',
    description:
      'Choose from servers worldwide with real-time latency and load information. Smart recommendations find the best node for you.',
    image: 'https://mgx-backend-cdn.metadl.com/generate/images/319396/2026-05-14/ordkh4qaagoq/onboarding-global-nodes.png',
  },
  {
    title: 'Clear recovery when networks fail',
    description:
      'Connection issues happen. LiveMask provides clear actions: retry, switch nodes, or send a diagnostic report.',
    image: 'https://mgx-backend-cdn.metadl.com/generate/images/319396/2026-05-14/ordkjryaagnq/onboarding-recovery.png',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  function handleNext() {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      localStorage.setItem('livemask_onboarded', 'true');
      navigate('/home', { replace: true });
    }
  }

  function handleSkip() {
    localStorage.setItem('livemask_onboarded', 'true');
    navigate('/home', { replace: true });
  }

  const slide = slides[current];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up" key={current}>
          <div className="aspect-square max-w-[280px] mx-auto mb-8 rounded-2xl overflow-hidden bg-muted">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground text-center">
            {slide.title}
          </h2>
          <p className="text-muted-foreground text-center mt-3 text-sm leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      <div className="px-6 pb-10 space-y-4 max-w-sm mx-auto w-full">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === current
                  ? 'w-6 bg-[hsl(174,62%,32%)]'
                  : 'w-2 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full h-12 bg-[hsl(174,62%,32%)] hover:bg-[hsl(174,62%,28%)] text-white font-semibold"
        >
          {current < slides.length - 1 ? (
            <>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </>
          ) : (
            'Get Started'
          )}
        </Button>

        {current < slides.length - 1 && (
          <button
            onClick={handleSkip}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        )}

        <button
          onClick={() => {
            localStorage.setItem('livemask_onboarded', 'true');
            navigate('/home', { replace: true });
          }}
          className="w-full text-center text-sm text-[hsl(174,62%,32%)] hover:underline"
        >
          I already have an account
        </button>
      </div>
    </div>
  );
}