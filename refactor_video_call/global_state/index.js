import { atom, selector } from "recoil";


export const message = atom({
  key: "message",
  default: [],
});

export const menuOpened = atom({
  key: "menuOpened",
  default: 2,
});
