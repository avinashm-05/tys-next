# 01 — Database

Engine: **MySQL** (keep). All 18 migrations reconciled below into the final schema.
⚠️ `Schema::defaultStringLength(191)` (`app/Providers/AppServiceProvider.php:28`) means every `string()` without an explicit length is **varchar(191)**, not 255. Before finalizing `schema.prisma`, run `prisma db pull` against the production DB — it is the source of truth (see risk R6).

## Final reconciled schema

### Framework tables (keep in DB; mostly replaced by new infra)

| Table | Columns | Fate in new stack |
|---|---|---|
| `sessions` | id varchar(191) PK, user_id nullable idx, ip_address varchar(45), user_agent text, payload longtext, last_activity int idx | Dropped after JWT cutover |
| `password_reset_tokens` | email varchar(191) PK, token, created_at | Keep concept; new token table or reuse |
| `cache`, `cache_locks` | key varchar(191) PK, value mediumtext, expiration int | Replaced by Redis |
| `jobs`, `job_batches`, `failed_jobs` | standard Laravel queue tables | Replaced by BullMQ (Redis) |

### Domain tables

**users** — `0001_01_01_000000` + `2025_11_27` (user_type FK)
- id BIGINT UN AI PK; user_type_id BIGINT UN NULL FK→user_types **ON DELETE SET NULL**; name vc(191); email vc(191) **UNIQUE**; email_verified_at TIMESTAMP NULL; password vc(191) *(bcrypt)*; remember_token vc(100) NULL; created_at/updated_at TIMESTAMP NULL

**user_types** — `2025_11_27_091635`
- id; name vc(191); slug vc(191) **UNIQUE**; timestamps
- Seeded slugs: `super-admin`, `admin`, `user` (`UserTypeSeeder`) — ⚠️ code also references `staff` (`UserType::STAFF`, `LoginController@redirectPath`) which is **never seeded**.

**quotes** — `2025_12_07_121916` + altered by `2026_02_21_120000`
- id; from_country vc(50); from_zip vc(191); to_country vc(50); to_zip vc(191); is_residence TINYINT(1) DEFAULT 0;
- **package_type**: created as `enum('envelope','boxes','television','furniture','auto')`, then **ALTERed to `VARCHAR(255) NOT NULL`** storing a **CSV of selected types** (`2026_02_21_120000:26`, e.g. `"box,television"`). Queried with MySQL `FIND_IN_SET` (`app/DataTables/QuotesDataTable.php:92-96`).
- name vc(191) NULL; email vc(191) NULL; mobile_number vc(191) NULL *(denormalized copies of contact — also stored in quote_contacts)*;
- box_data **JSON** NULL; television_data **JSON** NULL; auto_data **JSON** NULL *(raw submitted detail arrays)*;
- status `enum('pending','quoted','accepted','cancelled')` DEFAULT 'pending';
- total_chargeable_weight DECIMAL(10,2) NULL; estimated_cost DECIMAL(10,2) NULL; currency vc(3) NULL; timestamps
- Indexes: `status`, `idx_c_pair(from_country,to_country)`, `created_at`

**packages** — `2025_12_07_122103` — ⚠️ **ORPHANED TABLE**
- quote_id FK→quotes CASCADE; quantity int DEFAULT 1; weight DECIMAL(10,2); weight_unit enum('lb','kg'); length/width/height DECIMAL(10,2) NULL; chargeable_weight DECIMAL(10,2); brand_name NULL; tv_model NULL; timestamps; idx quote_id
- The `Package` model was re-pointed to `package_details` (`app/Models/Package.php:19`). Nothing writes to `packages` anymore. **Decision needed**: check prod for legacy rows; exclude from Prisma or map read-only.

**package_details** — `2026_02_21_120100` (the live "packages" table; model `Package`)
- id; quote_id FK→quotes CASCADE; package_type vc(50) *(single type per row: 'box'|'television'|'auto')*; quantity int DEFAULT 1; weight DECIMAL(10,2) NULL; weight_unit enum('lb','kg') NULL; length/width/height DECIMAL(10,2) NULL; chargeable_weight DECIMAL(10,2) NULL; brand_name vc(191) NULL; tv_model vc(191) NULL; car_model vc(191) NULL; **car_year vc(10) NULL** *(⚠️ model casts it `integer` — `Package.php:58`)*; timestamps
- idx: quote_id, package_type

