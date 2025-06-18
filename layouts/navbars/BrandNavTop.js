// import node module libraries
import { FiMenu } from "react-icons/fi";
import Link from "next/link";
import { Nav, Navbar, Form } from "react-bootstrap";

// import sub components
import QuickMenu from "layouts/QuickMenu";

const BrandNavTop = (props) => {
  return (
    <Navbar expanded="lg" className="navbar-classic navbar navbar-expand-lg">
      <div className="d-flex justify-content-between w-100">
        <div className="d-flex align-items-center">
          <Link
            href="#"
            id="nav-toggle"
            className="nav-icon me-2 icon-xs"
            onClick={() => props.data.SidebarToggleMenu(!props.data.showMenu)}
          >
            <FiMenu size="18px" />
          </Link>
        </div>
        {/* Quick Menu */}
        <Nav className="navbar-right-wrap ms-2 d-flex nav-top-wrap">
          <QuickMenu type="brand" />
        </Nav>
      </div>
    </Navbar>
  );
};

export default BrandNavTop;
