import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxCharacters?: number;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  helperText,
  maxCharacters,
  className = '',
  id,
  value,
  ...props
}, ref) => {
  const areaId = id || props.name;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={areaId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        {maxCharacters && (
          <span className="text-xs text-slate-400">
            {currentLength}/{maxCharacters}
          </span>
        )}
      </div>
      <textarea
        id={areaId}
        ref={ref}
        value={value}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
          error ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-400' : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

TextArea.displayName = 'TextArea';

