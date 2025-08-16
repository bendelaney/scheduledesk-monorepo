import * as React from "react";
const SvgPlusCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={17} height={17} {...props}>
    <path
      fill="#5E5C5C"
      fillRule="nonzero"
      d="M8.5 17c4.67 0 8.5-3.838 8.5-8.5C17 3.83 13.17 0 8.5 0S0 3.83 0 8.5C0 13.162 3.83 17 8.5 17M4.595 8.492c0-.581.42-1.019.993-1.019h1.894V5.58c0-.573.437-1.002 1.018-1.002.58 0 1.018.43 1.018 1.002v1.893h1.902c.564 0 .993.438.993 1.019 0 .58-.429 1.018-.993 1.018H9.518v1.893c0 .573-.437.994-1.018.994-.58 0-1.018-.421-1.018-.994V9.51H5.588c-.572 0-.993-.438-.993-1.018"
    />
  </svg>
);
export default SvgPlusCircle;