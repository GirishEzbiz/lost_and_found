// import node module libraries
import { useEffect, useState } from "react";

// import sub components
import { Row, Col } from "react-bootstrap";
import { isAuthenticated } from "lib/isAuthenticated";
import { useRouter } from "next/router";

const CustomUserLayout = (props) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(true);
  const ToggleMenu = () => {
    return setShowMenu(!showMenu);
  };

  return (
    <div id="db-wrapper" className={`${showMenu ? "" : "toggled"}`}>
      <div id="page-content">{props.children}</div>
    </div>
  );
};
export default CustomUserLayout;
