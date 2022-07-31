import {ref} from "vue";

export function useAnnouncement() {
  const announcement = ref('')
  const announce = (value: string | undefined) => {
    if (value != null) {
      announcement.value = value
    }
  }

  return {announce, announcement} as const;
}
