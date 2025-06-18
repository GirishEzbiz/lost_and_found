import { isAuthenticated } from "lib/isAuthenticated";
import { useRouter } from "next/router";
import { useEffect } from "react";

const AuthUserLayout = (props) => {
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const authenticated = await isAuthenticated(); // Await the result

      if (authenticated) {
        router.push("/dashboard"); // Redirect to login
      }
    };

    checkAuthentication();
  }, [router]); // Include `router` as a dependency
  return (
    <div id="db-wrapper ">
      <div id="page-content" className="bg-success">{props.children}</div>
    </div>
  );
};
export default AuthUserLayout;
