/* eslint-disable no-unused-vars */
export enum ENUM_USER_ROLE {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  EMPLOYER = 'EMPLOYER',
}

export enum ENUM_SOCKET_EVENT {
  NOTIFICATION = "notification",
  NEW_NOTIFICATION = "new-notification",
  SEEN_NOTIFICATION = "seen-notification",
  CONNECT = "connection",
  MESSAGE_NEW = "new-message",
  MESSAGE_GETALL = "all-message",
  CONVERSION = "conversion-list",
};

export enum ENUM_MEAL_TYPE {
  NONE = "none",
  BREAKFASTS = "breakfast",
  LUNCHES_AND_DINNERS = "lunches-and-dinners",
  DESSERTS = "desserts",
  SNACKS = "snacks",
  SIDES = "sides",
}

// 'breakfast', 'lunches-and-dinners', 'desserts', 'snacks', 'sides'