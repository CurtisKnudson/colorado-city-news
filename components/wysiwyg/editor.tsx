import * as React from "react";
import { useMemo, useState, useCallback, useEffect } from "react";
import isHotkey from "is-hotkey";
import {
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Transforms,
} from "slate";
import { Editable, Slate, useSlate, withReact } from "slate-react";
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import { Toolbar } from "./toolbar";
import { Button } from "./button";
import {
  Bold,
  Itallic,
  Underline,
  Code,
  H1,
  H2,
  Blockquote,
  Ul,
  Ol,
} from "icons";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
  "mod+5": "dropCap",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

const SlateEditor = ({
  readOnly,
  content,
}: {
  readOnly?: boolean;
  content?: CustomElement[];
}) => {
  const [localStorageContent, setLocalStorageContent] =
    useState<Descendant[]>(initialValue);
  const [value, setValue] = useState<Descendant[]>(
    readOnly ? (content ? content : initialValue) : localStorageContent
  );
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    const localStorageContent: Descendant[] = JSON.parse(
      // @ts-ignore
      window.localStorage.getItem("content")
    );
    setLocalStorageContent(localStorageContent);
  }, []);
  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);

        // Save the value to Local Storage.
        const content = JSON.stringify(value);
        localStorage.setItem("content", content);
      }}
    >
      {readOnly ? (
        <> </>
      ) : (
        <Toolbar>
          <MarkButton format="bold" Icon={Bold} />
          <MarkButton format="italic" Icon={Itallic} />
          <MarkButton format="underline" Icon={Underline} />
          <MarkButton format="code" Icon={Code} />
          <BlockButton format="heading-one" Icon={H1} />
          <BlockButton format="heading-two" Icon={H2} />
          <BlockButton format="block-quote" Icon={Blockquote} />
          <BlockButton format="numbered-list" Icon={Ol} />
          <BlockButton format="bulleted-list" Icon={Ul} />
        </Toolbar>
      )}

      {readOnly ? (
        <Editable
          readOnly
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck="false"
          autoCorrect="false"
          autoCapitalize="false"
        />
      ) : (
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Write your article here..."
          onKeyDown={(event) => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event as any)) {
                event.preventDefault();
                // @ts-ignore
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
        />
      )}
    </Slate>
  );
};

/* jshint ignore:start */

// @ts-ignore
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });
  const newProperties: Partial<SlateElement> = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  };
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: BaseEditor & ReactEditor, format: any) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor: BaseEditor & ReactEditor, format: any) => {
  const { selection } = editor;
  if (!selection) return false;
  // @ts-ignore
  const [match] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

const isMarkActive = (editor: BaseEditor & ReactEditor, format: any) => {
  const marks = Editor.marks(editor);
  // @ts-ignore
  return marks ? marks[format] === true : false;
};

// @ts-ignore
const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote className="mx-8" {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return (
        <h1 className="" {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return (
        <li className="mx-4" {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol className="list-decimal" {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p
          className="merriweather-light tracking-wide text-black-60"
          {...attributes}
        >
          {children}
        </p>
      );
  }
};

// @ts-ignore

export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong className="font-bold text-black">{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.dropCap) {
    children = <span className="dropT">{children}</span>;
  }
  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, Icon }: { format: any; Icon?: any }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      // @ts-ignore
      onMouseDown={(event) => {
        event.preventDefault();

        toggleBlock(editor, format);
      }}
    >
      {Icon ? <Icon /> : <span>B</span>}
    </Button>
  );
};

const MarkButton = ({ format, Icon }: { format: any; Icon?: any }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      // @ts-ignore
      onMouseDown={(event) => {
        event.preventDefault();

        toggleMark(editor, format);
      }}
    >
      {Icon ? <Icon /> : <span>M</span>}
    </Button>
  );
};

export default SlateEditor;