**quote_contacts** — `2025_12_07_123041`
- id; quote_id FK→quotes CASCADE; name; email; country_code; phone; timestamps; idx quote_id
- Relationship is `hasOne` from Quote (`Quote.php:96-99`) though schema would allow many.

**quote_email_statistics** — `2025_12_08_171312`
- id; quote_id FK→quotes CASCADE **UNIQUE**; tracking_token vc(64) **UNIQUE** (+redundant idx); email_opened_at TIMESTAMP NULL *(first open)*; last_opened_at TIMESTAMP NULL; open_count int DEFAULT 0; timestamps

**services** — `2025_12_20_070146`
- id; name vc(191); system_name vc(191) **UNIQUE**; status `enum('active','deactive')` DEFAULT 'active' *(note the nonstandard word "deactive")*; timestamps; idx status, system_name

**vendor_types** — `2025_12_26_055927`
- id; name vc(191) **UNIQUE**; description TEXT NULL; status `enum('active','inactive')` DEFAULT 'active'; timestamps; idx status, name

**vendors** — `2025_12_26_090317` + `2026_01_21_054128` (geo columns)
- id; name vc(191); vendor_type_id FK→vendor_types **RESTRICT**; email vc(191) **UNIQUE**; phone_number vc(20); country_code vc(5); website vc(255) NULL; ein_number vc(20) NULL **UNIQUE**; ssn_number vc(20) NULL **UNIQUE** *(PII! plaintext — see R-sec)*; address_line_1 vc(255); address_line_2/3 vc(255) NULL; city vc(100); state vc(100); country vc(100); postal_code vc(20); **latitude DECIMAL(10,7) NULL; longitude DECIMAL(10,7) NULL; geocoded_at TIMESTAMP NULL**; status `enum('active','inactive')` DEFAULT 'active'; added_by FK→users **RESTRICT**; timestamps
- idx: status, vendor_type_id, country, added_by, email, name, `idx_vendors_coordinates(lat,lng)`, `idx_vendors_map_filters(status,vendor_type_id,lat,lng)`

**vendor_contacts** — `2025_12_26_101558`
- id; vendor_id FK→vendors CASCADE; name vc(255); title vc(255) NULL; city vc(100) NULL; state vc(100) NULL; email vc(191); work_phone vc(20) NULL; cell_phone vc(20) NULL; status `enum('active','inactive')` DEFAULT 'active'; created_by FK→users SET NULL; updated_by FK→users SET NULL; timestamps; **deleted_at (soft deletes)**
- **UNIQUE(vendor_id, email)** `unique_vendor_email` — ⚠️ includes soft-deleted rows: re-adding a deleted contact's email throws a DB error the app does not specially handle (risk R7).

**vendor_services** (pivot with extra columns) — `2025_12_26_161329`
- id; vendor_id FK→vendors CASCADE; service_id FK→services CASCADE; **assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP; assigned_by FK→users RESTRICT**; timestamps
- **UNIQUE(vendor_id, service_id)**; idx on all FKs + assigned_at
- Eloquent: `belongsToMany(...)->withPivot(['assigned_at','assigned_by'])->withTimestamps()->using(VendorService::class)` (`Vendor.php:115-121`, `Service.php:56-62`)

**vendor_comments** — `2025_12_27_081851`
- id; vendor_id FK→vendors CASCADE; title vc(191); content TEXT; category `enum('general','performance','issues','compliance','communication')` DEFAULT 'general'; priority `enum('low','normal','high','critical')` DEFAULT 'normal'; created_by/updated_by FK→users SET NULL; timestamps; **deleted_at (soft deletes)**; idx vendor_id, category, priority, created_at

**settings** — `2026_07_04_000000`
- id; key vc(191) **UNIQUE**; value TEXT NULL; timestamps
- Only key in use: `fedex_markup_percentage` (`SettingController`, `FedExRateQuoteService.php:296-302`)

## Eloquent model inventory (all implicit behavior)

