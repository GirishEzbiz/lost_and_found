import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@100;200;300;400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
            rel="stylesheet"
          />
          <link rel="stylesheet" href="/assets/css/all.min.css" />
          <link rel="stylesheet" href="/assets/css/slick.css" />
          <link rel="stylesheet" href="/assets/css/style.css" />
          <link rel="stylesheet" href="/assets/css/media-query.css" />
        </Head>
        <body>
          <div className="site-content">
            <Main />
          </div>
          <NextScript />
          <script src="/assets/js/jquery.min.js"></script>
          <script src="/assets/js/slick.min.js"></script>
          <script src="/assets/js/bootstrap.bundle.min.js"></script>
          <script src="/assets/js/modal.js"></script>
          <script src="/assets/js/custom.js"></script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
