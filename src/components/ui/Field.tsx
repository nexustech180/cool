import { type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

type FieldWrapperProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
};

export function FieldWrapper({ label, htmlFor, hint, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({ label, hint, id, className, ...props }: TextFieldProps) {
  const inputId = id ?? props.name;
  return (
    <FieldWrapper label={label} htmlFor={inputId!} hint={hint}>
      <input
        id={inputId}
        className={`rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className ?? ""}`}
        {...props}
      />
    </FieldWrapper>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function SelectField({ label, hint, id, className, children, ...props }: SelectFieldProps) {
  const selectId = id ?? props.name;
  return (
    <FieldWrapper label={label} htmlFor={selectId!} hint={hint}>
      <select
        id={selectId}
        className={`rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className ?? ""}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
