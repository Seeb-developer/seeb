import { Dimensions, Platform } from "react-native"
import Toast from "react-native-toast-message";
const { width, height } = Dimensions.get('window');
const Top = Platform.OS == "ios" ? 40 : 0;

const showToast = (type, message) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

export { width, height, Top, showToast }

