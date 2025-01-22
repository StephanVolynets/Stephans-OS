"use client";

import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Trash2 } from 'lucide-react';

interface TextEditorProps {
  id: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

export function TextEditor({ id, initialContent = '', onSave }: TextEditorProps) {
  const editorRef = useRef<any>(null);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    // Load content from localStorage on mount
    const savedContent = localStorage.getItem(`editor-${id}`);
    if (savedContent) {
      setContent(savedContent);
    }
  }, [id]);

  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      localStorage.setItem(`editor-${id}`, content);
      onSave?.(content);
      toast.success('Content saved successfully');
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.setContent('');
      setContent('');
      localStorage.removeItem(`editor-${id}`);
      toast.info('Editor content cleared');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>
      <div className="flex-1 border rounded-md overflow-hidden">
        <Editor
          apiKey="hnr9bi76nea4jr66cbry7f2uvxc1dz35g0670gib75di9a9c"
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={content}
          init={{
            height: '100%',
            menubar: true,
            plugins: [
              // Core editing features
              'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 
              'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 
              'wordcount',
              // Premium features
              'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter',
              'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen',
              'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate',
              'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes',
              'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown',
              'importword', 'exportword', 'exportpdf'
            ],
            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
              'link image media table mergetags | addcomment showcomments | ' +
              'spellcheckdialog a11ycheck typography | align lineheight | ' +
              'checklist numlist bullist indent outdent | emoticons charmap | removeformat',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif; font-size: 14px }',
            skin: (document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide'),
            content_css: (document.documentElement.classList.contains('dark') ? 'dark' : 'default'),
            tinycomments_mode: 'embedded',
            tinycomments_author: 'Stephan',
            mergetags_list: [
              { value: 'First.Name', title: 'Stephan' },
              { value: 'Email', title: 'svv6@cornell.edu' },
            ],
            ai_request: (request: any, respondWith: any) => respondWith.string(() => 
              Promise.reject('See docs to implement AI Assistant')
            ),
          }}
        />
      </div>
    </div>
  );
}