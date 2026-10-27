import { BookOpenCheck, Brain, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function PracticePage() {
  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Übung · Luyện tập</p>
          <h1>Luyện tập</h1>
          <p>
            Chọn đúng loại luyện tập từ nội dung A1, ngữ pháp hoặc hàng đợi SRS
            hiện có.
          </p>
        </div>
      </header>
      <div className="practice-hub">
        <section aria-labelledby="review-practice-title">
          <RotateCcw aria-hidden="true" size={24} />
          <p className="eyebrow">SRS · Đến hạn</p>
          <h2 id="review-practice-title">Ôn từ vựng</h2>
          <p>Nhớ lại từng từ và chọn Lại, Khó, Tốt hoặc Dễ.</p>
          <Link className="button button--primary" href="/practice/review">
            Ôn từ đến hạn
          </Link>
        </section>
        <section aria-labelledby="lesson-practice-title">
          <BookOpenCheck aria-hidden="true" size={24} />
          <p className="eyebrow">Lektion · Theo lộ trình</p>
          <h2 id="lesson-practice-title">Bài tập trong bài học</h2>
          <p>Tiếp tục bài A1 để luyện hội thoại, từ vựng và ba dạng bài tập.</p>
          <Link className="button button--secondary" href="/learn">
            Chọn bài học A1
          </Link>
        </section>
        <section aria-labelledby="grammar-practice-title">
          <Brain aria-hidden="true" size={24} />
          <p className="eyebrow">Grammatik · Theo chủ đề</p>
          <h2 id="grammar-practice-title">Bài tập ngữ pháp</h2>
          <p>Đọc quy tắc ngắn rồi làm bài được chấm và lưu kết quả.</p>
          <Link className="button button--secondary" href="/learn/grammar">
            Chọn chủ đề ngữ pháp
          </Link>
        </section>
      </div>
    </div>
  );
}
