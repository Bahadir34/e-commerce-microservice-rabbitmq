// Bussiness logic burada yonetilir ve veritabani ile iletisime gecilecek olan katman

class AuthService {
  constructor() {}

  async register(): Promise<string> {
    return "Kullanici Verisi";
  }
  async login(): Promise<string> {
    return "Kullanici Verisi";
  }
}

export default new AuthService();
