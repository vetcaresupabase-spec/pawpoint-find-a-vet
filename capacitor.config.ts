import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.pet2vet.mvp",
  appName: "Pet2Vet",
  webDir: "dist",
  // Uncomment the server block below for live-reload during development:
  // server: {
  //   url: "http://YOUR_LOCAL_IP:8080",
  //   cleartext: true,
  // },
  bundledWebRuntime: false,
  ios: {
    scheme: "https",
  },
  plugins: {
    StatusBar: {
      style: "DEFAULT",
      backgroundColor: "#ffffff",
    },
  },
};

export default config;