| Model | Table | fillable | casts | Relationships | Scopes / hooks / extras |
|---|---|---|---|---|---|
| `User` | users | name, email, password, user_type_id | email_verified_at:datetime; **password:'hashed' (bcrypt)** | belongsTo UserType | `$hidden=[password,remember_token]`; `isAdmin()` = userType.slug ∈ {super-admin, admin} (`User.php:62-68`). Does **not** implement MustVerifyEmail |
| `UserType` | user_types | name, slug | — | hasMany User | consts SUPER_ADMIN/ADMIN/STAFF/USER |
| `Quote` | quotes | 16 cols (`Quote.php:20-37`) | is_residence:boolean; status:**QuoteStatus enum**; box/television/auto_data:**array(JSON)**; total_chargeable_weight & estimated_cost:**decimal:2 → string in JSON** | hasMany Package; hasOne QuoteContact (`contact`); hasOne QuoteEmailStatistic | `packageTypes()` splits CSV; `primaryPackageType()` (`Quote.php:62-79`) |
| `Package` | **package_details** | 13 cols | quantity/quote_id:int; weight/l/w/h/chargeable_weight:**decimal:2**; weight_unit:**WeightUnit enum**; **car_year:int (col is varchar!)** | belongsTo Quote | explicit `$table='package_details'` |
| `QuoteContact` | quote_contacts | 5 cols | quote_id:int | belongsTo Quote | — |
| `QuoteEmailStatistic` | quote_email_statistics | 5 cols | dates:datetime; open_count:int | belongsTo Quote | `markAsOpened()` — preserves first open, bumps last+count (`QuoteEmailStatistic.php:55-69`) |
| `Service` | services | name, system_name, status | status:**ServiceStatus enum** | belongsToMany Vendor (pivot VendorService) + `activeVendors()` | **`creating` hook: auto-slug `system_name` from name via `Str::slug` when empty** (`Service.php:42-49`); `isAssignedToVendor()` |
| `VendorType` | vendor_types | name, description, status | status:**VendorTypeStatus enum** | hasMany Vendor | — |
| `Vendor` | vendors | 19 cols | status:**VendorStatus enum**; lat/lng:**float**; geocoded_at:datetime | belongsTo VendorType, addedBy(User); hasMany contacts (+active/inactive via contact scopes), comments (**ordered created_at desc** — `Vendor.php:167`), criticalComments, recentComments(30d); belongsToMany services (+activeServices) | **accessor `full_address`** (joins 7 addr fields, `Vendor.php:193-204`); `hasCoordinates()`, `needsGeocoding()`; **`scopeWithinBounds`** (lng-wraparound aware) & **`scopeWithinRadius`** (raw-SQL Haversine `selectRaw ... HAVING distance <=`, `Vendor.php:262-280`); `assignService/unassignService`; **VendorObserver attached** (`AppServiceProvider.php:35`) |
| `VendorContact` | vendor_contacts | 11 cols | status:**VendorContactStatus enum**; 3 datetimes | belongsTo Vendor, createdBy, updatedBy | **SoftDeletes**; `$attributes=['status'=>'active']` default; `scopeActive/scopeInactive`; `toggleStatus()` |
| `VendorComment` | vendor_comments | 7 cols | category/priority:**enums**; 3 datetimes | belongsTo Vendor, createdBy, updatedBy | **SoftDeletes** |
| `VendorService` | vendor_services | 4 cols | assigned_at:datetime | belongsTo Vendor, Service, assignedBy(User) | **extends Pivot** |
| `Setting` | settings | key, value | — | — | static `get(key, default)` / `set(key, value)` (updateOrCreate) |

**Observers/model events (must be replicated explicitly in Node):**
- `VendorObserver` (`app/Observers/VendorObserver.php`): on **created** → geocode `full_address`; on **updated** → geocode only if any of 7 address fields `wasChanged()`; writes lat/lng/geocoded_at via **`updateQuietly`** (no re-trigger); failures logged, never fail the request.
- `Service` `creating` → auto `system_name = slug(name)`.
- No global scopes are defined anywhere. Soft deletes on VendorContact/VendorComment act as implicit global scopes (all queries exclude trashed; route binding 404s trashed rows).

**Flags requested:**
- Polymorphic relations: **none**.
- Pivot with extra columns: **vendor_services** (assigned_at, assigned_by, timestamps).
- JSON columns: **quotes.box_data / television_data / auto_data**.
- Enum casts: 9 backed enums (values listed in schema above; labels/colors for comment category/priority and contact status live in the PHP enums — port to TS unions + maps).
- Soft deletes: **vendor_contacts, vendor_comments**.

## Draft `schema.prisma`

