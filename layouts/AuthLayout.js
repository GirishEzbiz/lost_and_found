// import node module libraries
import { Container } from "react-bootstrap";

const AuthLayout = (props) => {
  return (
    <Container className="d-flex flex-column " style={{ maxWidth: "100%", paddingRight: "0px", paddingLeft: "0px" }}>
      {props.children}
    </Container>
  );
};
export default AuthLayout;
