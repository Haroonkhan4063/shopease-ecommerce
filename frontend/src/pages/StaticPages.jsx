import StaticPage from "../components/StaticPage";

export const About = () => (
  <StaticPage title="About ShopEase">
    <p>
      ShopEase is a multi-vendor marketplace where independent sellers can list and manage their own
      products, and buyers can shop from many stores in one place. Built on the MERN stack (MongoDB,
      Express, React, Node.js) with Stripe payments and Cloudinary image hosting.
    </p>
    <p>This project was built as a portfolio piece demonstrating a full production-style e-commerce flow.</p>
  </StaticPage>
);

export const Contact = () => (
  <StaticPage title="Contact Us">
    <p>Have a question or want to get in touch? Reach out any time.</p>
    <p>Email: support@vendra.example</p>
  </StaticPage>
);

export const Careers = () => (
  <StaticPage title="Careers">
    <p>ShopEase isn't currently hiring — this is a portfolio project, not a live company.</p>
  </StaticPage>
);

export const Terms = () => (
  <StaticPage title="Terms of Service">
    <p>
      By using ShopEase, you agree to use the platform responsibly. Sellers are responsible for the
      accuracy of their product listings; buyers are responsible for providing accurate shipping and
      payment information.
    </p>
    <p>This is placeholder text for a demo/portfolio project and does not constitute a binding legal agreement.</p>
  </StaticPage>
);

export const Privacy = () => (
  <StaticPage title="Privacy Policy">
    <p>
      ShopEase collects only the information needed to operate the platform: account details, order
      history, and shipping addresses. Payment card details are handled directly by Stripe and never
      touch our servers.
    </p>
    <p>This is placeholder text for a demo/portfolio project.</p>
  </StaticPage>
);

export const Refunds = () => (
  <StaticPage title="Refund Policy">
    <p>
      Refund eligibility depends on the individual seller's policy. Contact the seller directly through
      your order details to request a return or refund.
    </p>
    <p>This is placeholder text for a demo/portfolio project.</p>
  </StaticPage>
);
