const statusStyles = {
  Processing: "bg-amber-50 text-amber-700",
  Shipped: "bg-blue-50 text-blue-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

const OrderStatusBadge = ({ status }) => (
  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
    {status}
  </span>
);

export default OrderStatusBadge;
