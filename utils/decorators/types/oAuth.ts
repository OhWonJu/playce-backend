export type GoogleOAuthResult = {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  image: string;
  accessToken: string;
};

export type AccessPayload = {
  sub: string;
  usename: string;
};

export type RefreshPayload = {
  sub: string;
  accountname: string;
  iat: number;
  exp: number;
};