> Draft only — run `prisma db pull` on production first and reconcile (R6). Column widths assume the 191 default. Money/weight kept as `Decimal` to avoid float drift; note Laravel serializes `decimal:2` casts as **strings** in JSON — match that in API responses (R3).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id              BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  userTypeId      BigInt?   @map("user_type_id") @db.UnsignedBigInt
  name            String    @db.VarChar(191)
  email           String    @unique @db.VarChar(191)
  emailVerifiedAt DateTime? @map("email_verified_at")
  password        String    @db.VarChar(191) // bcrypt — keep verifying with bcrypt
  rememberToken   String?   @map("remember_token") @db.VarChar(100)
  createdAt       DateTime? @map("created_at")
  updatedAt       DateTime? @map("updated_at")

  userType        UserType?       @relation(fields: [userTypeId], references: [id], onDelete: SetNull)
  vendorsAdded    Vendor[]        @relation("VendorAddedBy")
  contactsCreated VendorContact[] @relation("ContactCreatedBy")
  contactsUpdated VendorContact[] @relation("ContactUpdatedBy")
  commentsCreated VendorComment[] @relation("CommentCreatedBy")
  commentsUpdated VendorComment[] @relation("CommentUpdatedBy")
  serviceAssigns  VendorService[] @relation("AssignedBy")

  @@map("users")
}

model UserType {
  id        BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  name      String    @db.VarChar(191)
  slug      String    @unique @db.VarChar(191) // 'super-admin' | 'admin' | 'staff' | 'user'
  createdAt DateTime? @map("created_at")
  updatedAt DateTime? @map("updated_at")
  users     User[]

  @@map("user_types")
}

enum QuoteStatus {
  pending
  quoted
  accepted
  cancelled
}

model Quote {
  id                    BigInt      @id @default(autoincrement()) @db.UnsignedBigInt
  fromCountry           String      @map("from_country") @db.VarChar(50)
  fromZip               String      @map("from_zip") @db.VarChar(191)
  toCountry             String      @map("to_country") @db.VarChar(50)
  toZip                 String      @map("to_zip") @db.VarChar(191)
  isResidence           Boolean     @default(false) @map("is_residence")
  packageType           String      @map("package_type") @db.VarChar(255) // CSV: "box,television" — queried with FIND_IN_SET
  name                  String?     @db.VarChar(191)
  email                 String?     @db.VarChar(191)
  mobileNumber          String?     @map("mobile_number") @db.VarChar(191)
  boxData               Json?       @map("box_data")
  televisionData        Json?       @map("television_data")
  autoData              Json?       @map("auto_data")
  status                QuoteStatus @default(pending)
  totalChargeableWeight Decimal?    @map("total_chargeable_weight") @db.Decimal(10, 2)
  estimatedCost         Decimal?    @map("estimated_cost") @db.Decimal(10, 2)
  currency              String?     @db.VarChar(3)
  createdAt             DateTime?   @map("created_at")
  updatedAt             DateTime?   @map("updated_at")

  packages       PackageDetail[]
  contact        QuoteContact?        // Laravel treats as hasOne
  emailStatistic QuoteEmailStatistic?

  @@index([status])
  @@index([fromCountry, toCountry], map: "idx_c_pair")
  @@index([createdAt])
  @@map("quotes")
}

enum WeightUnit {
  lb
  kg
}

model PackageDetail {
  id               BigInt      @id @default(autoincrement()) @db.UnsignedBigInt
  quoteId          BigInt      @map("quote_id") @db.UnsignedBigInt
  packageType      String      @map("package_type") @db.VarChar(50) // 'box' | 'television' | 'auto'
  quantity         Int         @default(1)
  weight           Decimal?    @db.Decimal(10, 2)
  weightUnit       WeightUnit? @map("weight_unit")
  length           Decimal?    @db.Decimal(10, 2)
  width            Decimal?    @db.Decimal(10, 2)
  height           Decimal?    @db.Decimal(10, 2)
  chargeableWeight Decimal?    @map("chargeable_weight") @db.Decimal(10, 2)
  brandName        String?     @map("brand_name") @db.VarChar(191)
  tvModel          String?     @map("tv_model") @db.VarChar(191)
  carModel         String?     @map("car_model") @db.VarChar(191)
  carYear          String?     @map("car_year") @db.VarChar(10) // stored as string; PHP cast lied
  createdAt        DateTime?   @map("created_at")
  updatedAt        DateTime?   @map("updated_at")

  quote Quote @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  @@index([quoteId])
  @@index([packageType])
  @@map("package_details")
}

