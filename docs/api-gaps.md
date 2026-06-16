# API gaps from OpenAPI alignment

Source spec: `NFC Loyalty & Customer Growth Platform API.openapi.json`, version `1.0.0`.

## Frontend needs but OpenAPI does not expose

1. `GET /api/tenant`
   - Current frontend usage: member landing page needs public tenant branding, location, and social links.
   - OpenAPI status: not defined.
   - Suggested API: `GET /api/tenants/{tenantId}` or `GET /api/tenant?tenantId=...`.
   - Needed response fields: `id`, `businessName`, `description`, `logoUrl`, `bannerUrl`, `locationMapUrl`, `socialLinks`.

2. `GET /api/vouchers/active`
   - Current frontend usage: member landing page wants public active promotions.
   - OpenAPI status: not defined.
   - Suggested API: `GET /api/vouchers/active?tenantId=...`.
   - Needed response fields: voucher code, discount type/value, expiry date, remaining usage, and active status.

3. Public tenant discovery by slug
   - Current model has `Tenant.slug`, but OpenAPI only documents tenant access indirectly through UUID `tenantId`.
   - Suggested API: `GET /api/tenants/slug/{slug}`.
   - Why it matters: shareable business links are easier and safer with slugs than UUIDs.

4. Category management beyond create
   - OpenAPI provides `POST /api/admin/menu/categories`, but not list/update/delete category admin endpoints.
   - Frontend currently lists categories through public `GET /api/menu/categories?tenantId=...`.
   - Suggested APIs:
     - `GET /api/admin/menu/categories`
     - `PATCH /api/admin/menu/categories/{id}`
     - `DELETE /api/admin/menu/categories/{id}`

5. Reward deletion/deactivation endpoint
   - OpenAPI provides create/update reward and member redeem, but no delete endpoint.
   - Frontend can toggle `isActive` through `PATCH /api/admin/rewards/{id}`.
   - Suggested API if hard delete is required: `DELETE /api/admin/rewards/{id}`.

6. Voucher update endpoint
   - OpenAPI provides create/list/deactivate only.
   - Suggested API if admins need edits after creation: `PATCH /api/admin/vouchers/{id}`.

## Notes from implementation

1. Branding updates now use `PATCH /api/admin/settings/branding` with `multipart/form-data`, matching OpenAPI.
2. Menu item image upload still uses `POST /api/upload/image`, matching OpenAPI.
3. Admin layout now uses `GET /api/health` for the API status indicator.
4. Member login now uses `POST /api/auth/login` through `/member-login`.
5. The member landing page still cannot be made fully OpenAPI-compliant until public tenant and active voucher endpoints are added or the landing data source is redesigned.
