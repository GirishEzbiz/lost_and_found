export const dateFormat = (dt) => {
  if (!dt || isNaN(new Date(dt).getTime())) return "-";
  return new Date(dt).toLocaleDateString("en-IN");
};
