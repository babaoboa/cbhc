import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import "./field.css";


export type FieldProps = Omit<ComponentPropsWithRef<"input">, "children"> & {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  errorPrefix?: string;
};

export function Field({
  label,
  help,
  error,
  errorPrefix = "Error:",
  id,
  type = "text",
  className,
  readOnly,
  tabIndex,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: FieldProps) {
  const autoId = useId();
  const inputId = id ?? `field-${autoId}`;
  const noteId = `${inputId}-note`;
  const invalid = Boolean(error);
  const note = invalid || Boolean(help);
  const describedBy =
    [note && noteId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className ? `field ${className}` : "field"}>
      <label className="field__label" htmlFor={inputId}>
        <span className="field__point" aria-hidden />
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        type={type}
        className="field__input"
        readOnly={readOnly}
        tabIndex={readOnly ? (tabIndex ?? -1) : tabIndex}
        aria-invalid={invalid || ariaInvalid}
        aria-describedby={describedBy}
      />
      {invalid ? (
        <p className="field__note field__error" id={noteId}>
          <span>{errorPrefix}</span>
          <span>{error}</span>
        </p>
      ) : help ? (
        <p className="field__note" id={noteId}>
          {help}
        </p>
      ) : null}
    </div>
  );
}