model QuoteContact {
  id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  quoteId     BigInt    @unique @map("quote_id") @db.UnsignedBigInt // unique in Prisma to model hasOne; DB only has index — verify
  name        String    @db.VarChar(191)
  email       String    @db.VarChar(191)
  countryCode String    @map("country_code") @db.VarChar(191)
  phone       String    @db.VarChar(191)
  createdAt   DateTime? @map("created_at")
  updatedAt   DateTime? @map("updated_at")

  quote Quote @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  @@map("quote_contacts")
}

model QuoteEmailStatistic {
  id            BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  quoteId       BigInt    @unique @map("quote_id") @db.UnsignedBigInt
  trackingToken String    @unique @map("tracking_token") @db.VarChar(64)
  emailOpenedAt DateTime? @map("email_opened_at")
  lastOpenedAt  DateTime? @map("last_opened_at")
  openCount     Int       @default(0) @map("open_count")
  createdAt     DateTime? @map("created_at")
  updatedAt     DateTime? @map("updated_at")

  quote Quote @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  @@index([trackingToken])
  @@map("quote_email_statistics")
}

enum ServiceStatus {
  active
  deactive // sic — keep the existing value, data depends on it
}

model Service {
  id         BigInt        @id @default(autoincrement()) @db.UnsignedBigInt
  name       String        @db.VarChar(191)
  systemName String        @unique @map("system_name") @db.VarChar(191) // auto-slugged from name when blank
  status     ServiceStatus @default(active)
  createdAt  DateTime?     @map("created_at")
  updatedAt  DateTime?     @map("updated_at")

  vendorServices VendorService[]

  @@index([status])
  @@map("services")
}

enum ActiveInactive {
  active
  inactive
}

model VendorType {
  id          BigInt         @id @default(autoincrement()) @db.UnsignedBigInt
  name        String         @unique @db.VarChar(191)
  description String?        @db.Text
  status      ActiveInactive @default(active)
  createdAt   DateTime?      @map("created_at")
  updatedAt   DateTime?      @map("updated_at")

  vendors Vendor[]

  @@index([status], map: "idx_vendor_types_status")
  @@map("vendor_types")
}

model Vendor {
  id           BigInt         @id @default(autoincrement()) @db.UnsignedBigInt
  name         String         @db.VarChar(191)
  vendorTypeId BigInt         @map("vendor_type_id") @db.UnsignedBigInt
  email        String         @unique @db.VarChar(191)
  phoneNumber  String         @map("phone_number") @db.VarChar(20)
  countryCode  String         @map("country_code") @db.VarChar(5)
  website      String?        @db.VarChar(255)
  einNumber    String?        @unique @map("ein_number") @db.VarChar(20)
  ssnNumber    String?        @unique @map("ssn_number") @db.VarChar(20) // PII — plaintext today, see risks
  addressLine1 String         @map("address_line_1") @db.VarChar(255)
  addressLine2 String?        @map("address_line_2") @db.VarChar(255)
  addressLine3 String?        @map("address_line_3") @db.VarChar(255)
  city         String         @db.VarChar(100)
  state        String         @db.VarChar(100)
  country      String         @db.VarChar(100)
  postalCode   String         @map("postal_code") @db.VarChar(20)
  latitude     Decimal?       @db.Decimal(10, 7)
  longitude    Decimal?       @db.Decimal(10, 7)
  geocodedAt   DateTime?      @map("geocoded_at")
  status       ActiveInactive @default(active)
  addedById    BigInt         @map("added_by") @db.UnsignedBigInt
  createdAt    DateTime?      @map("created_at")
  updatedAt    DateTime?      @map("updated_at")

  vendorType     VendorType      @relation(fields: [vendorTypeId], references: [id], onDelete: Restrict)
  addedBy        User            @relation("VendorAddedBy", fields: [addedById], references: [id], onDelete: Restrict)
  contacts       VendorContact[]
  comments       VendorComment[]
  vendorServices VendorService[]

  @@index([status])
  @@index([vendorTypeId])
  @@index([country])
  @@index([name])
  @@index([latitude, longitude], map: "idx_vendors_coordinates")
  @@index([status, vendorTypeId, latitude, longitude], map: "idx_vendors_map_filters")
  @@map("vendors")
}

