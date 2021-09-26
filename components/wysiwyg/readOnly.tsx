import React, { useState, useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";

const ReadOnly = ({ content }: { content: any }) => {
  const [value, setValue] = useState<Descendant[]>(content);
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <Editable readOnly placeholder="Enter some plain text..." />
    </Slate>
  );
};

export default ReadOnly;
