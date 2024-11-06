import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="site-content">
      {/* <div class="loader-mask">
        <div class="loader"></div>
      </div> */}
      <TopNav />
      {children}
      <Footer />
      <Sidebar />
    </div>
  );
}
