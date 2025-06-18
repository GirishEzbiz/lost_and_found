import Support from "pages/support";
import React, { useEffect, useState } from "react";
import GoBack from "./backButton";
import axios from "axios";
import moment from "moment"; // Importing moment
import useTranslate from "utils/useTranslate";
import translateText from "utils/translateText";
 

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [expanded, setExpanded] = useState({});

  const texts = useTranslate({
    notifications: "Notifications",
    readMore: "Read more...",
    showLess: "Show less",
  });
  

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/api/notifications/foundNotification`);
        const originalData = response.data;
    
        // Translate each title and message
        const translatedData = await Promise.all(
          originalData.map(async (item) => {
            const [translatedTitle, translatedMessage] = await Promise.all([
              translateText(item.title),
              translateText(item.message),
            ]);
    
            return {
              ...item,
              title: translatedTitle,
              message: translatedMessage,
            };
          })
        );
    
        setNotifications(translatedData);
      } catch (err) {
        console.error("error", err);
      }
    };
    

    fetchNotifications(); // Initial fetch
    const intervalId = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPreviewMessage = (message) => {
    const words = message.split(" ");
    return words.slice(0, 10).join(" ") + (words.length > 10 ? "..." : "");
  };

  // Using Moment.js to calculate relative time
  const timeAgo = (date) => {
    return moment(date).fromNow(); // Moment.js relative time (e.g., "a few seconds ago")
  };

  return (
    <>
      <div className="d-flex align-items-center bg-white p-3">
        <GoBack />
        <div className="w-100">
          <h4 className="mb-0" style={{ marginLeft: "5%" }}>
          {texts.notifications}
          </h4>
        </div>
      </div>

      <div className="container py-4">
        <div className="list-group" style={{ marginBottom: "20%" }}>
          {notifications &&
            notifications.map((notification) => (
              <div key={notification.id} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">{notification.title}</h5>
                  {/* Displaying relative time using moment.js */}
                  <small>{timeAgo(notification.indate)}</small>
                </div>
                <p className="mb-1">
                  {expanded[notification.id] ? notification.message : getPreviewMessage(notification.message)}
                </p>
                {notification.message.split(" ").length > 10 && (
                  <small
                    className="text-muted"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleExpand(notification.id)}
                  >
                   {expanded[notification.id] ? texts.showLess : texts.readMore}
                  </small>
                )}
              </div>
            ))}
        </div>
        <Support />
      </div>
    </>
  );
};

export default Notifications;
