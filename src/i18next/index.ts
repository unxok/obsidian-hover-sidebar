import { en } from "./langs/en";

const namespace = "hover-sidebar";
export const text = i18next.getFixedT(null, namespace);

// Add aditional bundles here
i18next.addResourceBundle("en", namespace, en);
