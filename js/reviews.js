/* Client reviews. Only the agency's OWN real reviews go here (copied from its Google profile, with the author's name
   as shown there). While the list is empty the section stays hidden. Example entry:
   { name: "Name Surname", when: "2 months ago", text: "…" } */
(function () {
  "use strict";
  var REVIEWS = [];
  var sec = document.getElementById("reviews");
  if (!sec || !REVIEWS.length) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  sec.querySelector(".reviews").innerHTML = REVIEWS.map(function (r) {
    return '<figure class="rv-card"><div class="rv-stars" aria-label="5 out of 5">★★★★★</div><blockquote>' + esc(r.text) + '</blockquote><figcaption><b>' + esc(r.name) + '</b><span>' + esc(r.when || "") + "</span></figcaption></figure>";
  }).join("");
  sec.hidden = false;
})();
