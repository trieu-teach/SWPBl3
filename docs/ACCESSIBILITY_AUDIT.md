# Báo Cáo Kiểm Tra Accessibility (Screen Reader Support)

**Ngày:** Thứ 2, 17/08/2026  
**Dự án:** DocuMind  
**Scope:** Frontend (React/MUI/Ant Design)  
**Trạng thái:** ⚠️ Cần bổ sung

---

## 1. Tổng Quan

Báo cáo này liệt kê các vấn đề accessibility (hỗ trợ trình đọc màn hình) còn thiếu trong codebase FE. Các tiêu chuẩn được tham chiếu:

- [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAIARIA/apg/)
- [MUI Accessibility Guide](https://mui.com/material-ui/experimental-api/useful-values/#usefulless)

---

## 2. Đã Có (Baseline)

### 2.1 ARIA Attributes

| File | Element | Attribute | Mục đích |
|------|---------|-----------|----------|
| `Login.jsx` | IconButton (password toggle) | `aria-label="Hiện/ẩn mật khẩu"` | Toggle visibility |
| `Register.jsx` | IconButton (password toggle) | `aria-label="Hiện/ẩn mật khẩu"` | Toggle visibility |
| `Header.jsx` | IconButton (menu) | `aria-label="Mở menu"` | Navigation |
| `Header.jsx` | IconButton (menu) | `aria-label="Đóng menu"` | Navigation |
| `Header.jsx` | Link | `aria-label="DocuMind"` | Brand |
| `ColorModeToggle.jsx` | IconButton | `aria-label`, `aria-pressed` | Theme toggle |
| `AppShell.jsx` | IconButton (collapse) | `aria-label="Mở rộng/Thu gọn sidebar"` | Navigation |
| `ConversationSidebar.jsx` | IconButton | `aria-label="Tạo chat mới"` | Action |
| `ConversationSidebar.jsx` | IconButton | `aria-label="Đóng sidebar"` | Navigation |
| `ChatHeader.jsx` | IconButton | `aria-label="Mở danh sách hội thoại"` | Navigation |
| `ChatInput.jsx` | InputBase | `aria-label="Nhập câu hỏi cho AI"` | Form input |
| `DocumentPickerDialog.jsx` | IconButton | `aria-label="Đóng"` | Dialog action |
| `DocumentPreviewDialog.jsx` | IconButton | `aria-label="Đóng bản xem trước"` | Dialog action |
| Auth pages | Box (decorative) | `aria-hidden` | Decorative |

### 2.2 Tooltip Usage (Partial Support)

Tooltip được sử dụng rải rác, nhưng chủ yếu là visual hint chứ chưa đầy đủ:

- Sidebar menu items (AppShell.jsx)
- Action buttons trong tables
- Theme toggle
- ModeratorLayout navigation

---

## 3. Còn Thiếu

### 3.1 Dialog/Modal Components ⚠️

Tất cả Dialog và Drawer cần có:
- `aria-modal="true"` - Thông báo đây là modal
- `aria-labelledby="[title-id]"` - Kết nối với title element
- `aria-describedby` (optional) - Mô tả thêm nội dung

#### Danh sách cần fix:

| # | File | Priority |
|---|------|----------|
| 1 | `Admin/AuditLogs/components/AuditLogDetailDrawer.jsx` | Cao |
| 2 | `Admin/AuditLogs/components/AuditLogDetailDialog.jsx` | Cao |
| 3 | `Admin/Users/components/AdminUserDetailDialog.jsx` | Cao |
| 4 | `Admin/Users/components/UserRoleDialog.jsx` | Cao |
| 5 | `Admin/Users/components/UserStatusDialog.jsx` | Cao |
| 6 | `Admin/Documents/components/AdminDocumentDetailDialog.jsx` | Cao |
| 7 | `Admin/Documents/components/ModerationDialog.jsx` | Cao |
| 8 | `Admin/Subscriptions/components/SubscriptionDetailDialog.jsx` | Cao |
| 9 | `Admin/SubscriptionPlans/components/DeactivatePlanDialog.jsx` | Trung |
| 10 | `Admin/SubscriptionPlans/components/SubscriptionPlanFormDialog.jsx` | Trung |
| 11 | `User/DocumentLibrary/components/DocumentPreviewDialog.jsx` | Trung |
| 12 | `User/UploadDocument/components/CreateTaxonomyDialog.jsx` | Trung |
| 13 | `User/AIChat/components/DocumentPickerDialog.jsx` | Thấp |

#### Pattern cần áp dụng:

```jsx
// Trước
<Dialog open={open} onClose={handleClose}>

// Sau
<Dialog 
  open={open} 
  onClose={handleClose}
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <DialogTitle id="dialog-title">Tiêu đề</DialogTitle>
```

---

### 3.2 IconButton Components ⚠️

Icon-only buttons cần có `aria-label` để trình đọc màn hình đọc được hành động.

#### Danh sách cần fix:

| # | File | Actions cần thêm |
|---|------|-----------------|
| 1 | `User/DocumentDetails/components/DocumentActions.jsx` | Download, Share, Save |
| 2 | `User/DocumentLibrary/components/DocumentCard.jsx` | Download, Edit, Delete |
| 3 | `User/SavedDocuments/components/SavedDocumentCard.jsx` | Download, Remove |
| 4 | `User/CommunityLibrary/components/CommunityCard.jsx` | Download, Save, Report |
| 5 | `User/DocumentLibrary/components/DocumentPreviewDialog.jsx` | Zoom, Download, Close |
| 6 | `Admin/Documents/components/AdminDocumentsTable.jsx` | View, Edit, Delete, Moderate |
| 7 | `Admin/Users/components/AdminUsersTable.jsx` | View, Edit Role, Change Status |
| 8 | `Admin/Subscriptions/components/SubscriptionTable.jsx` | View Details |

#### Pattern cần áp dụng:

```jsx
// Trước
<IconButton onClick={handleDownload}>
  <DownloadIcon />
</IconButton>

// Sau
<IconButton 
  onClick={handleDownload}
  aria-label="Tải xuống tài liệu"
>
  <DownloadIcon />
</IconButton>
```

---

### 3.3 Table Components ⚠️

Tables cần semantic HTML và ARIA attributes.

#### Danh sách cần fix:

| # | File | Cần thêm |
|---|------|----------|
| 1 | `Admin/Documents/components/AdminDocumentsTable.jsx` | `scope="col"`, `aria-sort` |
| 2 | `Admin/Users/components/AdminUsersTable.jsx` | `scope="col"`, `aria-sort` |
| 3 | `Admin/Subscriptions/components/SubscriptionTable.jsx` | `scope="col"`, `aria-sort` |
| 4 | `Admin/AuditLogs/components/AuditLogTable.jsx` | `aria-sort` |
| 5 | `Admin/DownloadLogs/components/DownloadLogTable.jsx` | `aria-sort` |

#### Pattern cần áp dụng:

```jsx
// Header cells
<TableCell 
  scope="col"
  aria-sort={column.sortDirection === 'asc' ? 'ascending' : column.sortDirection === 'desc' ? 'descending' : 'none'}
>
  Tên cột
</TableCell>

// Hoặc với sx prop cho styled components
<TableHead>
  <TableRow>
    <TableCell scope="col">#</TableCell>
    <TableCell scope="col">Tên</TableCell>
    <TableCell scope="col" aria-sort="ascending">Ngày tạo ↑</TableCell>
  </TableRow>
</TableHead>
```

---

### 3.4 Navigation Components ⚠️

Sidebar và navigation cần `aria-current` cho active state.

#### Danh sách cần fix:

| # | File | Cần thêm |
|---|------|----------|
| 1 | `components/AppShell/AppShell.jsx` | `aria-current="page"` cho active menu item |
| 2 | `pages/Moderator/Layout/ModeratorLayout.jsx` | `aria-current="page"` |
| 3 | `pages/Admin/Layout/AdminLayout.jsx` | `aria-current="page"` |

#### Pattern cần áp dụng:

```jsx
// Navigation items
<NavLink
  to={item.path}
  aria-current={isActive ? 'page' : undefined}
>
  {item.icon}
  <span>{item.label}</span>
</NavLink>

// Breadcrumbs
<Breadcrumbs aria-label="Điều hướng">
  <Link href="/" aria-current="false">Trang chủ</Link>
  <Typography aria-current="page">Tài liệu</Typography>
</Breadcrumbs>
```

---

### 3.5 Form Components ⚠️

Form inputs cần kết nối label/input và validation attributes.

#### Danh sách cần kiểm tra/fix:

| # | File | Cần thêm |
|---|------|----------|
| 1 | `User/UploadDocument/` | `id` + `htmlFor` |
| 2 | `Admin/SubscriptionPlans/` | `aria-invalid`, `aria-describedby` |
| 3 | Tất cả filter forms | `aria-required` |

#### Pattern cần áp dụng:

```jsx
// Label-Input connection
<FormControl>
  <InputLabel htmlFor="document-title" required>
    Tiêu đề tài liệu
  </InputLabel>
  <Input
    id="document-title"
    aria-describedby="title-helper"
    aria-invalid={!!errors.title}
    required
  />
  <FormHelperText id="title-helper">
    Tối thiểu 5 ký tự
  </FormHelperText>
</FormControl>
```

---

### 3.6 Dynamic Content ⚠️

Notifications, toast messages, loading states cần `aria-live`.

#### Pattern cần áp dụng:

```jsx
// Notifications
<div aria-live="polite" aria-atomic="true">
  {notification && (
    <Alert severity="success">
      {notification}
    </Alert>
  )}
</div>

// Loading states
<table aria-busy={isLoading}>
  ...
</table>

// Search results
<div role="status" aria-live="polite">
  Tìm thấy {count} kết quả
</div>
```

---

### 3.7 Images và Media ⚠️

Images cần alt text mô tả.

#### Danh sách cần kiểm tra:

| # | Loại | Cần thêm |
|---|------|----------|
| 1 | User avatars | `alt="Avatar của [name]"` hoặc `alt=""` nếu decorative |
| 2 | Document thumbnails | `alt="Hình thu nhỏ của [title]"` |
| 3 | Charts/Graphs | `aria-label="Biểu đồ: [mô tả]"`, `role="img"` |
| 4 | Empty states | `aria-label="Không có dữ liệu"` |

---

### 3.8 Utility Components ⚠️

Tạo hoặc sử dụng visually hidden text.

#### Pattern cần áp dụng:

```jsx
// MUI VisuallyHidden
import { VisuallyHidden } from '@mui/utils';

// Sử dụng cho icon-only buttons
<IconButton>
  <SearchIcon />
  <VisuallyHidden>Tìm kiếm</VisuallyHidden>
</IconButton>

// Hoặc tự tạo
const VisuallyHidden = styled('span')({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});
```

---

## 4. Checklist Triển Khai

### Phase 1: Critical (1-2 ngày)

- [ ] AuditLogDetailDrawer.jsx - Dialog
- [ ] AdminUserDetailDialog.jsx - Dialog
- [ ] AdminDocumentDetailDialog.jsx - Dialog
- [ ] SubscriptionDetailDialog.jsx - Dialog
- [ ] ModerationDialog.jsx - Dialog

### Phase 2: High (2-3 ngày)

- [ ] AppShell.jsx - Navigation (aria-current)
- [ ] AdminDocumentsTable.jsx - Table headers
- [ ] AdminUsersTable.jsx - Table headers
- [ ] DocumentActions.jsx - IconButtons
- [ ] All AdminUsersTable IconButtons

### Phase 3: Medium (3-5 ngày)

- [ ] UserRoleDialog.jsx
- [ ] UserStatusDialog.jsx
- [ ] SubscriptionTable.jsx
- [ ] DocumentCard.jsx
- [ ] SavedDocumentCard.jsx
- [ ] CommunityCard.jsx
- [ ] Form validation attributes

### Phase 4: Low (Tuần tiếp theo)

- [ ] CreateTaxonomyDialog.jsx
- [ ] DocumentPickerDialog.jsx
- [ ] SubscriptionPlanFormDialog.jsx
- [ ] Image alt texts
- [ ] Charts accessibility
- [ ] Toast/notification aria-live

---

## 5. Cấu Trúc File Cần Tạo Mới

```
src/
├── components/
│   └── A11y/
│       ├── VisuallyHidden.jsx      # Component ẩn nhưng đọc được
│       ├── A11yProvider.jsx        # Global a11y context
│       └── index.js
├── hooks/
│   └── useA11y.js                  # Hook helper
└── utils/
    └── a11y.js                    # Helper functions
```

---

## 6. Tham Khảo

### MUI A11y Best Practices

```jsx
import { getSession } from 'next-auth/react';

// Buttons
<Button aria-label="Đóng">X</Button>
<Button aria-describedby="tooltip-id">Hover me</Button>

// Dialogs
<Dialog aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <DialogTitle id="dialog-title">Tiêu đề</DialogTitle>
  <DialogContent>
    <DialogContentText id="dialog-desc">Mô tả</DialogContentText>
  </DialogContent>
</Dialog>

// Tables
<table aria-label="Danh sách người dùng">
  <thead>
    <tr>
      <th scope="col">Tên</th>
      <th scope="col" aria-sort="ascending">Email</th>
    </tr>
  </thead>
</table>
```

### Testing Tools

1. **Screen Reader Testing:**
   - NVDA (Windows) - Miễn phí
   - VoiceOver (macOS) - Tích hợp sẵn
   - JAWS (Windows) - Trả phí

2. **Automated Testing:**
   - `axe-core` - Integration với Jest/Cypress
   - Lighthouse - Chrome DevTools

3. **VSCode Extensions:**
   - `eslint-plugin-jsx-a11y`

---

## 7. Notes

- Backend (Go/Java) không ảnh hưởng nhiều đến accessibility vì ARIA là frontend
- API chỉ cần trả về đúng semantic data (status codes, error messages)
- Focus management cho dialogs đã được MUI xử lý mặc định
- Keyboard navigation (Tab, Enter, Escape) đã được MUI components hỗ trợ

---

## 8. Liên hệ

- **Frontend Lead:** @dev-team
- **QA:** @qa-team
- **Deadline:** Sau khi hoàn thành tất cả phases

---

**Document Version:** 1.0  
**Last Updated:** 17/08/2026  
**Status:** Draft - Cần review
