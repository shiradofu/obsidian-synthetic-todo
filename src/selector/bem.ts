import { APP_ID } from "src/constants"

export const bem =
	(block = "") =>
	(element = "", modifier = "") =>
		`${APP_ID}-selector${block && "-"}${block}${element && "__"}${element}${
			modifier && "--"
		}${modifier}`
