import type { PhantomUiAttributes } from "@aejkatappaja/phantom-ui";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "phantom-ui": PhantomUiAttributes;
    }
  }
}

export {};

// declare module "react/jsx-runtime" {
//   export namespace JSX {
//     interface IntrinsicElements {
//       "phantom-ui": PhantomUiAttributes;
//     }
//   }
// }
