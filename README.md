# auth-mn

**Auth.mn** — таны апп-уудын нэгдсэн хэрэглэгчийн систем. Хэрэглэгч бүртгүүлэх, нэвтрэх
(утас / имэйл OTP, Google, Facebook, Steam, QR), профайл, төхөөрөмж, мэдэгдлийг Auth.mn
хариуцна; таны апп зөвхөн **хэрэглэгчийн token**-ийг хүлээж аваад Auth.mn-ээс мэдээллийг нь
асууна.

Энэ сан нь таны **backend (Node.js)** дээр ажиллана:

| Та юу хийх вэ | Сангийн функц | Шаардлагатай эрх |
|---|---|---|
| Frontend-ээс ирсэн хэрэглэгчийн token шалгаж мэдээллийг авах | `user.verify(token)` / `user.middleware()` | `user.verify` |
| user_id / утас / имэйлээр нэг хэрэглэгч авах | `user.find({...})` | `user.read` |
| Олон хэрэглэгч (өөрийн апп-ийн хэрэглэгчид, ID жагсаалт, хайлт) | `user.list({...})` / `user.listAll({...})` | `user.read` |
| Push мэдэгдэл, SMS, имэйл илгээх | `notification.push / sms / mail` | `notification.*` |
| Хэрэглэгчийн нээлттэй апп дээр realtime toast / төлөв харуулах | `socket.toast / status / orderStatus / emit` | `socket.*` |

