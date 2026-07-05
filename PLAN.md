# Order Service — Implementation Plan

แผนการพัฒนา order-service (cart + order + payment) — อ้างอิง [../../doc/API.md](../../doc/API.md)
สถาปัตยกรรม: NestJS + Clean Architecture + CQRS + Prisma (โครงเดียวกับ auth-service)

Legend: ✅ เสร็จ · 🔜 ถัดไป · ⬜ ยังไม่ทำ

---

## ✅ Phase 1 — Cart / Order / Payment core (เสร็จบางส่วน)
- Cart: `GET/POST/PATCH/DELETE /cart/:customerId/items...`, clear cart
- Order: create, get all (paginated), get by id, `PATCH :id/status`, `PATCH :id/cancel`
- Payment: create, complete, fail, get-by-order
- entities + repos + mappers ครบทั้ง 3 bounded context

---

## ✅ Phase 2 — Customer auth integration  ⭐⭐ (เสร็จ — ปิดช่องโหว่แล้ว)
> เดิม `customerId` รับมาจาก **URL path** = ใครก็ดู/แก้ cart คนอื่นได้ → ตอนนี้ดึงจาก JWT

- [x] `JwtAuthGuard` verify token จาก auth-service (`JWT_ACCESS_SECRET` ที่แชร์) — domain port `ITokenVerifier` + adapter `JwtTokenVerifier`
- [x] `RolesGuard` + `@Roles()` / `@CurrentUser()` (copy โครงจาก auth-service)
- [x] **Cart**: เปลี่ยน `/carts/:customerId/...` → `/carts/...` ดึง `customerId` จาก `@CurrentUser('sub')` (ปิด IDOR)
- [x] **Order**: `create` ดึง customerId+createdBy จาก token; `findAll`/`updateStatus` = `@Roles(ADMIN, SUPER_ADMIN)`; `findOne`/`cancel` = authenticated
- [x] **Payment**: `complete`/`fail` = admin; `create`/`get` = authenticated; `updatedBy` จาก token
- [x] env: เพิ่ม `JWT_ACCESS_SECRET` (Joi required) + `.env.example`; ลบ `customerId`/`createdBy`/`updatedBy` ออกจาก DTOs; ลบ `cancel-order.dto.ts`
- **เหลือทำต่อ:** ownership check บน `GET /orders/:id` และ `cancel` (ตอนนี้ authenticated customer คนใดก็เรียกด้วย orderId ได้ — mild IDOR); ยังเป็น role-based ไม่ใช่ permission `orders:*` ละเอียด; ยังไม่มี unit test สำหรับ guard

## 🟡 Phase 3 — Checkout + Coupon
- [x] **`POST /checkout`** (customer): โหลด cart → reserve stock ที่ product-service → สร้าง order จาก snapshot (ชื่อ+ราคาจาก product ไม่เชื่อ client) → เคลียร์ cart
- [x] **เช็ค+ตัด stock กับ product-service**: เรียก `POST /internal/products/reserve` (internal API key `x-internal-api-key`); validate ทุก line ก่อน แล้วค่อยตัด (ไม่มี partial write ตอน validate fail)
- [x] cross-service auth: `INTERNAL_API_KEY` แชร์ 2 service + `PRODUCT_SERVICE_URL`; gateway = `HttpProductGateway` (domain port `IProductGateway`)
- [ ] **compensation**: ถ้าสร้าง order fail หลัง reserve สำเร็จ → stock leak (ยังไม่มี release/saga) — pre-MVP รับได้
- [ ] `POST /checkout/validate-coupon` + coupon model (ยังไม่ทำ)
- [ ] atomicity ที่แท้จริง: ปัจจุบัน reserve ไม่ใช่ DB transaction ข้ามหลาย product (race ได้เล็กน้อย)

## 🟡 Phase 4 — Payment (manual bank + QR + slip)
> โมเดลจริงที่เลือก: **ไม่ auto** — admin ตั้งช่องทาง (bank+QR), ลูกค้าโอนแล้วแนบสลิป, admin ตรวจอนุมัติเอง (แทน OnePay auto)

- [x] **PaymentChannel CRUD** (admin): `POST/GET/GET :id/PATCH/DELETE /payment-channels` — fields: `bankName, accountName?, accountNumber?, qrImageUrl, isActive, sortOrder`
- [x] `GET /payment-channels/active` (ลูกค้าที่ login เห็น bank+QR ที่เปิดใช้ เรียงตาม `sortOrder`)
- [x] domain `PaymentChannel` entity + `IPaymentChannelRepository` + mapper/repo; model `payment_channels` ใน schema (ต้อง `db push`/migrate)
- [ ] **แนบสลิป**: เพิ่ม `channelId` + `slipImageUrl` ใน `Payment`; endpoint ลูกค้าแนบสลิป (status → กำลังตรวจ)
- [ ] **admin อนุมัติ**: verify slip → payment COMPLETED → order PENDING→PAID (reuse `complete`/`fail` เดิม); reject → FAILED
- [ ] (ทางเลือกภายหลัง) OnePay QR auto: `GET /payment/status/:orderId`, webhook callback, `POST /payment/dev/simulate/:orderId`

## 🔜 Phase 5 — Customer account + Shipments
- [ ] `/customer-account/orders`, `/orders/:id`, cancel
- [ ] addresses (อาจ proxy ไป auth-service หรือเก็บ snapshot ใน order)
- [ ] `/shipments` (tracking, delivered) + `shipments:*` perm (admin)

## ⬜ Phase 6 — Transactions / Reporting
- [ ] `GET /transactions`, `/transactions/:id` (perm `transactions:read`)
- [ ] event publishing (Kafka) เช่น `order.created`, `payment.completed`

---

## 🔗 Cross-service
- **auth-service**: verify customer/admin JWT (`JWT_ACCESS_SECRET`)
- **product-service**: เช็ค/ตัด stock + ดึงราคา ณ เวลา checkout (อย่าเชื่อราคาจาก client)
- พิจารณา snapshot ราคา/ชื่อสินค้าลง `OrderItem` ตอนสร้าง order (กันราคาสินค้าเปลี่ยนภายหลัง)

## 📌 หนี้ทางเทคนิค
- ย้าย `customerId` ออกจาก path ทั้งหมด (Phase 2) — อย่าปล่อยไว้
- ราคา/ยอดรวมต้องคำนวณฝั่ง server เสมอ (ไม่รับ total จาก client)
