export const UNAUTHORIZED = {
  NOT_AUTHORIZED: {
    message: "NOT AUTHORIZED",
    code: 401000,
  },

  REFRESH_TOKEN_EXPIRED: {
    message: "REFRESH TOKEN EXPIRED",
    code: 401201,
  },

  INVALID_USER: {
    message: "INVALID USER",
    code: 401301,
  },

  INVALID_USER_MATCH: {
    message: "INVALID USER MATCH",
    code: 401302,
  },

  INVALID_ACCOUNT: {
    message: "INVALID ACCOUNT",
    code: 401303,
  },
};

export const INTERNAL_ERROR = {
  message: "SERVER TASK FAILED",
  code: 500,
};
