import { atom, selector } from "recoil";
import faker from "faker"


export const videoAtom = atom({
  key: "video",
  default: false
});

export const audioAtom = atom({
  key: "audio",
  default: false,
});


export const screenAtom = atom({
  key: "screen",
  default: false,
});

export const showModalAtom = atom({
  key: "showModal",
  default: false,
});

export const screenAvailableAtom = atom({
  key: "screenAvailable",
  default: false,
});

export const messagesAtom = atom({
  key: "messages",
  default: [],
});

export const messageAtom = atom({
  key: "message",
  default: "",
});


export const newMessagesAtom = atom({
  key: "newMessages",
  default: 0,
});

export const askForUserNameAtom = atom({
  key: "askForUserName",
  default: true,
});


export const userNameAtom = atom({
  key: "userName",
  default: faker.internet.userName()
});
