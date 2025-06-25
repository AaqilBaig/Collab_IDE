/**
 * Utility functions for handling project versions and diffs
 */

// Function to create a simplified diff between two versions
export const createDiff = (oldContent, newContent) => {
  if (!oldContent || !newContent) {
    return { type: 'full', content: newContent || '' };
  }
  
  // For simplicity, we're doing a full content comparison
  if (oldContent === newContent) {
    return { type: 'none', content: '' };
  }
  
  // In a real application, you would use a diff algorithm like:
  // - diff-match-patch
  // - jsdiff
  // - Or implement a simple line-by-line diff
  
  return { type: 'full', content: newContent };
};

// Function to apply a diff to a content
export const applyDiff = (content, diff) => {
  if (!diff) {
    return content;
  }
  
  if (diff.type === 'none') {
    return content;
  }
  
  if (diff.type === 'full') {
    return diff.content;
  }
  
  // Handle other diff types if implemented
  return content;
};

// Function to create a version summary
export const createVersionSummary = (version, username, timestamp) => {
  const date = timestamp ? new Date(timestamp) : new Date();
  const formattedDate = date.toLocaleString();
  
  return {
    number: version,
    author: username || 'Anonymous',
    date: formattedDate,
    description: `Version ${version} - ${username || 'Anonymous'} - ${formattedDate}`
  };
};

// Function to generate a random color based on user id
export const getUserColor = (userId) => {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
    '#33FFF6', '#F6FF33', '#FF9833', '#9833FF', '#33FFD4'
  ];
  
  // Use user ID to deterministically pick a color
  const index = userId?.split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  return colors[index || 0];
};

const projectUtils = {
  createDiff,
  applyDiff,
  createVersionSummary,
  getUserColor
};

export default projectUtils;
