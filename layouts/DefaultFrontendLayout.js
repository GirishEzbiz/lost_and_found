// import node module libraries
import Footer from "pages/components/Footer";
import TopNav from "pages/components/TopNav";
import { useState } from "react";

import { Row, Col } from "react-bootstrap";

const DefaultFrontendLayout = (props) => {
  const [showMenu, setShowMenu] = useState(true);
  const ToggleMenu = () => {
    return setShowMenu(!showMenu);
  };
  return <div>{props.children}</div>;
};
export default DefaultFrontendLayout;
