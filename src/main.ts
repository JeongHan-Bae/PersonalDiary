import { createApp, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';

import CookieConsentPrompt from '@/app/components/CookieConsentPrompt.vue';
import DesktopApp from '@/app/DesktopApp.vue';
import MobileApp from '@/app/MobileApp.vue';
import './style.css';
import '@/app/styles/components.css';
import '@/app/styles/desktop/home.css';
import '@/app/styles/mobile/home.css';
import { detectDeviceKind } from '@/utils/device';
import { applyTheme, getInitialTheme } from '@/presentation/themeRuntime';
import {
  applyLanguage,
  getInitialLanguage,
} from '@/presentation/languageRuntime';
import {
  acceptCookieStorageConsent,
  closePageAfterCookieStorageConsentRejection,
  hasCookieStorageConsent,
} from '@/presentation/cookieConsentRuntime';

const RootApp = defineComponent({
  name: 'RootApp',
  setup() {
    const deviceKind = ref(detectDeviceKind());
    const hasStorageConsent = ref(hasCookieStorageConsent());

    const applyStoredUiSettings = (): void => {
      applyTheme(getInitialTheme());
      applyLanguage(getInitialLanguage());
    };

    const updateDeviceKind = (): void => {
      deviceKind.value = detectDeviceKind();
    };

    const acceptStorageConsent = (): void => {
      acceptCookieStorageConsent();
      hasStorageConsent.value = true;
      applyStoredUiSettings();
    };

    const rejectStorageConsent = (): void => {
      closePageAfterCookieStorageConsentRejection();
    };

    onMounted(() => {
      if (hasStorageConsent.value) {
        applyStoredUiSettings();
      }

      window.addEventListener('resize', updateDeviceKind);
      window.visualViewport?.addEventListener('resize', updateDeviceKind);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateDeviceKind);
      window.visualViewport?.removeEventListener('resize', updateDeviceKind);
    });

    return () =>
      hasStorageConsent.value
        ? h(deviceKind.value === 'mobile' ? MobileApp : DesktopApp)
        : h(CookieConsentPrompt, {
            onAccept: acceptStorageConsent,
            onReject: rejectStorageConsent,
          });
  },
});

createApp(RootApp).mount('#app');
