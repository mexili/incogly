import { atom, selector } from "recoil";

const roomState = atom({
  key: "roomState",
  default: [],
});

const updateRooms = selector({
  key: "updateRooms",
  set: ({ set }, room) => {
    set(roomState, [...new State([...roomState, room])]);
  },
});

export default updateRooms;
