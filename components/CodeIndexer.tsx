import { useState, useEffect, useCallback } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { cn } from '@/lib/utils';

// Define the structure of indexed code files
interface CodeFile {
  id: string;
  name: string;
  path: string;
  type: string;
  content?: string;
}

// Define a component for searching and displaying indexed code
export function CodeIndexer() {
  const { files, getItemContent } = useFileSystem();
  const [indexedFiles, setIndexedFiles] = useState<CodeFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<CodeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isIndexing, setIsIndexing] = useState(false);

  // Function to build code index
  const buildCodeIndex = useCallback(async () => {
    setIsIndexing(true);
    
    const codeFiles: CodeFile[] = [];
    
    // Recursively traverse and index files
    const traverseFiles = async (items: any[], path: string = '') => {
      for (const item of items) {
        if (item.type === 'file') {
          // Check if it's a code file by extension
          const fileExt = item.name.split('.').pop()?.toLowerCase();
          const isCodeFile = [
            'js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json', 'md',
            'py', 'c', 'cpp', 'java', 'go', 'rs', 'php', 'rb'
          ].includes(fileExt || '');
          
          if (isCodeFile) {
            const fullPath = path ? `${path}/${item.name}` : item.name;
            codeFiles.push({
              id: item.id,
              name: item.name,
              path: fullPath,
              type: fileExt || 'unknown'
            });
          }
        } else if (item.type === 'folder') {
          // Get children of this folder
          const children = files.filter(f => f.parent === item.id);
          const newPath = path ? `${path}/${item.name}` : item.name;
          await traverseFiles(children, newPath);
        }
      }
    };
    
    // Start with root-level files
    const rootFiles = files.filter(f => !f.parent);
    await traverseFiles(rootFiles);
    
    setIndexedFiles(codeFiles);
    setFilteredFiles(codeFiles);
    setIsIndexing(false);
  }, [files]);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFiles(indexedFiles);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = indexedFiles.filter(file => 
      file.name.toLowerCase().includes(query) || 
      file.path.toLowerCase().includes(query)
    );
    
    setFilteredFiles(filtered);
  }, [searchQuery, indexedFiles]);

  // Load file content when a file is selected
  const loadFileContent = useCallback(async (file: CodeFile) => {
    try {
      const content = await getItemContent(file.id);
      setFileContent(content || 'No content available');
      setSelectedFile(file);
    } catch (error) {
      console.error('Error loading file content:', error);
      setFileContent('Error loading file content');
    }
  }, [getItemContent]);

  return (
    <div className="flex h-full">
      {/* Sidebar for search and file list */}
      <div className="w-1/3 h-full bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search files..."
              className="flex-1 bg-gray-900 text-white px-3 py-2 rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
              onClick={buildCodeIndex}
              disabled={isIndexing}
            >
              {isIndexing ? 'Indexing...' : 'Index'}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {indexedFiles.length} files indexed
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              className={cn(
                "p-2 border-b border-gray-700 hover:bg-gray-700 cursor-pointer text-sm",
                selectedFile?.id === file.id && "bg-gray-700"
              )}
              onClick={() => loadFileContent(file)}
            >
              <div className="font-medium text-white">{file.name}</div>
              <div className="text-xs text-gray-400">{file.path}</div>
            </div>
          ))}
          
          {filteredFiles.length === 0 && (
            <div className="p-4 text-gray-400 text-center">
              {isIndexing ? 'Indexing files...' : 'No files found. Click "Index" to start.'}
            </div>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 h-full bg-gray-900 flex flex-col">
        {selectedFile ? (
          <>
            <div className="bg-gray-800 p-3 border-b border-gray-700 text-white">
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-xs text-gray-400">{selectedFile.path}</div>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-white text-sm font-mono bg-gray-900 whitespace-pre-wrap">
              {fileContent}
            </pre>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a file to view its content
          </div>
        )}
      </div>
    </div>
  );
} 