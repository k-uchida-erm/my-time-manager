import React from 'react';
import { Input } from '../atoms/form';
import { Button } from '../atoms/ui';

interface TimerFormProps {
  isRunning: boolean;
  time: number;
  onSubmit: (formData: FormData) => void;
}

export function TimerForm({ isRunning, time, onSubmit }: TimerFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (time === 0) return;

    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Input 
          type="text" 
          name="note" 
          label="メモ"
          placeholder="メモを入力" 
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isRunning || time === 0}
        className="w-full"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        }
      >
        記録する
      </Button>
    </form>
  );
} 