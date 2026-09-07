import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import './NumberInput.css';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  className?: string;
  disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  onBlur: onBlurCallback,
  min,
  max,
  step = 1,
  label,
  suffix,
  className = '',
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(String(value));
    }
  }, [value, isFocused]);

  const clampValue = (val: number): number => {
    let result = val;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) {
      onChange(clampValue(parsed));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(String(value));
      onBlurCallback?.(value);
    } else {
      const clamped = clampValue(parsed);
      setInputValue(String(clamped));
      onChange(clamped);
      onBlurCallback?.(clamped);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const increment = () => {
    const newValue = clampValue(value + step);
    onChange(newValue);
    setInputValue(String(newValue));
  };

  const decrement = () => {
    const newValue = clampValue(value - step);
    onChange(newValue);
    setInputValue(String(newValue));
  };

  const startHold = (action: () => void) => {
    action();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 50);
    }, 400);
  };

  const stopHold = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    }
  };

  return (
    <div className={`number-input-container ${className}`}>
      {label && <label className="number-input-label">{label}</label>}
      <div className={`number-input-wrapper ${disabled ? 'disabled' : ''}`}>
        <input
          type="text"
          className="number-input-field"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        {suffix && <span className="number-input-suffix">{suffix}</span>}
        <div className="number-input-buttons">
          <button
            type="button"
            className="number-input-btn increment"
            onMouseDown={() => startHold(increment)}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            disabled={disabled || (max !== undefined && value >= max)}
            tabIndex={-1}
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            className="number-input-btn decrement"
            onMouseDown={() => startHold(decrement)}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            disabled={disabled || (min !== undefined && value <= min)}
            tabIndex={-1}
          >
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberInput;
