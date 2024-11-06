// pages/index.js
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import Link from "next/link";

const Homepage = () => {
  return (
    <>
      <TopNav />
      <div className="container py-5">
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card p-4 text-center">
              <h4>Manage Itemss</h4>
              <p>Control your items with ease.</p>
              <Link href="/manage-items" className="btn btn-primary">
                Go
              </Link>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card p-4 text-center">
              <h4>Scan Now</h4>
              <p>Quick scanning for processing.</p>
              <Link href="/scan-now" className="btn btn-primary">
                Go
              </Link>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card p-4 text-center">
              <h4>Notifications</h4>
              <p>Stay updated with notifications.</p>
              <Link href="/notifications" className="btn btn-primary">
                Go
              </Link>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card p-4 text-center">
              <h4>Settings</h4>
              <p>Manage app settings.</p>
              <Link href="/settings">Go</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Homepage;
