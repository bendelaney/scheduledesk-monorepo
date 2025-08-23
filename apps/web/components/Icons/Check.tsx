import React from "react";
const SvgCheck = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={9} height={9} {...props}>
    <path
      fill="#333"
      fillRule="nonzero"
      d="M3.601 9c.425 0 .754-.16.981-.514l4.196-6.63A1.4 1.4 0 0 0 9 1.127C9 .483 8.526 0 7.903 0c-.42 0-.691.16-.952.586l-3.37 5.6L1.915 4.14a1 1 0 0 0-.826-.39C.464 3.75 0 4.232 0 4.88c0 .294.077.53.314.813l2.35 2.87c.25.303.55.437.937.437"
    />
  </svg>
);
export default SvgCheck;