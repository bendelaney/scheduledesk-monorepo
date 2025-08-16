import * as React from "react";
const SvgEllipsis = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width={13} height={3} {...props}>
    <g>
        <circle cx="1.5" cy="1.5" r="1.5"></circle>
        <circle cx="6.5" cy="1.5" r="1.5"></circle>
        <circle cx="11.5" cy="1.5" r="1.5"></circle>
    </g>
  </svg>
);
export default SvgEllipsis;