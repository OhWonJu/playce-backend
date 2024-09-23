export interface KakoPayReadyBody {
  albumIds: string[];
  quantities: string[];

  kakaoPayBody: {
    cid: string;
    partner_order_id: string;
    partner_user_id: string;
    item_name: string;
    quantity: number;
    total_amount: number;
    vat_amount: number;
    tax_free_amount: number;
    approval_url: string;
    fail_url: string;
    cancel_url: string;
  };
}

export interface KakaoPaySuccessBody {
  tid: string;
  pg_token: string;
}
