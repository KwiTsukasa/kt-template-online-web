import { os } from "@/utils/detect";

const config = (() => ({
  isMobileApp: !os.desktop,
  axiosBase: "/api",
  playground: import.meta.env.VITE_APP_PLAY_GROUND,
}))();

export default config;

