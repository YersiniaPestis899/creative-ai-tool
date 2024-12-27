import React from 'react';
import { ClipboardCopy, Trash2 } from 'lucide-react';

const StoryGenerationControls = ({ result, onClear }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      // Toastやアラートを追加する場合はここに実装
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex justify-end gap-4 mt-4">
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <ClipboardCopy className="h-4 w-4" />
        <span>コピー</span>
      </button>
      
      <button
        onClick={onClear}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Trash2 className="h-4 w-4" />
        <span>クリア</span>
      </button>
    </div>
  );
};

export default StoryGenerationControls;