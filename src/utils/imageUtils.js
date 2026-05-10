export const getCdnUrl = (url, options = {}) => {
  if (!url) return null;
  if (url.includes("/w_")) return url;

  const { width = 400, height = 400, crop = "fill", quality = "auto" } = options;

  return url.replace(
    "/image/upload/",
    `/image/upload/w_${width},h_${height},c_${crop},q_${quality}/`
  );
};

export const getImageUrl = (url, fallback = null) => {
  if (!url) return fallback;
  return getCdnUrl(url);
};

export const getPublicId = (secureUrl) => {
  if (!secureUrl) return null;
  const match = secureUrl.match(/\/([^/]+)$/);
  return match ? match[1].split(".")[0] : null;
};