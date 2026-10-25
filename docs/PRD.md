# PRD — Lingo Deutsch

> Phiên bản: 1.0
> Trạng thái: Sẵn sàng triển khai MVP
> Đối tượng sử dụng ban đầu: Một người học tiếng Đức từ Việt Nam
> Mục tiêu dài hạn: Hỗ trợ hành trình học, thi chứng chỉ, học tập và làm việc tại Đức
> Stitch project: `13171068280736042527`
> Tài liệu giao diện: `DESIGN.md`

## 1. Tóm tắt sản phẩm

Lingo Deutsch là ứng dụng học tiếng Đức cá nhân, tập trung vào việc học có lộ trình và ghi nhớ từ vựng lâu dài. Phiên bản MVP phải giúp người học thực hiện trọn vẹn một vòng lặp:

1. Mở bài học A1.
2. Gặp hoặc tự thêm một từ tiếng Đức.
3. Lưu từ vào kho từ cá nhân.
4. Nhận danh sách từ đến hạn.
5. Ôn từng từ bằng lặp lại ngắt quãng.
6. Ghi lại kết quả và tính thời điểm ôn tiếp theo.
7. Xem tiến độ thực tế trên trang Hôm nay.

Sản phẩm không phải sàn khóa học, mạng xã hội, lớp học trực tuyến hay nền tảng bán nội dung. MVP ưu tiên chất lượng của vòng lặp học cá nhân hơn số lượng tính năng.

## 2. Vấn đề cần giải quyết

Người học tiếng Đức thường phải sử dụng nhiều công cụ tách rời:

- Một nơi để đọc bài học.
- Một ứng dụng khác để ghi từ.
- Một công cụ khác để ôn flashcard.
- Ghi chú riêng cho mạo từ, số nhiều và cách dùng.
- Không có mối liên hệ rõ giữa từ đã học, bài học nguồn và lịch ôn.

Lingo Deutsch giải quyết vấn đề này bằng cách nối bài học, kho từ và lịch ôn thành một luồng thống nhất. Với danh từ tiếng Đức, hệ thống luôn ưu tiên học cả mạo từ và dạng số nhiều thay vì chỉ lưu từ đơn lẻ.

## 3. Mục tiêu sản phẩm

### 3.1 Mục tiêu MVP

- Cho phép người dùng quản lý một kho từ vựng cá nhân.
- Cho phép thêm, sửa, xóa mềm và tìm kiếm từ.
- Hiển thị chính xác các từ đến hạn trong ngày.
- Cung cấp phiên ôn tập với bốn lựa chọn `Lại`, `Khó`, `Tốt`, `Dễ`.
- Cập nhật lịch ôn tiếp theo bằng thuật toán xác định, có thể kiểm thử.
- Cung cấp một lộ trình A1 tối thiểu để từ vựng có nguồn bài học rõ ràng.
- Hiển thị hoạt động học gần đây và tiến độ cơ bản.
- Hoạt động tốt ở cả giao diện sáng và tối.
- Có trải nghiệm desktop hoàn chỉnh và responsive trên mobile.

### 3.2 Chỉ số thành công ban đầu

MVP được xem là hữu ích khi người dùng có thể:

- Thêm một từ mới trong tối đa 60 giây.
- Bắt đầu phiên ôn trong tối đa hai thao tác từ trang Hôm nay.
- Hoàn thành một phiên 10–20 từ mà không bị mất tiến độ khi tải lại trang.
- Tìm lại từ bằng tiếng Đức hoặc nghĩa tiếng Việt.
- Nhìn thấy từ nào đến hạn, vì sao đến hạn và ngày ôn tiếp theo.
- Dùng ứng dụng liên tục trong 14 ngày mà không phát sinh dữ liệu trùng hoặc sai lịch ôn.

Không sử dụng các chỉ số giả như “thành thạo 99%”. Chỉ hiển thị số liệu có thể truy ngược về dữ liệu học thực tế.

## 4. Người dùng mục tiêu

### Persona chính

Người Việt đang học tiếng Đức ở mức A1–A2, có kế hoạch học tập hoặc làm việc tại Đức, học chủ yếu vào buổi tối và cần:

- Lộ trình rõ ràng.
- Giải thích ngắn bằng tiếng Việt.
- Từ vựng có mạo từ, số nhiều và câu ví dụ.
- Công cụ ôn tập không gây xao nhãng.
- Nội dung liên quan đến đời sống, học tập và công việc tại Đức.

### Nhu cầu quan trọng

- Biết hôm nay nên học gì.
- Không quên những từ đã học.
- Không phải nhập lại quá nhiều thông tin.
- Hiểu cách dùng từ trong câu thật.
- Theo dõi được tiến bộ mà không bị gamification quá mức.

## 5. Nguyên tắc sản phẩm

