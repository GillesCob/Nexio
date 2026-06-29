import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TUTORIAL_STEPS } from "@/data/tutorialSteps";

interface ITutorialModalProps {
  open: boolean;
  onClose: () => void;
}

export function TutorialModal({ open, onClose }: ITutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (open) setCurrentStep(1);
  }, [open]);

  const step = TUTORIAL_STEPS[currentStep - 1];
  const total = TUTORIAL_STEPS.length;
  const isLast = currentStep === total;

  const renderBody = () => {
    if (step.image) {
      return (
        <>
          <p className="text-sm text-muted-foreground">{step.content[0]}</p>
          <img src={step.image} alt={step.title} className="w-full rounded-md border" />
          {step.content[1] && (
            <p className="text-sm text-muted-foreground">{step.content[1]}</p>
          )}
        </>
      );
    }
    if (step.images) {
      return (
        <>
          <p className="text-sm text-muted-foreground">{step.content[0]}</p>
          <img src={step.images[0]} alt={`${step.title} 1`} className="w-full rounded-md border" />
          {step.content[1] && (
            <p className="text-sm text-muted-foreground">{step.content[1]}</p>
          )}
          {step.images[1] && (
            <img src={step.images[1]} alt={`${step.title} 2`} className="w-full rounded-md border" />
          )}
        </>
      );
    }
    return step.content.map((paragraph, i) => (
      <p key={i} className="text-sm text-muted-foreground">{paragraph}</p>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[100dvh] flex flex-col p-0 [&>button:last-child]:hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <p className="text-xs text-muted-foreground">Étape {currentStep} / {total}</p>
          <DialogTitle>{step.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-6 py-4">{renderBody()}</div>

        <div className="flex-shrink-0 flex items-center justify-between px-6 pb-6 pt-4 border-t">
          <div>
            {currentStep > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep((s) => s - 1)}
              >
                Précédent
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!isLast && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Skip
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={onClose}>
                Terminer
              </Button>
            ) : (
              <Button size="sm" onClick={() => setCurrentStep((s) => s + 1)}>
                Suivant
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

TutorialModal.displayName = "TutorialModal";
