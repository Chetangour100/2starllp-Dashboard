import { ThemeProvider as NextThemeProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function AdminThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      {...props}
      >
      {children}
    </NextThemeProvider>
  );
}