model VendorContact {
  id          BigInt         @id @default(autoincrement()) @db.UnsignedBigInt
  vendorId    BigInt         @map("vendor_id") @db.UnsignedBigInt
  name        String         @db.VarChar(255)
  title       String?        @db.VarChar(255)
  city        String?        @db.VarChar(100)
  state       String?        @db.VarChar(100)
  email       String         @db.VarChar(191)
  workPhone   String?        @map("work_phone") @db.VarChar(20)
  cellPhone   String?        @map("cell_phone") @db.VarChar(20)
  status      ActiveInactive @default(active)
  createdById BigInt?        @map("created_by") @db.UnsignedBigInt
  updatedById BigInt?        @map("updated_by") @db.UnsignedBigInt
  createdAt   DateTime?      @map("created_at")
  updatedAt   DateTime?      @map("updated_at")
  deletedAt   DateTime?      @map("deleted_at") // soft delete — EVERY query must filter deletedAt: null

  vendor    Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  createdBy User?  @relation("ContactCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  updatedBy User?  @relation("ContactUpdatedBy", fields: [updatedById], references: [id], onDelete: SetNull)

  @@unique([vendorId, email], map: "unique_vendor_email") // includes soft-deleted rows!
  @@index([vendorId])
  @@index([status])
  @@map("vendor_contacts")
}

model VendorService {
  id         BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  vendorId   BigInt    @map("vendor_id") @db.UnsignedBigInt
  serviceId  BigInt    @map("service_id") @db.UnsignedBigInt
  assignedAt DateTime  @default(now()) @map("assigned_at")
  assignedBy BigInt    @map("assigned_by") @db.UnsignedBigInt
  createdAt  DateTime? @map("created_at")
  updatedAt  DateTime? @map("updated_at")

  vendor       Vendor  @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  service      Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  assignedUser User    @relation("AssignedBy", fields: [assignedBy], references: [id], onDelete: Restrict)

  @@unique([vendorId, serviceId], map: "unique_vendor_service")
  @@index([assignedAt])
  @@map("vendor_services")
}

enum VendorCommentCategory {
  general
  performance
  issues
  compliance
  communication
}

enum VendorCommentPriority {
  low
  normal
  high
  critical
}

model VendorComment {
  id          BigInt                @id @default(autoincrement()) @db.UnsignedBigInt
  vendorId    BigInt                @map("vendor_id") @db.UnsignedBigInt
  title       String                @db.VarChar(191)
  content     String                @db.Text
  category    VendorCommentCategory @default(general)
  priority    VendorCommentPriority @default(normal)
  createdById BigInt?               @map("created_by") @db.UnsignedBigInt
  updatedById BigInt?               @map("updated_by") @db.UnsignedBigInt
  createdAt   DateTime?             @map("created_at")
  updatedAt   DateTime?             @map("updated_at")
  deletedAt   DateTime?             @map("deleted_at") // soft delete

  vendor    Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  createdBy User?  @relation("CommentCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  updatedBy User?  @relation("CommentUpdatedBy", fields: [updatedById], references: [id], onDelete: SetNull)

  @@index([vendorId])
  @@index([category])
  @@index([priority])
  @@index([createdAt])
  @@map("vendor_comments")
}

model Setting {
  id        BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  key       String    @unique @db.VarChar(191)
  value     String?   @db.Text
  createdAt DateTime? @map("created_at")
  updatedAt DateTime? @map("updated_at")

  @@map("settings")
}
```

### Prisma gaps to solve in code (no schema equivalent)

1. **Soft deletes** — Prisma middleware/extension adding `deletedAt: null` to VendorContact/VendorComment queries + converting `delete` → `update`.
2. **Haversine radius query** (`Vendor.php:262-280`) and `FIND_IN_SET` package_type filters — `prisma.$queryRaw`.
3. **`decimal:2` string serialization** — API layer must `.toFixed(2)` Decimal fields to match current JSON contract.
4. **`hasOne` contact** — DB has no unique on `quote_contacts.quote_id`; Prisma draft adds `@unique` to model the relation. Verify prod has no duplicate rows before adding, else keep 1-N and take first.
5. **Timestamps** — Laravel manages created_at/updated_at in the app. Either let Prisma `@default(now()) @updatedAt` (note: migration-safe since columns exist) or set explicitly.
6. **`quotes.package_type` legacy enum values** — pre-Feb-2026 rows may contain single legacy values (`envelope`, `boxes`, …); the CSV normalizer maps `boxes→box`, `envelop→envelope`, `tv→television` at read time (`Quote/FedEx services`) — keep that normalization.
