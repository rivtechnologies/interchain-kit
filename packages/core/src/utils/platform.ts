export const isMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor
  return (
    /android/i.test(userAgent) ||
    /iPad|iPhone|iPod/.test(userAgent)
  );
}

export const isAndroid = () => {
  const userAgent = navigator.userAgent || navigator.vendor
  return /android/i.test(userAgent);
}

export const isIOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor
  return /iPad|iPhone|iPod/.test(userAgent);
}
