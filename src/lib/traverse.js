/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const TRAVERSE_AFTER = 0;
const TRAVERSE_FROM = 1;
const TRAVERSE_BACK = 2;

const runFrom = (elem, maxTraverseWords = 10, maxTraverseLevel = 4) => {
  return run(elem, TRAVERSE_BACK, maxTraverseWords, maxTraverseLevel);
};

const runAfter = (elem, maxTraverseWords = 10, maxTraverseLevel = 4) => {
  return run(elem, TRAVERSE_AFTER, maxTraverseWords, maxTraverseLevel);
};

const run = (elem, traverseType, maxTraverseWords = 10, maxTraverseLevel = 4) => {
  const resultWords = [];
  let startingPoint = elem;
  let current = startingPoint.parentNode;

  const code = startingPoint.textContent.charCodeAt(0);
  const isEnglishLike = (0x20 <= code && code <= 0x7e) || code === 0x2011;
  if (isEnglishLike) {
    resultWords.push(...getDescendantsWords(current, startingPoint, traverseType));
  } else {
    resultWords.push(...getDescendantsWords(current, startingPoint, TRAVERSE_FROM));
  }

  startingPoint = current;
  current = current.parentNode;

  for (let i = 0; i < maxTraverseLevel; i++) {
    if (resultWords.length >= maxTraverseWords) {
      break;
    }
    if (!current || current.tagName === "BODY") {
      break;
    }
    const words = getDescendantsWords(current, startingPoint, TRAVERSE_AFTER);
    resultWords.push(...words);
    startingPoint = current;
    current = current.parentNode;
  }
  const text = joinWords(resultWords.slice(0, maxTraverseWords));
  return text;
};

const getDescendantsWords = (elem, startingPoint, traverseType) => {
  const words = [];

  if (!elem.childNodes || elem.childNodes.length === 0) {
    if (elem === startingPoint) {
      return [];
    }
    //    const t = elem.textContent.trim();
    const t = elem.textContent;
    return t ? [t] : [];
  }

  const children = getChildren(elem, startingPoint, traverseType);

  for (let i = 0; i < children.length; i++) {
    const descendantsWords = getDescendantsWords(children[i], null, false);
    words.push(...descendantsWords);
  }
  return words;
};

const getChildren = (elem, startingPoint, traverseType) => {
  let children;
  if (startingPoint) {
    // const { children, areAllTextNodes } = selectTargetChildren(elem, startingPoint, traverseType);
    // resultChildren = areAllTextNodes ? processSiblings(children) : children;
    children = selectTargetChildren(elem, startingPoint, traverseType);
    // const areAllTextNodes = children.every(isVirtualTextNode);
    // resultChildren = areAllTextNodes ? processSiblings(children) : children;
  } else {
    children = Array.from(elem.childNodes);
    // const areAllTextNodes = children.every(isVirtualTextNode);
    // resultChildren = areAllTextNodes ? processSiblings(children) : children;
  }

  const areAllTextNodes = children.every(isVirtualTextNode);
  const resultChildren = areAllTextNodes ? processSiblings(children) : children;

  return resultChildren;
};

const selectTargetChildren = (elem, startingPoint, traverseType) => {
  const targetChildren = [];
  let foundStartingPoint = false;
  for (let i = elem.childNodes.length - 1; i >= 0; i--) {
    const child = elem.childNodes[i];
    const toTraverse = shouldTraverse(child);
    if (!foundStartingPoint) {
      foundStartingPoint = child === startingPoint;
    }
    if (foundStartingPoint && traverseType === TRAVERSE_AFTER) {
      break;
    }
    if (foundStartingPoint && traverseType === TRAVERSE_BACK) {
      if (!toTraverse) {
        break;
      }
    }
    targetChildren.push({
      tagName: child.tagName,
      textContent: child.textContent,
      children: child.children,
      childNodes: child.childNodes
    });
    if (foundStartingPoint && traverseType === TRAVERSE_FROM) {
      break;
    }
    if (foundStartingPoint && traverseType === TRAVERSE_BACK) {
      if (!isVirtualTextNode(child) || child.textContent.includes(" ")) {
        break;
      }
    }
  }
  const MAX_ELEMENTS = 100;
  return targetChildren.reverse().slice(0, MAX_ELEMENTS);
  //return { children: targetChildren.reverse().slice(0, MAX_ELEMENTS), areAllTextNodes };
};

const processSiblings = siblings => {
  const textContent = siblings.map(it => it.textContent).join("");
  return [
    {
      tagName: "",
      textContent: textContent,
      children: [],
      childNodes: []
    }
  ];
};

const joinWords = words => {
  let joinNext = false;
  let currentWord = "";
  const newWords = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (joinNext) {
      currentWord += w;
      joinNext = false;
    } else {
      if (w === "-") {
        currentWord += "-";
        joinNext = true;
      } else {
        if (currentWord) {
          newWords.push(currentWord);
        }
        joinNext = false;
        currentWord = w;
      }
    }
  }
  if (currentWord) {
    newWords.push(currentWord);
  }
  return newWords.join(" ").trim();
};

const TEXT_TAGS = ["SPAN"];
const EXCEPT = new Set(["/", "<", ">"]);

const isVirtualTextNode = element => {
  const len = element.children && element.children.length;
  if (len > 0) {
    return false;
  }
  if (!TEXT_TAGS.includes(element.tagName)) {
    return false;
  }
  return true;
};

const shouldTraverse = element => {
  return !EXCEPT.has(element.textContent);
};

export default { runFrom, runAfter };
