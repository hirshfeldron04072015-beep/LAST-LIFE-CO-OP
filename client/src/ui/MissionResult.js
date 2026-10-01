export class MissionResult {
  constructor() {
    this.element =
      document.createElement(
        "div"
      );

    this.element.id =
      "mission-result";

    this.element.innerHTML = `
      <div class="result-panel">
        <div class="result-title"></div>
        <div class="result-score"></div>
        <div class="result-xp"></div>
        <button class="result-close">
          CONTINUE
        </button>
      </div>
    `;

    document.body.appendChild(
      this.element
    );

    this.title =
      this.element.querySelector(
        ".result-title"
      );

    this.score =
      this.element.querySelector(
        ".result-score"
      );

    this.xp =
      this.element.querySelector(
        ".result-xp"
      );

    this.close =
      this.element.querySelector(
        ".result-close"
      );

    this.close.addEventListener(
      "click",
      () => this.hide()
    );

    this.hide();
  }

  show(success, score, xp) {
    this.title.textContent =
      success
        ? "MISSION COMPLETE"
        : "MISSION FAILED";

    this.score.textContent =
      `SCORE  ${score}`;

    this.xp.textContent =
      `XP  +${xp}`;

    this.element.classList.add(
      "visible"
    );
  }

  hide() {
    this.element.classList.remove(
      "visible"
    );
  }
}
