import dom from "../src/lib/dom";

test("", () => {
  const e = dom.create("<span>text</span>");

  dom.applyStyles(e, { opacity: 0.5 });
  expect(e.style.opacity).toEqual("0.5");

  dom.applyStyles(e, {});
  dom.applyStyles(e);
  dom.applyStyles(e, "xxx");
  expect(e.style.opacity).toEqual("0.5");
});

test("", () => {
  const e = dom.create(`
   <div>
    <span>aaa</span>
    <span>bbb</span>
    <span>ccc</span>
   </div>
   `);
  expect(e.children.length).toEqual(3);
});
