export function EmptyState({
  item = "item",
  message = "",
}: {
  item?: string;
  message?: string;
}) {
  return (
    <div className="center-child flex-col ">
      <p className="text-center text-small-passive ">No {item} to display</p>
      <br />
      <p>{message}</p>
    </div>
  );
}
