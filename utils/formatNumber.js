export const formatNumber = (num) => {
    if (!num || isNaN(num)) return "0";
    return new Intl.NumberFormat("en-IN").format(Number(num));
  };
  