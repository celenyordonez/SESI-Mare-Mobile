import "../../global.css";

import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { mareToastConfig } from "../components/MareToast";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      />
      <Toast
        config={mareToastConfig}
        position="top"
        topOffset={56}
        visibilityTime={3500}
        swipeable
      />
    </>
  );
}
