import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/da";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale("da");

export function formatLocalDateTimeFromUnix(ts) {
  try {
    return dayjs.unix(ts).format("ddd DD. MMM HH:mm");
  } catch {
    return "—";
  }
}

export function fromNowUnix(ts) {
  try {
    return dayjs.unix(ts).fromNow(); // “om 3 dage”, “for 2 timer siden”
  } catch {
    return "";
  }
}
