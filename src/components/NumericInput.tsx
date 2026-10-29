/**
 * @license
 * ASME B31.3 Diesel Piping - Precision Engineering Numeric Input
 * Features:
 * - Allows clearing or pressing Delete / Backspace to empty or revert to 0 without getting stuck
 * - Provides an inline "0" button to instantly revert to zero before typing a new figure
 * - Auto-selects text on focus for rapid overtyping
 * - Supports custom units, bounds, and decimals smoothly
 */

import React, { useState, useEffect, useRef } from 'react';

export interface NumericInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: string | number;
  unit?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  precision?: number;
  showZeroBtn?: boolean;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  id,
  value,
  onChange,
  min = 0,
  max,
  step = 'any',
  unit,
  label,
  className = '',
  inputClassName = '',
  precision,
  showZeroBtn = true,
  disabled = false,
  placeholder = '0',
  ariaLabel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const formatDisplay = (num: number): string => {
    if (isNaN(num) || num === null || num === undefined) return '0';
    if (precision !== undefined) {
      return Number(num.toFixed(precision)).toString();
    }
    return String(Number(num.toFixed(3)));
  };

  const [localStr, setLocalStr] = useState<string>(() => formatDisplay(value));

  // Sync external value changes when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalStr(formatDisplay(value));
    }
  }, [value, isFocused, precision]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalStr(raw);

    if (raw.trim() === '' || raw === '-') {
      onChange(0);
      return;
    }

    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      if (max !== undefined && parsed > max) {
        onChange(max);
      } else if (min !== undefined && parsed < min) {
        onChange(parsed);
      } else {
        onChange(parsed);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Auto-select entire contents on focus for quick replacement
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localStr.trim() === '' || isNaN(parseFloat(localStr))) {
      onChange(0);
      setLocalStr('0');
    } else {
      let parsed = parseFloat(localStr);
      if (min !== undefined && parsed < min) parsed = min;
      if (max !== undefined && parsed > max) parsed = max;
      onChange(parsed);
      setLocalStr(formatDisplay(parsed));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If user presses Delete or Backspace and text is entirely selected or empty
    if ((e.key === 'Delete' || e.key === 'Backspace') && inputRef.current) {
      const { selectionStart, selectionEnd, value: curVal } = inputRef.current;
      if (selectionStart === 0 && selectionEnd === curVal.length) {
        // Entire field selected and deleted
        e.preventDefault();
        setLocalStr('0');
        onChange(0);
        requestAnimationFrame(() => {
          inputRef.current?.select();
        });
        return;
      }
    }

    if (e.key === 'Escape') {
      setLocalStr(formatDisplay(value));
      inputRef.current?.blur();
    }
  };

  const handleRevertToZero = () => {
    onChange(0);
    setLocalStr('0');
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={id} className="text-slate-400 text-[11px] block mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1">
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            id={id}
            type="number"
            step={step}
            min={min}
            max={max}
            disabled={disabled}
            placeholder={placeholder}
            value={localStr}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel || label}
            className={`w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50 ${inputClassName}`}
          />
          {unit && (
            <span className="absolute right-2 text-[10px] font-mono text-slate-400 pointer-events-none select-none">
              {unit}
            </span>
          )}
        </div>

        {showZeroBtn && (
          <button
            type="button"
            onClick={handleRevertToZero}
            title="Revert to 0 before typing new figure"
            aria-label={`Revert ${label || 'input'} to zero`}
            className="px-1.5 py-1 text-[10px] font-mono font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 transition flex items-center justify-center shrink-0"
          >
            0
          </button>
        )}
      </div>
    </div>
  );
};
