# Ecommerce uzerine microservice ile birlikte backend yazilicak

- E-ticaret islemlerini destekleyen mikroservice mimarisi ile gelistirilmis bir backend sistemi yazilacak
- Ozellikler
  - Kimlik Dogrulama
  - Urun Yonetimi
  - Siparis Islemleri
- Yukaridaki servisler icin ayri projeler olusturulacak.
- Tema Secenekleri :
  - Yemek Siparis Platformu ✅
  - Kitap Platformu

- **Gateway Service** -> Port:3000 : Projenin girisi, dagitici servis
- **Auth Service** -> Port:3001 : Kullanici girisi ve yetkilendirme
- **Restaurant Service** -> Port:3002 : Restoran ve Menu Yonetimi
- **Order Service** -> Port:3003 : Siparis Islemleri
- **Delivery Service** -> Port:3004 : Teslimat Islemleri, Kurye ve Teslimat Takibi

# Teknolojiler

- nodemon & ts-node
- node.js
- express.js
- mongodb - mongoose
- jsonwebtoken
- amqplib - rabbitMQ
- typescript
- bcrypte
- express-http-proxy
- joi - validasyon amacli kullanilir.(bu tercih edilmedi)
- zod
- cookie-parser
- dotenv
- morgan
- helmet - (gereken http guvenlik header larini ekler, istekler guvenli iletilir.)
- express-rate-limit

## Kurulum Komutlari

- `npx tsc --init` -> tsconfig.json olusturur. typescriptin kurulumu yapilir
- `npm i express mongoose cors jsonwebtoken amqplib bcrypt express-http-proxy express-rate-limit zod dotenv cookie-parser morgan helmet`
- `npm i typescript -D` -> gelistirici bagimliligi olarak indirildi
- `npm install --save-dev @types/node @types/express @types/cookie-parser @types/express-http-proxy @types/express-rate-limit @types/helmet @types/jsonwebtoken @types/mongoose @types/cors @types/morgan @types/bcrypt @types/amqplib nodemon ts-node` -> typescript icin gerekli olan kutuphanelerin tipleri kuruldu

## API Endpoints

### AUTH Service

```bash
POST /api/auth/register  -> Kullanici Kaydi
POST /api/auth/login     -> Kullanici Girisi
GET  /api/auth/profile   -> Kullanici Profil Bilgileri
POST /api/auth/address   -> Kullanicinin adresi eklenir
POST /api/auth/logout    -> Kullanici Cikis Islemi
```

### Restaurant Service

```bash
GET  /api/restaurants          -> Restoranlari listele
POST /api/restaurants          -> Yeni restoran olustur(admin)
GET  /api/restaurants/:id      -> Restoran Detayi
GET  /api/restaurants/:id/menu -> Restoranin menusunu getir
POST /api/restaurants/:id/menu -> Menuye Urun Ekle
```

### Order Service

```bash
POST   /api/orders                  -> Siparis Olustur
GET    /api/orders/:orderId         -> Istenen Siparisi Getir
GET    /api/orders/user/:userId     -> Kullanici Siparislerini Alabil
PATCH  /api/orders/:orderId/status  -> Siparis durumu guncelle
```

### Delivery Service

```bash
POST   /api/delivery/couriers/register                -> Kurye Kaydi
POST   /api/delivery/couriers/login                   -> Kurye Giris
POST   /api/delivery/couriers/orders/:orderId/accept  -> Teslimati Kabul Et
PATCH  /api/delivery/orders/:orderId/status           -> Teslimat durumunu guncelle
GET    /api/delivery/orders/:orderId/tracking         -> Teslimatin nerede oldugunu takip et
```

## Kurulum

### Gereksinimler

- Node.js
- MongoDB
- RabbitMQ

### Ortam Degiskenleri

- Asagidaki yazim ornek bir yazimdir. Her servis icin ayri ayri tanimlanmalidir
- JWT_SECRET butun servislerde ayni olmalidir.

```bash
PORT=3001
MONGODB_URO=mongodb://localhost:27017/food-delivery-auth
JWT_SECRET=dTBRvWN2/o5yQVimCXne8t3FRh4+Xk+4PXp+zpzAqk8=
RABBITMQ_URL=amqp://localhost:5672

```
