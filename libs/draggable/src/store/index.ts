import { store } from './store';

export function init(id: string) {
  store.actions.initContainer(id);
}

export function remove(id: string) {
  store.actions.removeContainer(id);
}
export const setParentProps = store.actions.setParentProps;
export function register(containerId: string, id: string) {
  store.actions.registerItem(containerId, id);
}
export function unRegister(containerId: string, id: string) {
  store.actions.unRegisterItem(containerId, id);
}
export const registerItemShow = store.actions.registerItemShow;
export const registerAction = store.actions.registerAction;

export const setToFront = store.actions.setToFront;
export const setToBack = store.actions.setToBack;
export const setComponentCard = store.actions.setComponentCard;
export const setComponentCardHeader = store.actions.setComponentCardHeader;
export const setComponentCardSidebarToggle =
  store.actions.setComponentCardSidebarToggle;