Frontend дээр нэвтрэх товч, QR нэвтрэлт хэрэгтэй бол **[auth-mn-react](https://www.npmjs.com/package/auth-mn-react)** санг хэрэглэнэ.

```bash
npm i auth-mn
```

---

## 1. Client бүртгүүлэх

Auth.mn **admin panel → Апп-ууд (Client)** дээр апп-аа бүртгэхэд `client_id` (`cl_…`) болон
`client_secret` (`sk_…`) олгоно. Secret **нэг л удаа** харагдана — `.env`-дээ хадгална.
Тухайн апп ямар API дуудаж болохыг (эрхүүдийг) admin тэндээ сонгоно; эрхгүй API дуудвал
`403` + ямар эрх дутууг хэлсэн message ирнэ.

```env
AUTH_MN_CLIENT_ID=cl_xxxxxxxxxxxxxxxx
AUTH_MN_CLIENT_SECRET=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 2. Тохиргоо

```ts
import authMn, { setAuth, setHost } from "auth-mn";

setHost("prod"); // "staging" эсвэл setHost({ MAIN: "https://api.auth.mn" })
setAuth({
  client_id: process.env.AUTH_MN_CLIENT_ID!,
  client_secret: process.env.AUTH_MN_CLIENT_SECRET!
});
```

Үүний дараа юу ч хийх шаардлагагүй: сан `client_id + secret`-ээр access token (1 цаг) болон
refresh token (30 хоног) авч, хугацаа дуусахаас өмнө өөрөө сунгана. 401 ирвэл token-оо
сэргээж нэг удаа дахин оролдоно. **Бүх функц `{ success, message, data, status }` буцна, throw хийхгүй.**

## 3. Хэрэглэгч нэвтрүүлэх (гол урсгал)

```
[Frontend]  auth-mn-react → Auth.mn дээр нэвтэрнэ → таны сайт руу ?authToken=... буцна
                 (эсвэл QR / OTP-оор token авна)
      │  Authorization: Bearer <authToken>
      ▼
[Таны backend]  authMn.user.verify(authToken)  ──►  Auth.mn (client token + user.verify эрх)
      │                                               token-ийг задалж, хэрэглэгчийн
      ▼                                               мэдээллийг буцаана
   өөрийн session / JWT үүсгэнэ, хэрэглэгчийг DB-дээ user_id-аар холбоно
```

### 3.1 Нэвтрэх endpoint

```ts
app.post("/api/auth/callback", async (req, res) => {
  const v = await authMn.user.verify(req.body.authToken);
  if (!v.success) return res.status(401).json({ message: v.message });

  const u = v.data.user; // user_id, user_name, primary_phone, primary_email, profile_image_url, ...
  // 1) өөрийн DB-д user_id-аар хайж байхгүй бол үүсгэнэ
  // 2) өөрийн session / JWT үүсгэж cookie-д хадгална
  res.json({ success: true, user: u });
});
```

`v.data`:

```ts
{
  user: UserT;                        // доорх бүтэц
  exp: number | null;                 // хэрэглэгчийн token дуусах хугацаа (unix sec)
  client: { client_id, name }         // ямар client-ээр шалгасан
}
```

Шалгалт бүр хэрэглэгчийн **нэвтрэлтийн түүхэнд** "`<таны домэйн>`-д дамжуулсан" гэж бүртгэгдэнэ —
хэрэглэгч Auth.mn дээрээ аль апп-д хэзээ нэвтэрснээ харна.

### 3.2 Route хамгаалах middleware

Хэрэглэгчийн token-ийг хүсэлт бүрт шалгах бол:

```ts
// Authorization: Bearer <token>  (эсвэл ?authToken= / body.authToken)
app.get("/api/me", authMn.user.middleware(), (req, res) => {
  res.json(req.authMnUser); // UserT
});

app.get("/api/feed", authMn.user.middleware({ required: false }), (req, res) => {
  // нэвтрээгүй бол req.authMnUser === null, алдаа өгөхгүй
});
```

> Хүсэлт бүрт Auth.mn руу нэг дуудлага хийдэг тул ачаалал ихтэй бол 3.1-ийн адил нэвтрэх үед нэг удаа
> шалгаад өөрийн session/JWT ашиглахыг зөвлөнө.

### 3.3 Хэрэглэгч хайх

```ts
const r = await authMn.user.find({ user_id: 5742248 });   // эсвэл { phone_number: "99112233" } / { email }
if (r.success) console.log(r.data.user_name);
```

### 3.4 Олон хэрэглэгч (жагсаалт)

```ts
// Таны апп-д бүртгүүлсэн бүх хэрэглэгч — campaign, push илгээхэд
const r = await authMn.user.list({ app_name: "CHARGEX", fields: "lite", page: 1, limit: 500 });
// r.data = { list: UserLite[], total, page, limit }

const all = await authMn.user.listAll({ app_name: "CHARGEX", fields: "lite" }); // бүх хуудсыг нэгтгэнэ
await authMn.user.list({ user_ids: [5742248, 5742249] });
await authMn.user.list({ q: "9911", last_login_after: "2026-01-01" });
```

Шүүлтүүр: `user_ids | app_name | phone_number | email | name | q | gender | last_login_after | page | limit (≤500) | fields ("full" | "lite")`.

### UserT

```ts
{
  user_id: number;              // Auth.mn-ийн тогтмол ID — өөрийн DB-д үүгээр холбоно
  user_name: string;
  nick_name: string;
  primary_phone: string | null;
  primary_email: string | null;
  emails: { email, verified, primary }[];
  phone_numbers: { number, verified, primary }[];
  profile_image_url: string;
  gender?: "MEN" | "WOMEN";
  date_of_birth: Date | null;
  auth_profiles: { google_id, facebook_id, steam_id, ... };
  sign_up_date, last_login, ...
}
```

## 4. Мэдэгдэл

```ts
await authMn.notification.push({
  user_id: 5742248,
  target_app: "MY-APP",
  body: { title: "Захиалга", body: "Захиалга #123 батлагдлаа", button: { title: "Харах", url: "https://..." } }
});                                                                             // notification.push
await authMn.notification.sms({ to: "99112233", from: "MYAPP", text: "Код: 1234" }); // notification.sms
await authMn.notification.mail({
  type: "notification", to: ["a@b.mn"], subject: "Сайн уу",
  body: { name: "Бат", title: "Тавтай морил", desc: "..." }
});                                                                             // notification.mail
```

## 5. Socket (realtime)

Хэрэглэгч Auth.mn-тэй холбогдсон аль нэг апп-аа нээлттэй байхад:

```ts
await authMn.socket.toast({ user_id, type: "info", text: "Төлбөр амжилттай" });          // socket.toast
await authMn.socket.status({ user_id, id: "order-123", type: "Loading", title: "Боловсруулж байна" }); // socket.status
await authMn.socket.status({ user_id, id: "order-123", type: "Success", title: "Амжилттай", amount: 15000 });
await authMn.socket.orderStatus({ user_id, order_id: "order-123" });                      // socket.status
await authMn.socket.emit([{ user_id, emit_name: "my-event", data: { any: 1 } }]);        // socket.emit
```

## 6. Client өөрийн мэдээлэл

```ts
import { config } from "auth-mn";
await authMn.auth.getToken();   // хүчинтэй access token (шаардлагатай бол refresh / login хийгээд)
config.token;                   // одоогийн access token — гараар Authorization: Bearer үүсгэхэд

await authMn.auth.me();                      // { client_id, name, permissions, ... }
authMn.auth.hasPermission("notification.sms"); // сүүлийн token-оос
await authMn.auth.permissions();             // Auth.mn-ийн бүх боломжит эрх
await authMn.auth.revoke();                  // refresh token-оо хүчингүй болгоод cache цэвэрлэнэ
```

## Алдаа

| status | Шалтгаан |
|---|---|
| 401 | client_id/secret буруу, client идэвхгүй, эсвэл хэрэглэгчийн token хүчингүй |
| 403 | Энэ API-д шаардлагатай эрх client-д олгогдоогүй — admin panel дээр нэмнэ |
| 0 | Сүлжээний алдаа (`message`-д шалтгаан) |

## 0.x → 1.0 шилжилт

- `config.auth.username / password`, `auth.TOKEN({username,password})` → `setAuth({ client_id, client_secret })`.
  Хуучин client бүртгэлүүд admin panel дээр **Secret шинэчлэх** дарж secret авна.
- `find.USER / MERCHANT / ADMIN / CLIENT / CRM` **хасагдсан** — хэрэглэгчийн мэдээлэл `user.verify` / `user.find`-ээр.
- `notification.SinglePushNoti / SMS / MAIL`, `socket.ShowToast / ShowStatus / ShowOrderStatus / EMIT` хэвээр ажиллана (alias).
- `notification._3RD.*` хасагдсан.
