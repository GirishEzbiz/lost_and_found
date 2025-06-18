import Link from "next/link";
import Image from "next/image";
import Support from "pages/support";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SubscriptionAlerts from "./subscriptionAlert";
import Sliderdata from "./sliderdata";
import Cookies from "js-cookie";
import useTranslate from "utils/useTranslate";
import { FaPhoneAlt } from 'react-icons/fa'; // If using FontAwesome icons
import {
  FaIdCard,
  FaBoxOpen,
  FaBell,
  FaUserAlt,
  FaExchangeAlt,
} from "react-icons/fa";
import { IconContext } from "react-icons";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY; // ✅ Load API Key from .env

const Dashboard = () => {
  const translatedText = useTranslate({
    welcome: "Welcome",
    welcomeContent: "Here's a summary of your dashboard activities.",
    dashboard: "Dashboards",
    scanNew: "Scan new",
    scanContent: "Scan a lost/found card.",
    items: "Items",
    itemContent: "View and manage items.",
    alerts: "Alerts",
    alertContent: "Get instant alerts.",
    profile: "Profile",
    transaction: "Transaction",
    transactionContent: "Track transactions.",
    updatemobilenumber: "Update your mobile Number"
  });

  const [userData, setuserData] = useState({});

  const router = useRouter()

  const getUser = async () => {
    try {
      const response = await fetch("/api/user/userDetails");
      const data = await response.json();
      setuserData(data.user);
    } catch (error) { }
  };

  console.log(userData, "userData");


  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <div className="dashboard-scroll-wrapper">
        {/* Navbar */}
        <div className="d-flex align-items-center bg-white p-3 shadow-sm">
          <div className="w-100">
            <div className="d-flex justify-content-between align-items-center">
              <Image
                src="/assets/new_qritagya_logo.png"
                alt="Lost and Found Logo"
                 width={140} // Required width
              height={35}
                priority
              />
              {/* Notification Bell */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="me-3"
              >
                <circle
                  opacity="0.1"
                  cx="20"
                  cy="20"
                  r="19.5"
                  fill="white"
                  stroke="#FFA500"
                />
                <path
                  d="M26 16.5C26 13.7386 23.7614 11.5 21 11.5C18.2386 11.5 16 13.7386 16 16.5C16 22.3333 13.5 24 13.5 24H28.5C28.5 24 26 22.3333 26 16.5Z"
                  stroke="#19191A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22.4417 28C22.1435 28.514 21.5942 28.8304 21 28.8304C20.4058 28.8304 19.8565 28.514 19.5583 28"
                  stroke="#19191A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="27"
                  cy="13.5"
                  r="3.5"
                  fill="#FFA500"
                  stroke="#19191A"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container px-3 mb-5 pb-5">
          {/* Welcome Message */}
          <div className="row pt-4">
            <div className="col">
              <h2 className="fw-bold mt-2 " style={{ color: "#A22191" }} >
                {translatedText.welcome},{" "}
                <span className="text-dark">{userData?.full_name}</span>
              </h2>
              <p className="text-muted fs-6">{translatedText.welcomeContent}</p>

            </div>
          </div>

          {/* Alerts & Slider */}
          <SubscriptionAlerts />

          {
            !userData?.mobile && <div className="d-flex align-items-center gap-2 mb-2">
              <p className="mb-0 fw-semibold text-dark">
                {translatedText.updatemobilenumber || 'Update your mobile number'}
              </p>



              <span
                onClick={() => router.push("dashboard/update-mobile")}
                className=" text-decoration-underline fw-semibold"
                style={{ fontSize: '0.85rem', cursor: 'pointer', color: '#A22191' }}
              >
                Update
              </span>


            </div>
          }

          <Sliderdata />

          {/* Feature Cards */}
          <IconContext.Provider
            value={{ size: "1.6rem", color: "#A22191", className: "mb-1" }}
          >
            <div className="container px-1 pt-4">
              <div className="row row-cols-2 row-cols-sm-2 g-3">
                {/* Card 1 */}
                <div className="col">
                  <Link href="/dashboard/scanner">
                    <div className="card py-3 px-2 border border-1 border-orange dashboard-hover text-center rounded-4 shadow-sm h-100">
                      <div className="d-flex justify-content-center align-items-center">
                        <FaIdCard />
                      </div>
                      <h6 className="fw-bold mt-2 " style={{ color: "#A22191" }} >
                        {translatedText.scanNew}
                      </h6>
                      <p className="text-muted small mb-0">
                        {translatedText.scanContent}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Card 2 */}
                <div className="col">
                  <Link href="/dashboard/items">
                    <div className="card py-3 px-2 border border-1 border-orange dashboard-hover text-center rounded-4 shadow-sm h-100">
                      <div className="d-flex justify-content-center align-items-center">
                        <FaBoxOpen />
                      </div>
                      <h6 className="fw-bold mt-2 " style={{ color: "#A22191" }} >
                        {translatedText.items}
                      </h6>
                      <p className="text-muted small mb-0">
                        {translatedText.itemContent}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Card 3 */}
                <div className="col">
                  <Link href="/dashboard/alerts">
                    <div className="card py-3 px-2 border border-1 border-orange dashboard-hover text-center rounded-4 shadow-sm h-100">
                      <div className="d-flex justify-content-center align-items-center">
                        <FaBell />
                      </div>
                      <h6 className="fw-bold mt-2 " style={{ color: "#A22191" }} >
                        {translatedText.alerts}
                      </h6>
                      <p className="text-muted small mb-0">
                        {translatedText.alertContent}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Card 4 */}

                {/* Card 5 */}
                <div className="col">
                  <Link href="/dashboard/transaction">
                    <div className="card py-3 px-2 border border-1 border-orange dashboard-hover text-center rounded-4 shadow-sm h-100">
                      <div className="d-flex justify-content-center align-items-center">
                        <FaExchangeAlt />
                      </div>
                      <h6 className="fw-bold mt-2 "style={{ color: "#A22191" }} >
                        {translatedText.transaction}
                      </h6>
                      <p className="text-muted small mb-0">
                        {translatedText.transactionContent}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Spacer to balance layout */}
                <div className="col d-none d-sm-block"></div>
              </div>
            </div>
          </IconContext.Provider>
        </div>

        {/* Optional: Additional styling */}
        <style jsx>{`
          .text-orange {
            color: #ff7a00;
          }
          .border-orange {
            border: 2px solid #A22191!important;
            border-radius: 1rem;
          }
          .dashboard-hover:hover {
            transform: translateY(-3px);
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(255, 122, 0, 0.15);
          }
        `}</style>
        <Support />
      </div>
    </>
  );
};

export default Dashboard;
