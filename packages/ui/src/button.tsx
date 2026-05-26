import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500",
    secondary: "border border-brand-500 text-brand-600 hover:bg-brand-50 focus:ring-brand-500",
    ghost: "text-brand-600 hover:bg-brand-50 focus:ring-brand-500",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
