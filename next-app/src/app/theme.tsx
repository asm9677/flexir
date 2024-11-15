/* theme.ts */
import { extendTheme } from "@chakra-ui/react";
import { GlobalStyleProps } from "@chakra-ui/theme-tools";
import { mode } from "@chakra-ui/theme-tools";

const colors = {
  
};
const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const styles = {
  
};

export const theme = extendTheme({
  styles,
  colors,
  fonts: {
    heading: "var(--font-nunito)",
    body: "'var(--font-nunito)', 'var(--font-lato)'",
  },
  config,
});
