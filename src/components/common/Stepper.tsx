import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="w-full bg-white border border-[#e5e7eb] rounded-[24px] px-6 py-4 shadow-xs">
      <div className="flex items-center justify-between max-w-2xl mx-auto relative">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && step.id < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Label */}
              <div 
                className={`flex flex-col items-center relative z-10 ${isClickable ? 'cursor-pointer' : ''}`}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                <div
                  className={`w-[34px] h-[34px] rounded-full flex items-center justify-center font-semibold text-[14px] transition-all duration-300 ${
                    isCompleted || isCurrent
                      ? 'bg-[#285943] text-white shadow-xs'
                      : 'bg-white border-2 border-[#c7d8cc] text-[#6b7280]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 text-white stroke-[2.5]" /> : step.id}
                </div>
                <span
                  className={`text-[12px] sm:text-[13px] mt-2 font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#1e293b] font-semibold'
                      : isCompleted
                      ? 'text-[#285943]'
                      : 'text-[#6b7280]'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line between bubbles */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 h-[2px] bg-[#d9e1d8] rounded-full relative overflow-hidden self-center mb-6">
                  <div
                    className="h-full bg-[#285943] transition-all duration-300 rounded-full"
                    style={{
                      width: currentStep > step.id ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
