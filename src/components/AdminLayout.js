import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

import Sidebar from "./admin/Header";
import Header from "./admin/Sidebar";

export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/admin/login", // Redirect to login if not authenticated
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

const AdminLayout = ({ children }) => {
  const { data: session } = useSession();

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <Header signOut={signOut} session={session} />

      {/* Main Content */}
      <div className="flex-fill">
        {/* Header */}

        <Sidebar signOut={signOut} session={session} />

        {/* Main content area */}
        <div className="container-fluid p-4">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
