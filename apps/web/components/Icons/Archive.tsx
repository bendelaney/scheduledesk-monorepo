import * as React from "react";
const SvgArchive = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width={13} height={12} {...props}>
    <path
      d="M1.198 3.086h10.61c.793 0 1.192-.452 1.192-1.236v-.614C13 .452 12.6 0 11.808 0H1.198C.433 0 0 .452 0 1.236v.614c0 .784.406 1.236 1.198 1.236M2.986 12h7.028c1.34 0 2.079-.723 2.079-2.06V4.045H.907V9.94c0 1.337.738 2.06 2.079 2.06m1.47-5.47c-.319 0-.542-.23-.542-.554v-.202c0-.331.223-.554.541-.554h4.097c.318 0 .541.223.541.554v.202c0 .325-.223.554-.541.554z"
    />
  </svg>
);
export default SvgArchive;