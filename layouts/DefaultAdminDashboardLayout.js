// import node module libraries
import { useEffect, useState } from "react";

// import sub components
import NavbarVertical from "./navbars/NavbarVertical";
import NavbarTop from "./navbars/NavbarTop";
import { Row, Col } from "react-bootstrap";
import NavbarHorizontal from "./navbars/NavbarHorizontal";
import { isAuthenticatedAdmin } from "lib/isAuthenticatedAdmin";
import { useRouter } from "next/router";

const DefaultAdminDashboardLayout = (props) => {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(true);

  const ToggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // useEffect(() => {
  //   // If the user is not authenticated, redirect to login page
  //   if (!isAuthenticatedAdmin()) {
  //     router.push("/admin/login");
  //   }
  // }, []);
  return (
    <>
      {/* Wrapper for large screens */}
      <div id="db-wrapper" className={`d-none d-md-block ${"toggled"}`}>
        {/* <div className="navbar-vertical navbar">
          <NavbarVertical
            showMenu={showMenu}
            onClick={(value) => setShowMenu(value)}
          />
        </div> */}
        <div id="page-content">
          <div className="header">
            <NavbarHorizontal />
          </div>
          {props.children}
          {/* <div className="container-fluid">
          <div className="px-6 border-top py-3">
            <Row>
              <Col sm={6} className="text-center text-sm-start mb-2 mb-sm-0">
                <p className="m-0">
                  Copyright @ 2024{" "}
                  <a href="https://lostandsound.com/" target="_blank">
                    Lost & Found
                  </a>
                </p>
              </Col>
            </Row>
          </div>
          </div> */}
        </div>
      </div>

      {/* Wrapper for small and medium screens */}
      <div id="db-wrapper" className={`d-md-none ${showMenu ? "" : "toggled"}`}>
        <div className="navbar-vertical navbar">
          <NavbarVertical
            showMenu={showMenu}
            onClick={(value) => setShowMenu(value)}
          />
        </div>
        <div id="page-content">
          <div className="header">
            <NavbarTop
              data={{
                showMenu: showMenu,
                SidebarToggleMenu: ToggleMenu,
              }}
            />
          </div>
          {props.children}
          <div className="px-6 border-top py-3">
            <Row>
              <Col sm={6} className="text-center text-sm-start mb-2 mb-sm-0">
                <p className="m-0">
                  Copyright @ 2024{" "}
                  <a href="https://lostandsound.com/" target="_blank">
                    Lost & Found
                  </a>
                </p>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
};

export default DefaultAdminDashboardLayout;