1. **Học cá nhân trước:** không có marketplace, lớp học, bảng xếp hạng hoặc cộng đồng trong MVP.
2. **Tiếng Đức chính xác:** danh từ phải có mạo từ; số nhiều được lưu khi tồn tại; giữ đúng umlaut và `ß`.
3. **Ôn đúng lúc:** lịch ôn được tính từ lịch sử trả lời, không chọn ngẫu nhiên.
4. **Ít ma sát:** người dùng có thể thêm từ thủ công, từ bài học hoặc nhập nhiều từ.
5. **Có thể giải thích:** người dùng xem được lần ôn trước và lý do từ đang đến hạn.
6. **Không gây xao nhãng:** không xu thưởng, cửa hàng, quảng cáo, confetti hoặc thông báo thúc ép.
7. **Riêng tư:** dữ liệu học thuộc về tài khoản người dùng và không công khai mặc định.

## 6. Phạm vi MVP

### 6.1 Bao gồm

- Đăng nhập một tài khoản cá nhân.
- Trang Hôm nay.
- Lộ trình học A1 tối thiểu.
- Kho từ vựng có dữ liệu thật.
- Bộ từ cá nhân và bộ từ theo bài học.
- Thêm, sửa và xóa mềm từ.
- Nhập nhiều từ bằng biểu mẫu có bước xem trước.
- Tìm kiếm và lọc từ.
- Hàng đợi từ đến hạn.
- Phiên ôn từ vựng bằng SRS.
- Lịch sử ôn tập.
- Thống kê cơ bản, có nguồn dữ liệu rõ ràng.
- Chế độ sáng/tối và lưu lựa chọn giao diện.
- Responsive desktop/mobile.

### 6.2 Không bao gồm trong MVP

- Thanh toán hoặc gói Pro.
- Marketplace khóa học.
- Lớp học, giáo viên hoặc quản trị học viên.
- Cộng đồng, bình luận hoặc chia sẻ bộ từ công khai.
- Bảng xếp hạng, coin, XP hoặc cửa hàng.
- AI tạo bài học tự động.
- Nhận dạng giọng nói và chấm phát âm nâng cao.
- Thi thử Goethe/telc hoàn chỉnh.
- Quy trình visa hoặc tư vấn pháp lý.
- Ứng dụng native iOS/Android.
- Đồng bộ ngoại tuyến đầy đủ.

## 7. Kiến trúc thông tin

Điều hướng chính có đúng năm mục:

1. **Hôm nay** — bài học tiếp theo, từ đến hạn, mục tiêu tuần và hoạt động gần đây.
2. **Học** — lộ trình CEFR, bắt đầu từ A1.
3. **Từ vựng** — `Đến hạn`, `Kho từ`, `Bộ từ`.
4. **Luyện tập** — điểm vào cho bài tập nghe, hội thoại và tình huống; MVP chỉ cần khung và một bài mẫu.
5. **Tiến độ** — số buổi học, từ đã ôn, độ chính xác và hoạt động gần đây.

Công cụ phụ gồm Từ điển, Chia động từ và Tra Artikel. Chúng không phải mục điều hướng chính trong MVP.

## 8. Luồng người dùng chính

### 8.1 Thêm từ thủ công

1. Người dùng mở `Từ vựng → Kho từ`.
2. Chọn `Thêm từ`.
3. Nhập từ tiếng Đức và nghĩa tiếng Việt.
4. Nếu là danh từ, biểu mẫu yêu cầu mạo từ và cho phép nhập số nhiều.
5. Người dùng thêm loại từ, CEFR, câu ví dụ và bộ từ nếu cần.
6. Hệ thống kiểm tra dữ liệu trùng trong tài khoản.
7. Người dùng lưu từ.
8. Từ được tạo ở trạng thái `new` và xuất hiện trong hàng đợi học mới.

### 8.2 Lưu từ từ bài học

1. Người dùng mở bài học A1.
2. Chọn một từ trong nội dung.
3. Xem popover có nghĩa, mạo từ, số nhiều và ví dụ.
4. Chọn `Lưu vào kho từ`.
5. Hệ thống lưu `sourceLessonId` và thêm từ vào bộ của bài học.
6. Nếu từ đã tồn tại, hệ thống không tạo bản trùng mà liên kết thêm nguồn hoặc bộ từ.

### 8.3 Ôn từ đến hạn

1. Trang Hôm nay hiển thị số từ đến hạn.
2. Người dùng chọn `Ôn n từ`.
3. Hệ thống tạo phiên ôn gồm các từ đến hạn tại thời điểm bắt đầu.
4. Mỗi lượt hiển thị mặt câu hỏi trước.
5. Người dùng chọn `Hiện đáp án` hoặc dùng phím tắt.
6. Hệ thống hiển thị nghĩa, ví dụ, ghi chú và các lựa chọn `Lại`, `Khó`, `Tốt`, `Dễ`.
7. Sau khi chọn, hệ thống ghi lịch sử và cập nhật `dueAt` trong cùng một thao tác logic.
8. Tiến độ phiên được lưu sau mỗi từ.
9. Khi kết thúc, hệ thống hiển thị số từ đã ôn, từ khó và thời điểm có lượt ôn tiếp theo.

