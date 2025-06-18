// pages/_app.js
import Head from "next/head";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import SSRProvider from "react-bootstrap/SSRProvider";
import { Analytics } from "@vercel/analytics/react";
import "bootstrap/dist/css/bootstrap.min.css";

// Import stylessss
import "styles/theme.scss";
import { getLayout } from "utils/getLayout";
import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Footer from "components/Footer";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [executionTime, setExecutionTime] = useState(null);
  const pageURL = process.env.NEXT_PUBLIC_baseURL + router.pathname;
  const title = "Qritagya – Smart QR Protection & Lost & Found Platform";
  const description =
    "Qritagya helps you protect your valuables using smart QR codes. If an item is lost, the finder can scan the code and help return it. Secure. Simple. Reliable.";
  const keywords =
    "Qritagya, Lost and Found, QR Code Tracker, Item Recovery, Smart QR Tag, Scan to Return, QR Lost & Found, Secure Item Tagging, Return Lost Items, QR Item Finder";

  const Layout = Component.Layout || getLayout(router.pathname);

  useEffect(() => {
    if (!router.pathname.startsWith("/admin")) {
      import("styles/globals.css");
    }
  }, [router.pathname]);

  useEffect(() => {
    const pathSegment2 = router.pathname.split("/")[1]; // segment 2
    const body = document.body;

    if (pathSegment2 === "dashboard") {
      body.classList.add("user-panel");
    } else {
      body.classList.remove("user-panel");
    }
  }, [router.pathname]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // const backgroundColor =
  //   router.pathname.startsWith("/admin") || router.pathname.startsWith("/brand")
  //     ? "rgb(241, 245, 249)" // Admin bg
  //     : "#fff5df"; // Default bg
  useEffect(() => {
    const start = performance.now(); // start timing on route change

    const handleComplete = () => {
      const end = performance.now();
      const duration = ((end - start) / 1000).toFixed(4); // in seconds
      setExecutionTime(duration);
    };
    router.events.on("routeChangeComplete", handleComplete);
    handleComplete(); // initial load

    return () => {
      router.events.off("routeChangeComplete", handleComplete);
    };
  }, [router.pathname]);
  const backgroundColor =
    router.pathname.startsWith("/admin") || router.pathname.startsWith("/brand")
      ? "rgb(241, 245, 249)"
      : "#fff7ff";
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <SSRProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <meta name="keywords" content={keywords} />
          <link
            rel="shortcut icon"
            href="/images/faviconss.png"
            type="image/png"
          />
        </Head>
        <NextSeo
          title={title}
          description={description}
          canonical={pageURL}
          openGraph={{
            url: pageURL,
            title: title,
            description: description,
            site_name: process.env.siteName,
          }}
        />
        <div style={{ backgroundColor }} className="min-h-screen flex flex-col">
          <Layout className="flex-grow">
            <Component {...pageProps} />
            <Analytics />
          </Layout>

          {/* Footer is only shown for admin routes */}
          {router.pathname.startsWith("/admin") && (
            <Footer executionTime={executionTime} />
          )}
        </div>
      </SSRProvider>
    </GoogleOAuthProvider>
  );
}

export default MyApp;

// pages/_app.js
// import Head from "next/head";
// import { useRouter } from "next/router";
// import { NextSeo } from "next-seo";
// import SSRProvider from "react-bootstrap/SSRProvider";
// import { Analytics } from "@vercel/analytics/react";
// import 'bootstrap/dist/css/bootstrap.min.css';

// // Import stylessss
// import "styles/theme.scss";

// import { getLayout } from "utils/getLayout";
// import { useEffect } from "react";
// import { GoogleOAuthProvider } from "@react-oauth/google";

// function MyApp({ Component, pageProps }) {
//   const router = useRouter();
//   const pageURL = process.env.baseURL + router.pathname;
//   const title = "Qritagya ";
//   const description = "Qritagya - The  Description";
//   const keywords = "Qritagya - The  Description";

//   const Layout = Component.Layout || getLayout(router.pathname);

//   useEffect(() => {
//     if (!router.pathname.startsWith("/admin")) {
//       import("styles/globals.css");
//     }
//   }, [router.pathname]);

//   useEffect(() => {
//     const pathSegment2 =router.pathname.startsWith("/admin"); // segment 2
//     const body = document.body;

//     if (pathSegment2 === "dashboard") {
//       body.classList.add("user-panel");
//     } else {
//       body.classList.remove("user-panel");
//     }
//   }, [router.pathname]);

//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     document.body.appendChild(script);
//   }, []);

//   // 👇 Determine background based on route
//   const backgroundColor = router.pathname.startsWith("/admin")
//     ? "rgb(241, 245, 249)" // Admin bg
//     : "#fff5df";            // Default bg

//   return (
//     <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
//       <SSRProvider>
//         <Head>
//           <meta name="viewport" content="width=device-width, initial-scale=1" />
//           <meta name="keywords" content={keywords} />
//           <link rel="shortcut icon" href="/images/faviconss.png" type="image/png" />
//         </Head>

//         <NextSeo
//           title={title}
//           description={description}
//           canonical={pageURL}
//           openGraph={{
//             url: pageURL,
//             title: title,
//             description: description,
//             site_name: process.env.siteName,
//           }}
//         />

//         <Layout>
//           <div style={{ backgroundColor, minHeight: "100vh" }}>
//             <Component {...pageProps} />
//             <Analytics />
//           </div>
//         </Layout>
//       </SSRProvider>
//     </GoogleOAuthProvider>
//   );
// }

// export default MyApp;
