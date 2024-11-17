/* theme.ts */
import { extendTheme } from "@chakra-ui/react";
import { GlobalStyleProps } from "@chakra-ui/theme-tools";

const colors = {
  primary: "#007bff",
  dark: "#0d1117",
  gray: {
    100: "#E0E0E0",
    300: "#A0A0A0",
    500: "#797979",
    700: "#3B3D59",
    800: "#212120",
    900: "#0d1117",
  },
  blue: {
    300: "#2d9fb9",
    700: "#234753",
  },
  cyan: {
    300: "#02ebff",
  },
  teal: {
    200: "#2cb997",
    700: "#2c6356",
    800: "#1d322d",
  },

  red: {
    400: "#CC3B3B",
  },
  // gold: "#FEC824",
  gold: "#E1B52E",
  green: {
    100: "#c7f284",
    200: "#94e449",
    300: "#89CF96",
    500: "#4AB75C",
    600: "#41A052",
    700: "#508365",
  },
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

import { mode } from "@chakra-ui/theme-tools";

const styles = {
  global: (props: GlobalStyleProps) => ({
    body: {
      bg: mode("dark", "#0d1117")(props),
    },
  }),
};

export const theme = extendTheme({
  colors,
  styles,
  fonts: {
    heading: "var(--font-nunito), sans-serif",
    body: "var(--font-nunito), var(--font-lato), sans-serif",
  },
  config: {
    initialColorMode: "dark", // Optional: Set the default color mode
    useSystemColorMode: false,
  },
});
