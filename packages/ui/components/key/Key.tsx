import type { ComponentPropsWithRef, MouseEvent } from "react";
import "./key.css";

export const keyVariants = ["primary", "quiet", "on-mask"] as const;
export type KeyVariant = (typeof keyVariants)[number];

export const keySizes = ["md", "sm"] as const;
export type KeySize = (typeof keySizes)[number];

export type KeyProps = ComponentPropsWithRef<"button"> & {
  variant?: KeyVariant;
  size?: KeySize;
  loading?: boolean;
  loadingLabel?: string;
};

export function Key({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Loading",
  type = "button",
  className,
  children,
  onClick,
  "aria-disabled": ariaDisabled,
  ...props
}: KeyProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <>
      <button
        {...props}
        type={type}
        className={className ? `key ${className}` : "key"}
        data-variant={variant}
        data-size={size}
        aria-busy={loading || undefined}
        aria-disabled={loading ? true : ariaDisabled}
        onClick={handleClick}
      >
        <span className="key__face">
          {variant !== "quiet" && <span className="key__pad" aria-hidden />}
          <span className="key__label">{children}</span>
          {loading && (
            <span className="key__progress" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          )}
        </span>
      </button>
      <span className="key__status" role="status">
        {loading ? loadingLabel : null}
      </span>
    </>
  );
}
