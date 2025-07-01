
export const detectMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getNetworkInfo = () => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0,
    saveData: connection?.saveData || false
  };
};

export const isSlowNetwork = (): boolean => {
  const networkInfo = getNetworkInfo();
  return networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g' || networkInfo.saveData;
};
