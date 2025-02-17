"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Operation = '+' | '-' | '*' | '/' | null;

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [storedNumber, setStoredNumber] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = useCallback((num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(prev => prev === '0' ? num : prev + num);
    }
  }, [newNumber]);

  const handleDecimal = useCallback(() => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  }, [display, newNumber]);

  const handleOperation = useCallback((op: Operation) => {
    const currentNumber = parseFloat(display);
    
    if (storedNumber === null) {
      setStoredNumber(currentNumber);
    } else if (operation) {
      const result = calculate(storedNumber, currentNumber, operation);
      setStoredNumber(result);
      setDisplay(result.toString());
    }
    
    setOperation(op);
    setNewNumber(true);
  }, [display, storedNumber, operation]);

  const calculate = (a: number, b: number, op: Operation): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = useCallback(() => {
    if (storedNumber === null || operation === null) return;
    
    const currentNumber = parseFloat(display);
    const result = calculate(storedNumber, currentNumber, operation);
    
    setDisplay(result.toString());
    setStoredNumber(null);
    setOperation(null);
    setNewNumber(true);
  }, [display, storedNumber, operation]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setStoredNumber(null);
    setOperation(null);
    setNewNumber(true);
  }, []);

  const handleBackspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  }, [display]);

  const handlePlusMinus = useCallback(() => {
    setDisplay(prev => (parseFloat(prev) * -1).toString());
  }, []);

  const buttonClass = "h-12 text-lg font-medium transition-all hover:opacity-80 active:scale-95";

  return (
    <div className="p-4 flex flex-col gap-2 h-full select-none">
      <div className="bg-muted rounded-lg p-4 mb-2">
        <div className="text-right text-3xl font-medium truncate">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          className={cn(buttonClass, "col-span-2")}
          onClick={handleClear}
        >
          C
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={handleBackspace}
        >
          ←
        </Button>
        <Button
          variant="secondary"
          className={cn(buttonClass, operation === '/' && "bg-accent")}
          onClick={() => handleOperation('/')}
        >
          ÷
        </Button>

        {[7, 8, 9].map(num => (
          <Button
            key={num}
            variant="outline"
            className={buttonClass}
            onClick={() => handleNumber(num.toString())}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="secondary"
          className={cn(buttonClass, operation === '*' && "bg-accent")}
          onClick={() => handleOperation('*')}
        >
          ×
        </Button>

        {[4, 5, 6].map(num => (
          <Button
            key={num}
            variant="outline"
            className={buttonClass}
            onClick={() => handleNumber(num.toString())}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="secondary"
          className={cn(buttonClass, operation === '-' && "bg-accent")}
          onClick={() => handleOperation('-')}
        >
          −
        </Button>

        {[1, 2, 3].map(num => (
          <Button
            key={num}
            variant="outline"
            className={buttonClass}
            onClick={() => handleNumber(num.toString())}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="secondary"
          className={cn(buttonClass, operation === '+' && "bg-accent")}
          onClick={() => handleOperation('+')}
        >
          +
        </Button>

        <Button
          variant="outline"
          className={buttonClass}
          onClick={handlePlusMinus}
        >
          ±
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={() => handleNumber('0')}
        >
          0
        </Button>
        <Button
          variant="outline"
          className={buttonClass}
          onClick={handleDecimal}
        >
          .
        </Button>
        <Button
          variant="secondary"
          className={buttonClass}
          onClick={handleEquals}
        >
          =
        </Button>
      </div>
    </div>
  );
}