### 8.4 Tiếp tục sau khi tải lại trang

1. Phiên ôn đang hoạt động được lưu trong cơ sở dữ liệu hoặc trạng thái bền vững.
2. Khi mở lại, người dùng được hỏi tiếp tục phiên cũ hay bắt đầu lại hàng đợi hiện tại.
3. Các lượt đã chấm không bị ghi lần hai.

## 9. Yêu cầu chức năng

### FR-01 — Xác thực và quyền sở hữu dữ liệu

- Người dùng phải đăng nhập để truy cập dữ liệu cá nhân.
- Mọi truy vấn từ vựng, bộ từ, tiến độ và lịch sử phải lọc bằng `userId` lấy từ session phía server.
- Client không được tự truyền một `userId` tùy ý để truy cập dữ liệu.
- MVP chỉ có vai trò `learner`.

### FR-02 — Trang Hôm nay

- Hiển thị bài học A1 đang tiếp tục.
- Hiển thị số từ đến hạn tại thời điểm tải trang.
- Hiển thị tối đa ba ví dụ từ đến hạn.
- Có hành động `Ôn n từ` và `Mở kho từ`.
- Hiển thị mục tiêu tuần và tối đa năm hoạt động học gần đây.
- Khi không có từ đến hạn, thay bằng trạng thái hoàn thành và thời điểm ôn tiếp theo.

### FR-03 — Lộ trình học

- Hiển thị các cấp `A1`, `A2`, `B1`, `B2`; MVP chỉ cần nội dung A1 có thể học.
- Mỗi module có tiêu đề, mô tả, kết quả thực tế, số bài và tiến độ.
- Bài tiếp theo có hành động rõ ràng.
- Module hiển thị số từ trong bài và số từ đến hạn liên quan.
- Trạng thái khóa không được chỉ thể hiện bằng độ mờ.

### FR-04 — Kho từ vựng

- Có ba tab: `Đến hạn`, `Kho từ`, `Bộ từ`.
- Hiển thị tổng số từ, đang học, đã thuộc và đến hạn hôm nay.
- Hỗ trợ tìm theo headword tiếng Đức, số nhiều và nghĩa tiếng Việt.
- Hỗ trợ lọc theo CEFR, loại từ, trạng thái và nguồn.
- Bảng desktop hiển thị từ, nghĩa, loại từ, ví dụ, trạng thái và lần ôn tiếp.
- Mobile chuyển bảng thành bản ghi có nhãn, không cuộn ngang toàn trang.
- Có phân trang hoặc cursor pagination; không tải toàn bộ kho từ vào client.

### FR-05 — Thêm và sửa từ

- Trường bắt buộc: headword, nghĩa tiếng Việt và loại từ.
- Danh từ yêu cầu `article`; `plural` được khuyến khích và có thể đánh dấu không có số nhiều.
- Động từ hỗ trợ `reflexive`, `separablePrefix`, giới từ đi kèm và case chi phối.
- Hỗ trợ một câu ví dụ tiếng Đức và bản dịch tiếng Việt trong MVP.
- Dữ liệu được chuẩn hóa khoảng trắng nhưng không tự ý bỏ dấu tiếng Đức.
- Cảnh báo trùng dựa trên `normalizedHeadword` trong cùng tài khoản.
- Xóa từ là xóa mềm để không làm mất lịch sử ôn ngay lập tức.

### FR-06 — Nhập nhiều từ

- Cho phép dán dữ liệu theo từng dòng hoặc nhập CSV UTF-8.
- Có bước xem trước trước khi lưu.
- Hiển thị lỗi theo từng dòng.
- Không lưu một phần âm thầm khi có lỗi không được người dùng xác nhận.
- Phát hiện trùng trong file và trùng với kho từ hiện tại.
- MVP giới hạn 200 dòng mỗi lần nhập.

### FR-07 — Bộ từ

- Người dùng có thể tạo, đổi tên và lưu trữ bộ từ cá nhân.
- Bài học có thể tạo bộ từ tự động.
- Một từ có thể thuộc nhiều bộ.
- Bộ từ hiển thị tổng số từ, số từ đến hạn và lần luyện gần nhất.
- Bộ từ không công khai trong MVP.

### FR-08 — Hàng đợi ôn

