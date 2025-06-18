import Link from "next/link";
import { useEffect, useState } from "react";
import { MdOutlineManageAccounts } from "react-icons/md"; // Icon for manage
import { BiBell } from "react-icons/bi"; // Icon for alert
import { HiOutlineArrowRight } from "react-icons/hi";

function SubscriptionAlerts() {
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(false);

  useEffect(() => {
    const fetchSubscriptionAlerts = async () => {
      try {
        const response = await fetch("/api/check_subscriptions"); // Your API endpoint
        const data = await response.json();
        if (data.length > 0) {
          setSubscriptionAlerts(true);
        } else {
          setSubscriptionAlerts(false);
          return;
        }
      } catch (error) {
        // Log the error with the message, stack trace, and function name
        console.log("error fetching subscription data", error);
      }
    };
    fetchSubscriptionAlerts();
  }, []);
  return (
    <>
      {subscriptionAlerts && (
        <div
          className="shadow-sm p-4 d-flex flex-column gap-4 mb-4"
          style={{
            backgroundColor: "#FFF7F5",
            border: "1.5px solid #F5A09B",
            borderLeft: "5px solid #FF6B57",
            borderRadius: "12px",
          }}
        >
          <div className="d-flex align-items-start gap-2">
            <BiBell size={28} className="text-danger mt-1 flex-shrink-0" />
            <div>
              <h6 className="mb-1 fw-bold text-danger">
                Subscription Expiry Alert
              </h6>
              <p className="mb-1 text-muted small">
                One or more items subscription is getting expired. Please review
                them to avoid service interruption.{" "}
                <Link
                  href="/dashboard/items"
                  className="d-inline-flex align-items-center gap-1 text-decoration-none"
                  style={{
                    color: "#FF6B57",
                    fontWeight: 500,
                  }}
                >
                  Manage
                  <HiOutlineArrowRight size={16} />
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .text-orange {
          color: #ffa500;
        }
      `}</style>
    </>
  );
}

export default SubscriptionAlerts;
