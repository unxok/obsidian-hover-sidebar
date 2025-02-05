import "i18next";
import { LanguageResource } from "./LanguageResource";

declare module "i18next" {
	interface CustomTypeOptions {
		resources: {
			"hover-sidebar": LanguageResource;
		};
	}
}