- Truy vấn từ có `dueAt <= now`, chưa xóa và thuộc người dùng hiện tại.
- Sắp xếp mặc định: quá hạn lâu nhất trước, sau đó theo `createdAt`.
- Hàng đợi mặc định tối đa 50 từ mỗi phiên.
- Từ mới có thể được trộn vào phiên theo cấu hình, mặc định tối đa 10 từ mới/ngày.
- Số đếm trên Dashboard và trong tab Đến hạn phải dùng cùng quy tắc truy vấn.

### FR-09 — Phiên ôn SRS

- Hiển thị một từ mỗi lần.
- Mặt trước không làm lộ nghĩa khi chế độ là Đức → Việt.
- Mặt sau hiển thị đầy đủ mạo từ, số nhiều, nghĩa, ví dụ và ghi chú liên quan.
- Có bốn lựa chọn `Lại`, `Khó`, `Tốt`, `Dễ`.
- Hiển thị khoảng thời gian dự kiến trước khi người dùng chọn.
- Hỗ trợ phím `Space` để hiện đáp án và `1–4` để chấm sau khi đáp án đã hiện.
- Không cho chấm hai lần cùng một lượt do double click hoặc request lặp.
- Lưu tiến độ sau mỗi lượt.

### FR-10 — Lịch sử và tiến độ

- Mỗi lần chấm tạo một bản ghi lịch sử bất biến.
- Tiến độ hiển thị số từ đã ôn, số lượt đúng theo lựa chọn `Tốt/Dễ`, số lượt cần học lại và chuỗi ngày có hoạt động.
- Không gọi lựa chọn `Tốt/Dễ` là “đúng tuyệt đối”; đây là tự đánh giá mức nhớ.
- Cho phép truy ngược từ trạng thái hiện tại về các lần ôn gần nhất.

### FR-11 — Chế độ sáng/tối

- Lần đầu tôn trọng lựa chọn hệ điều hành.
- Sau khi người dùng chọn, lưu preference vào tài khoản hoặc cookie bền vững.
- Không nháy sai theme khi tải trang.
- Cùng nội dung và bố cục ở cả hai chế độ.
- Không dùng màu thuần đen `#000000`.

### FR-12 — Phát âm

- Mỗi từ có nút nghe phát âm nếu trình duyệt hỗ trợ giọng `de-DE`.
- MVP có thể dùng Web Speech API làm phương án ban đầu.
- Khi không có giọng phù hợp, hiển thị lỗi có hướng dẫn thay vì nút không hoạt động.
- Không tự động phát âm khi mở trang.

## 10. Thuật toán SRS cho MVP

MVP sử dụng thuật toán xác định kiểu SM-2 đơn giản hóa. Không triển khai FSRS ngay ở phiên bản đầu vì chưa có đủ dữ liệu cá nhân để tinh chỉnh tham số.

### 10.1 Trạng thái lưu

Mỗi cặp người dùng–từ có:

- `state`: `new | learning | review | mastered`.
- `dueAt`: thời điểm ôn tiếp theo.
- `intervalDays`: khoảng cách hiện tại tính theo ngày.
- `easeFactor`: hệ số dễ, mặc định `2.5`.
- `repetitions`: số lần liên tiếp không chọn `Lại`.
- `lapseCount`: số lần chọn `Lại` sau khi từ đã vào giai đoạn review.
- `lastReviewedAt`.

### 10.2 Quy tắc đánh giá

Các khoảng dưới đây là giá trị tính toán; giao diện phải hiển thị kết quả thực tế, không ghi cứng theo thiết kế mẫu.

#### Từ mới

- `Lại`: `dueAt = now + 10 phút`, giữ `learning`, interval `0`.
- `Khó`: `dueAt = now + 1 ngày`, chuyển `learning`, interval `1`.
- `Tốt`: `dueAt = now + 3 ngày`, chuyển `review`, interval `3`.
- `Dễ`: `dueAt = now + 7 ngày`, chuyển `review`, interval `7`, tăng ease `+0.15`.

#### Từ đang học hoặc review

- `Lại`: `dueAt = now + 10 phút`, interval `0`, repetitions `0`, lapse `+1`, ease `-0.20`, state `learning`.
- `Khó`: interval mới `max(1, ceil(intervalDays × 1.2))`, ease `-0.05`.
- `Tốt`: interval mới `max(3, ceil(intervalDays × easeFactor))`.
- `Dễ`: interval mới `max(7, ceil(intervalDays × easeFactor × 1.3))`, ease `+0.15`.

`easeFactor` luôn nằm trong khoảng `1.3–3.0`. Khi interval đạt ít nhất 21 ngày và có ít nhất ba lượt liên tiếp không chọn `Lại`, trạng thái có thể chuyển thành `mastered`. Từ `mastered` vẫn tiếp tục có lịch ôn.

### 10.3 Yêu cầu kỹ thuật

