import { BrandMark } from "../shared/Icons.jsx";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <a
        className="brand footer-brand"
        href="#/home"
        aria-label="LinkedOut home"
      >
        <BrandMark />
        <span>
          linked<span className="brand-light">out</span>
        </span>
      </a>
      <span>For the stories that don’t make it onto your résumé.</span>
      <span className="footer-note">
        PRIVATE BY DEFAULT <span aria-hidden="true">✳</span>
      </span>
    </footer>
  );
}
