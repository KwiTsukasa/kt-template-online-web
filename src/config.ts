import { os } from "@/utils/detect";

const config = (() => ({
  adminLogin: import.meta.env.VITE_APP_ADMIN_LOGIN || `${window.location.protocol}//${window.location.hostname}:5999/auth/login`,
  isMobileApp: !os.desktop,
  axiosBase: "/api",
  playground: import.meta.env.VITE_APP_PLAY_GROUND,
}))();

export default config;