- Hàm tính lịch ôn là pure function và được kiểm thử unit test.
- Server là nguồn thời gian chuẩn khi tính `dueAt`.
- Mỗi lượt ôn có `reviewEventId` duy nhất để chống ghi trùng.
- Cập nhật review state và ghi review log phải nằm trong transaction khi môi trường MongoDB hỗ trợ transaction.
- Mọi mốc thời gian lưu ở UTC; chỉ chuyển múi giờ khi hiển thị.

## 11. Mô hình dữ liệu MongoDB

### 11.1 Công nghệ

- MongoDB Atlas.
- Mongoose cho schema, validation và index.
- Zod cho validation tại biên API/form.
- ObjectId làm khóa nội bộ; API trả chuỗi ID.

### 11.2 Collection `users`

```ts
{
  _id: ObjectId,
  email: string,
  name: string,
  image?: string,
  nativeLanguage: "vi",
  targetLanguage: "de",
  currentLevel: "A1" | "A2" | "B1" | "B2" | "C1",
  timezone: "Asia/Ho_Chi_Minh",
  themePreference: "system" | "light" | "dark",
  dailyNewWordLimit: number,
  createdAt: Date,
  updatedAt: Date
}
```

### 11.3 Collection `vocabularyWords`

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  headword: string,
  normalizedHeadword: string,
  article?: "der" | "die" | "das",
  plural?: string,
  noPlural?: boolean,
  meaningsVi: string[],
  wordType: "noun" | "verb" | "adjective" | "adverb" | "phrase" | "other",
  level?: "A1" | "A2" | "B1" | "B2" | "C1",
  grammar: {
    reflexive?: boolean,
    separable?: boolean,
    separablePrefix?: string,
    governedPreposition?: string,
    governedCase?: "Akk" | "Dat" | "Gen" | "Nom",
    notes?: string
  },
  examples: [
    {
      de: string,
      vi?: string
    }
  ],
  sourceLessonId?: ObjectId,
  setIds: ObjectId[],
  isArchived: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 11.4 Collection `reviewStates`

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  wordId: ObjectId,
  state: "new" | "learning" | "review" | "mastered",
  dueAt: Date,
  intervalDays: number,
  easeFactor: number,
  repetitions: number,
  lapseCount: number,
  lastReviewedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 11.5 Collection `reviewLogs`

```ts
{
  _id: ObjectId,
  reviewEventId: string,
  userId: ObjectId,
  wordId: ObjectId,
  sessionId: ObjectId,
  rating: "again" | "hard" | "good" | "easy",
  previousState: object,
  nextState: object,
  reviewedAt: Date,
  responseTimeMs?: number
}
```

### 11.6 Collection `reviewSessions`

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  status: "active" | "completed" | "abandoned",
  mode: "de-vi" | "vi-de" | "cloze" | "audio",
  wordIds: ObjectId[],
  currentIndex: number,
  reviewedWordIds: ObjectId[],
  startedAt: Date,
  completedAt?: Date,
  updatedAt: Date
}
```

### 11.7 Collection `vocabularySets`

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  description?: string,
  kind: "personal" | "lesson",
  sourceLessonId?: ObjectId,
  isArchived: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 11.8 Collection `lessons`

```ts
{
  _id: ObjectId,
  slug: string,
  level: "A1" | "A2" | "B1" | "B2" | "C1",
  moduleOrder: number,
  lessonOrder: number,
  titleDe: string,
  titleVi: string,
  objectiveVi: string,
  estimatedMinutes: number,
  content: object,
  vocabularySeed: object[],
  published: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 11.9 Collection `lessonProgress`

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  lessonId: ObjectId,
  status: "not_started" | "in_progress" | "completed",
  currentActivityIndex: number,
  completedActivityIds: string[],
  startedAt?: Date,
  completedAt?: Date,
  updatedAt: Date
}
```

### 11.10 Index bắt buộc

```ts
vocabularyWords: { userId: 1, normalizedHeadword: 1 } unique where isArchived = false
vocabularyWords: { userId: 1, setIds: 1 }
vocabularyWords: { userId: 1, level: 1, wordType: 1 }
vocabularyWords: text index for headword, plural, meaningsVi where practical

reviewStates: { userId: 1, wordId: 1 } unique
reviewStates: { userId: 1, dueAt: 1, state: 1 }

reviewLogs: { reviewEventId: 1 } unique
reviewLogs: { userId: 1, reviewedAt: -1 }
reviewLogs: { userId: 1, wordId: 1, reviewedAt: -1 }

