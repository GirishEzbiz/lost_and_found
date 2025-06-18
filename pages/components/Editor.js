import { useState, useRef, useEffect } from "react";

export default function RichTextEditor({
  value = "",
  onEditorChange,
  height = 200,
  showHtmlToggle = true,
}) {
  const [showSource, setShowSource] = useState(false);
  const [html, setHtml] = useState(value);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelection = useRef(null);

  useEffect(() => {
    setHtml(value);
  }, [value]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedSelection.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    }
  };

  const execCommand = (command, value = null) => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    const newContent = editorRef.current.innerHTML;
    setHtml(newContent);
    onEditorChange?.(newContent);
  };

  const toggleSource = () => {
    if (showSource) {
      const newContent = editorRef.current.value;
      setHtml(newContent);
      setShowSource(false);
      onEditorChange?.(newContent);
    } else {
      setShowSource(true);
    }
  };

  const onInput = (e) => {
    const newContent = e.currentTarget.innerHTML;
    setHtml(newContent);
    onEditorChange?.(newContent);
  };

  const onTextareaChange = (e) => {
    const newContent = e.target.value;
    setHtml(newContent);
    onEditorChange?.(newContent);
  };

  const insertImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "100%";
      img.style.cursor = "pointer";
      img.onclick = () => img.remove();
      restoreSelection();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.collapse(false);
      } else {
        editorRef.current.appendChild(img);
      }
      saveSelection();
      const newContent = editorRef.current.innerHTML;
      setHtml(newContent);
      onEditorChange?.(newContent);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const save = () => saveSelection();

    editor.addEventListener("mouseup", save);
    editor.addEventListener("keyup", save);

    return () => {
      editor.removeEventListener("mouseup", save);
      editor.removeEventListener("keyup", save);
    };
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      {/* Toolbar */}
      <div className="d-flex flex-wrap align-items-center gap-2 p-2 border rounded bg-light mb-3" >
        <select
          className="form-select form-select-sm w-40 " style={{marginRight:"17px"}}
          onChange={(e) => execCommand("formatBlock", e.target.value)}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        {[
          { cmd: "bold", label: <b>B</b>, title: "Bold" },
          { cmd: "italic", label: <i>I</i>, title: "Italic" },
          { cmd: "underline", label: <u>U</u>, title: "Underline" },
          { cmd: "justifyLeft", label: "🡸", title: "Align Left" },
          { cmd: "justifyCenter", label: "🡺", title: "Align Center" },
          { cmd: "justifyRight", label: "⇨", title: "Align Right" },
          { cmd: "insertUnorderedList", label: "• List", title: "Bullet List" },
          { cmd: "insertOrderedList", label: "1. List", title: "Numbered List" },
        ].map(({ cmd, label, title }) => (
          <button
            key={cmd}
            type="button"
            className="btn btn-outline-secondary btn-sm "
            onClick={() => execCommand(cmd)}
            title={title}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) execCommand("createLink", url);
          }}
          title="Insert Link"
        >
          🔗
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => fileInputRef.current.click()}
          title="Insert Image"
        >
          🖼️
        </button>

        {showHtmlToggle && (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={toggleSource}
            title="Toggle HTML View"
          >
            {showSource ? "WYSIWYG" : "HTML"}
          </button>
        )}

        <input
          type="file"
          accept="image/*"
          className="d-none"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) insertImage(file);
            e.target.value = null;
          }}
        />
      </div>

      {/* Editor */}
      {showSource ? (
        <textarea
          ref={editorRef}
          value={html}
          onChange={onTextareaChange}
          style={{
            width: "100%",
            height,
            border: "1px solid #ccc",
            padding: 10,
            borderRadius: 4,
            fontFamily: "monospace",
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          dangerouslySetInnerHTML={{ __html: html }}
          onInput={onInput}
          style={{
            border: "1px solid #ccc",
            minHeight: height,
            padding: 10,
            borderRadius: 4,
            backgroundColor: "#fff",
            overflowY: "auto",
          }}
        />
      )}
    </div>
  );
}
