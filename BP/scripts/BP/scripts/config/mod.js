import { CustomForm, Observable } from "@minecraft/server-ui";
import { utils } from "../utils/utils";
export const config = {
    experimentalDDUI: new utils.WorldDynamicProperty("config:experimental_ddui", false),
};
const experimentalDDUIObservable = Observable.create(false, {
    clientWritable: true,
});
export async function openConfig(player) {
    const form = CustomForm.create(player, "HOTU Config");
    experimentalDDUIObservable.setData(config.experimentalDDUI.get());
    form
        .spacer()
        .header({
        translate: "naker_hotu.ui.experimental_ddui",
    })
        .spacer()
        .label({
        translate: "naker_hotu.ui.experimental_ddui_desc",
    })
        .spacer()
        .toggle({
        translate: "naker_hotu.ui.experimental_ddui",
    }, experimentalDDUIObservable);
    await form.show();
    config.experimentalDDUI.set(experimentalDDUIObservable.getData());
}