reviewSessions: { userId: 1, status: 1, updatedAt: -1 }
vocabularySets: { userId: 1, name: 1 }
lessonProgress: { userId: 1, lessonId: 1 } unique
```

## 12. API và server actions

Tên endpoint chỉ là hợp đồng đề xuất; có thể dùng Route Handlers hoặc Server Actions nếu vẫn giữ cùng validation và authorization.

### Từ vựng

- `GET /api/vocabulary` — phân trang, tìm kiếm, lọc.
- `POST /api/vocabulary` — tạo từ và review state ban đầu.
- `GET /api/vocabulary/:id` — lấy chi tiết từ thuộc tài khoản.
- `PATCH /api/vocabulary/:id` — cập nhật từ.
- `DELETE /api/vocabulary/:id` — xóa mềm.
- `POST /api/vocabulary/import/preview` — phân tích và kiểm tra dữ liệu nhập.
- `POST /api/vocabulary/import/commit` — lưu dữ liệu đã xác nhận.

### Bộ từ

- `GET /api/vocabulary-sets`.
- `POST /api/vocabulary-sets`.
- `PATCH /api/vocabulary-sets/:id`.
- `POST /api/vocabulary-sets/:id/words`.
- `DELETE /api/vocabulary-sets/:id/words/:wordId`.

### Ôn tập

- `GET /api/reviews/due-count`.
- `POST /api/review-sessions` — tạo hoặc tiếp tục phiên.
- `GET /api/review-sessions/:id`.
- `POST /api/review-sessions/:id/reveal` — tùy chọn ghi thời điểm reveal.
- `POST /api/review-sessions/:id/rate` — chấm một từ bằng event ID idempotent.
- `POST /api/review-sessions/:id/complete`.

### Bài học và tiến độ

- `GET /api/learning-path?level=A1`.
- `GET /api/lessons/:slug`.
- `PATCH /api/lesson-progress/:lessonId`.
- `GET /api/dashboard` — tổng hợp dữ liệu cần cho trang Hôm nay.

## 13. Kiến trúc kỹ thuật đề xuất

### Frontend

- Next.js với App Router và TypeScript strict.
- Tailwind CSS dùng semantic design tokens từ `DESIGN.md`.
- React Hook Form và Zod cho biểu mẫu.
- Component truy cập được bằng bàn phím và screen reader.
- Server Components cho trang đọc dữ liệu; Client Components chỉ cho phần cần tương tác.

### Backend

> Architecture decision (2026-10-25): the approved implementation uses a Fastify API in `apps/api` instead of Next.js Route Handlers for domain data. Auth.js remains in `apps/web` as a framework-bound authentication boundary until an explicit authentication migration is approved. Endpoint contracts, validation, authorization, MongoDB, and SRS requirements below are unchanged.

- Next.js Route Handlers hoặc Server Actions.
- MongoDB Atlas và Mongoose.
- Auth.js với MongoDB adapter hoặc một nhà cung cấp đăng nhập tương thích.
- Validation Zod ở mọi dữ liệu vào.
- Không gọi trực tiếp MongoDB từ client.

### Kiểm thử

- Vitest cho hàm SRS, validation và services.
- React Testing Library cho form và review controls.
- Playwright cho các luồng quan trọng.
- Kiểm thử accessibility tự động bằng axe trong các trang chính nếu phù hợp.

### Triển khai

- Vercel cho ứng dụng Next.js.
- MongoDB Atlas cho database.
- Biến môi trường được cấu hình trên máy local và nền tảng triển khai; không commit secret.

## 14. Cấu trúc thư mục đề xuất

```text
src/
  app/
    (auth)/
    (app)/
      today/
      learn/
      vocabulary/
      practice/
      progress/
    api/
  components/
    ui/
    vocabulary/
    review/
    learning/
  lib/
    auth/
    db/
    srs/
    validation/
  models/
  services/
  styles/
  test/
