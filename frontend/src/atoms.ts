import { atom } from 'recoil';
import { type userType, type messageType, type chatType } from './types/types';

export const usersAtom = atom<userType[]>({
  key: 'usersAtom',
  default: [],
});

export const messagesAtom = atom<messageType[]>({
  key: 'userAtom',
  default: [],
});

export const selectedUserAtom = atom<userType | null>({
  key: 'selectedUser',
  default: null,
});

export const myChatsAtom = atom<chatType[]>({
  key: 'myChatsAtom',
  default: [],
});

export const selectedChatAtom = atom<chatType | null>({
  key: 'selectedChatAtom',
  default: null,
});
// export const myChatsSelector = selector<chatType[]>({
//   key: 'myChatsSelector',
//   get: async ({ get }) => {
//     try {
//       const res = await axios.get('http:localhost:3000/users/allChats');
//       const data = res.data.chats;

//       if (data.chats) {
//         return data.chats;
//       }
//       return [];
//     } catch (e) {
//       console.error(e);
//     }
//   },
// });
