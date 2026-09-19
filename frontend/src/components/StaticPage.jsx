const StaticPage = ({ title, children }) => (
  <div className="max-w-3xl mx-auto px-6 py-16">
    <h1 className="text-3xl font-bold mb-6 text-gray-900">{title}</h1>
    <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">{children}</div>
  </div>
);

export default StaticPage;