```

Không đặt business logic SRS trực tiếp trong React component hoặc API handler. Logic phải nằm trong module riêng tại `src/lib/srs` hoặc `src/services/review`.

## 15. Yêu cầu phi chức năng

### Hiệu năng

- LCP mục tiêu dưới 2,5 giây trên kết nối trung bình khi triển khai production.
- Thao tác chấm từ phản hồi trực quan trong dưới 150ms; việc ghi server có optimistic state an toàn hoặc trạng thái đang lưu rõ ràng.
- Truy vấn kho từ luôn phân trang.
- Dashboard dùng một endpoint tổng hợp để tránh nhiều request nối tiếp không cần thiết.

### Khả năng truy cập

- Mục tiêu WCAG 2.2 AA cho các màn hình MVP.
- Toàn bộ phiên ôn sử dụng được bằng bàn phím.
- Focus-visible rõ ràng.
- Control tối thiểu `44 × 44px`.
- Trạng thái không chỉ dựa vào màu.
- Tôn trọng `prefers-reduced-motion`.

### Bảo mật và riêng tư

- Không trả `MONGODB_URI`, secret hoặc token về client.
- Không ghi secret, cookie session hoặc dữ liệu đăng nhập vào log.
- Kiểm tra session và quyền sở hữu tại server cho mọi bản ghi cá nhân.
- Chống NoSQL injection bằng schema validation, không truyền trực tiếp object filter từ request.
- Giới hạn kích thước request nhập nhiều từ.
- Escape/sanitize nội dung hiển thị; không render HTML tùy ý từ bài học hoặc ghi chú.
- Có rate limit tối thiểu cho endpoint đăng nhập và import.

### Tin cậy dữ liệu

- Review rating phải idempotent bằng `reviewEventId`.
- Không xóa cứng từ nếu còn review log trong MVP.
- Lưu timestamp UTC.
- Có seed script có thể chạy lặp lại mà không tạo dữ liệu trùng.
- Backup do MongoDB Atlas quản lý theo gói triển khai được chọn.

## 16. Nội dung seed tối thiểu

MVP cần dữ liệu mẫu đủ để kiểm thử bằng sản phẩm thật:

- Một lộ trình A1.
- Hai module A1, trong đó module đầu có thể hoàn thành.
- Ít nhất bốn bài học.
- Ít nhất 40 từ vựng chuẩn hóa.
- Có danh từ, động từ, tính từ và cụm từ.
- Danh từ có mạo từ và số nhiều khi tồn tại.
- Mỗi từ có ít nhất một nghĩa tiếng Việt.
- Ít nhất 20 từ có câu ví dụ song ngữ.
- Một bộ từ theo bài học `Giờ giấc & lịch hẹn`.

Ví dụ bắt buộc:

- `der Termin · die Termine`.
- `die Uhrzeit · die Uhrzeiten`.
- `vereinbaren`.
- `pünktlich`.
- `die Verspätung · die Verspätungen`.
- `sich bewerben um + Akk.`.

## 17. Tiêu chí nghiệm thu MVP

### AC-01 — Tạo từ

- Khi nhập `der Termin`, số nhiều `die Termine` và nghĩa `cuộc hẹn`, từ xuất hiện trong kho sau khi lưu.
- Refresh trang không làm mất dữ liệu.
- Tạo lại cùng headword trong cùng tài khoản hiển thị cảnh báo trùng.

### AC-02 — Danh sách và tìm kiếm

- Tìm `Termin` trả về `der Termin`.
- Tìm `cuộc hẹn` cũng trả về cùng bản ghi.
- Lọc `Danh từ + A1` không trả về động từ A2.
- Phân trang không làm mất bộ lọc hiện tại.

### AC-03 — Từ đến hạn

- Một review state có `dueAt` trong quá khứ xuất hiện ở Dashboard và tab Đến hạn.
- Một review state trong tương lai không xuất hiện.
- Số đếm ở hai nơi giống nhau.

### AC-04 — Chấm phiên ôn

- Sau khi chọn `Tốt`, review log được tạo và `dueAt` thay đổi theo thuật toán.
- Gửi lại cùng `reviewEventId` không tạo log thứ hai.
- Refresh sau mỗi lượt tiếp tục đúng từ kế tiếp.
- Phím `1–4` chỉ hoạt động sau khi đáp án đã hiện.

### AC-05 — Theme

- Lần đầu theo system preference.
- Người dùng chuyển sang Tối, refresh vẫn ở Tối.
- Không có đoạn nháy giao diện sáng trước khi dark mode được áp dụng.

### AC-06 — Authorization

- Người dùng không thể đọc hoặc sửa bản ghi thuộc `userId` khác bằng cách thay ID trên URL hoặc request.
- Request chưa đăng nhập nhận phản hồi phù hợp và không rò rỉ dữ liệu.

### AC-07 — Responsive và accessibility

- Trang hoạt động ở viewport 375px mà không cuộn ngang toàn trang.
- Phiên ôn có thể hoàn thành chỉ bằng bàn phím.
- Các nút chính có accessible name và focus-visible.

## 18. Test plan tối thiểu

### Unit tests

- Tất cả nhánh `Again/Hard/Good/Easy` cho từ mới và từ review.
- Clamp `easeFactor` tại 1.3 và 3.0.
- Chuyển trạng thái `learning → review → mastered`.
- Xử lý timestamp và múi giờ.
- Chuẩn hóa headword nhưng giữ umlaut và `ß`.
- Validation danh từ thiếu article.

### Integration tests

- Tạo vocabulary word đồng thời tạo review state.
- Query due words đúng user và đúng thời điểm.
- Rating tạo log và cập nhật state.
- Idempotency của review event.
- Import preview phát hiện dòng lỗi và trùng.

### End-to-end tests

1. Đăng nhập → thêm từ → thấy trong Kho từ.
2. Đặt từ đến hạn → mở Dashboard → bắt đầu phiên ôn.
3. Hiện đáp án → chọn `Tốt` → hoàn thành phiên → thấy ngày ôn mới.
4. Đổi light/dark → refresh → preference được giữ.
5. Mobile viewport → thêm từ và hoàn thành một lượt ôn.

## 19. Kế hoạch triển khai

### Giai đoạn 0 — Khởi tạo

- Tạo ứng dụng Next.js TypeScript.
- Cấu hình lint, format, test và biến môi trường mẫu.
- Kết nối MongoDB Atlas.
- Cài Auth.js.
- Chuyển design tokens từ `DESIGN.md` vào CSS/Tailwind.

### Giai đoạn 1 — Nền dữ liệu từ vựng

- Tạo Mongoose models và indexes.
- Tạo validation schemas.
- Viết repository/service layer.
- Tạo seed script.
- Viết unit/integration tests trước khi dựng UI đầy đủ.

### Giai đoạn 2 — Kho từ

- Dựng application shell và theme.
- Dựng trang Kho từ.
- Thêm/sửa/xóa mềm từ.
- Tìm kiếm, lọc và phân trang.
- Nhập nhiều từ với preview.

### Giai đoạn 3 — SRS vertical slice

- Viết pure SRS function và tests.
- Tạo due queue và review session.
- Dựng mặt trước, mặt sau và recall controls.
- Lưu sau mỗi lượt, chống ghi trùng và khôi phục session.

### Giai đoạn 4 — Dashboard và lộ trình A1

- Dựng trang Hôm nay từ dữ liệu thật.
- Dựng lộ trình A1 và một bài học mẫu.
- Cho phép lưu từ từ bài học.
- Dựng lịch sử hoạt động và tiến độ cơ bản.

### Giai đoạn 5 — Hoàn thiện

- Responsive mobile.
- Accessibility audit.
- Playwright E2E.
- Kiểm tra trạng thái loading, empty và error.
- Triển khai preview trên Vercel.
- Kiểm thử dữ liệu thực trong tối thiểu bảy ngày trước khi mở rộng tính năng.

## 20. Definition of Done

Một hạng mục chỉ hoàn thành khi:

- Đáp ứng acceptance criteria liên quan.
- Có validation ở server.
- Có kiểm tra quyền sở hữu dữ liệu.
- Có test tương xứng với business logic.
- Có trạng thái loading, empty và error.
- Dùng được bằng bàn phím.
- Hoạt động ở light và dark mode.
- Responsive ở mobile và desktop.
- Không thêm tính năng ngoài PRD nếu chưa ghi nhận thành yêu cầu mới.

## 21. Các quyết định đã chốt

- Giữ repository Lingo hiện tại và xây cấu trúc mới bên trong; không cần tạo repository khác.
- Dùng MongoDB Atlas thay cho PostgreSQL.
- Dùng Mongoose cho model và index.
- Làm kho từ và SRS trước các tính năng nghe, nói và phỏng vấn.
- Light mode là mặc định ban ngày; dark mode là lựa chọn tương đương.
- Sea Glass là màu nhấn thương hiệu duy nhất.
- Thuật toán MVP là SM-2 đơn giản hóa, có thể thay bằng FSRS sau khi có đủ review history.
- Ứng dụng là sản phẩm học cá nhân; không có chức năng thương mại hoặc xã hội trong MVP.

## 22. Rủi ro và biện pháp giảm thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Phạm vi tăng quá nhanh | MVP không hoàn thành | Chỉ triển khai các mục nằm trong phần 6.1 |
| Dữ liệu từ vựng không nhất quán | Ôn sai hoặc khó tìm kiếm | Schema validation, seed review và quy tắc danh từ rõ ràng |
| Ghi trùng lượt ôn | Sai lịch SRS | `reviewEventId` unique và transaction |
| Query due words chậm | Dashboard/phiên ôn chậm | Compound index `{ userId, dueAt, state }` |
| Theme chỉ đẹp ở một chế độ | Khó dùng ban đêm hoặc ban ngày | Semantic tokens và kiểm thử cả hai theme |
| TTS trình duyệt không có giọng Đức tốt | Trải nghiệm phát âm không ổn định | Hiển thị fallback; thay nguồn audio ở giai đoạn sau |
| Nội dung bài học mở rộng quá sớm | Tốn thời gian hơn logic cốt lõi | Chỉ seed một lộ trình A1 tối thiểu trong MVP |

## 23. Hướng mở rộng sau MVP

Chỉ xem xét sau khi vòng lặp từ vựng hoạt động ổn định:

- Bài tập nghe có chấm điểm.
- Luyện hội thoại theo tình huống thực tế.
- Ghi âm và phản hồi phát âm.
- Luyện phỏng vấn Ausbildung, việc làm và visa.
- Nhập từ từ văn bản hoặc phụ đề.
- Thuật toán FSRS được tối ưu từ lịch sử thật.
- PWA và hỗ trợ học ngoại tuyến có giới hạn.
- Thống kê lỗi ngữ pháp và kỹ năng theo CEFR.
