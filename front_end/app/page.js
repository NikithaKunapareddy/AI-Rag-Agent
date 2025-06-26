'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [showSteps, setShowSteps] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isWebsiteMode, setIsWebsiteMode] = useState(false);
  const [loadingMode, setLoadingMode] = useState('rag_search');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);


  // API base URL - your Flask server
    // API base URL - your Flask server
  
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  // DEBUG: Test environment variables and connection
  console.log('🔍 =================================');
  console.log('🔍 AI ASSISTANT DEBUG INFORMATION');
  console.log('🔍 =================================');
  console.log('🔍 API_BASE:', API_BASE);
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('🔍 Window location:', typeof window !== 'undefined' ? window.location.href : 'server-side');
  console.log('🔍 Is localhost?:', API_BASE.includes('localhost'));
  console.log('🔍 =================================');

  // Test backend connection immediately on component mount
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        console.log('🧪 Testing backend connection...');
        console.log('🔗 Attempting to connect to:', `${API_BASE}/health`);
        
        const response = await fetch(`${API_BASE}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend connection successful!');
          console.log('📋 Backend health data:', data);
        } else {
          console.error('❌ Backend response not OK:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Backend connection failed!');
        console.error('❌ Error details:', error);
        console.error('❌ URL attempted:', `${API_BASE}/health`);
        console.error('❌ Error type:', error.name);
        console.error('❌ Error message:', error.message);
      }
    };
    
    testBackendConnection();
  }, []); // Empty dependency array - runs once on mount

  
  useEffect(() => {
    // Check if user is signed in
    const savedEmail = localStorage.getItem('chatbot_user_email');
    if (savedEmail) {
      setUserEmail(savedEmail);
      setIsSignedIn(true);
      loadConversations(savedEmail);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const signIn = async () => {
    if (!userEmail) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    localStorage.setItem('chatbot_user_email', userEmail);
    setIsSignedIn(true);
    await loadConversations(userEmail);
  };
const WebSearchOnlyLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="web-search-link"
    style={{
      color: '#2563eb', // Tailwind blue-600
      textDecoration: 'underline',
      fontWeight: 500,
      wordBreak: 'break-all'
    }}
  >
    {children}
  </a>
);
  const loadConversations = async (email) => {
    try {
      const response = await axios.post(`${API_BASE}/api/conversations`, {
        user_email: email
      });
      if (response.data.conversations) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };  const loadConversationMessages = async (conversationId) => {
    try {
      const response = await axios.post(`${API_BASE}/api/conversation/${conversationId}/messages`);
      if (response.data.messages) {
        // Transform database messages to frontend format
        const transformedMessages = [];        response.data.messages.forEach(msg => {
          
          if (msg.role === 'user') {            // User message
            transformedMessages.push({
              id: `${msg.id}-user`,
              role: 'user',
              content: msg.content,
              timestamp: msg.created_at
            });
          } 
          
// ...existing code...
else if (msg.role === 'assistant') {
  const assistantContent = msg.content || msg.ai_response || 'Assistant response';

  let mode = msg.mode || msg.query_type || 'regular_search';
  if (
    (msg.query_type && msg.query_type.trim().toLowerCase() === 'website_summary') ||
    (assistantContent && (
      assistantContent.includes('Summary generated on') ||
      assistantContent.includes('Comprehensive YouTube Video Analysis')
    ))
  ) {
    mode = 'website_summary';
  }
  else if (
    (msg.mode && msg.mode === 'web_search_only') ||
    (msg.query_type && msg.query_type.trim().toLowerCase() === 'web_search_only')
  ) {
    mode = 'web_search_only';
  }
  // Debug log
  console.log('Assistant message:', { mode, assistantContent, msg });

  transformedMessages.push({
    id: `${msg.id}-assistant`,
    role: 'assistant',
    content: assistantContent,
    timestamp: msg.created_at,
    web_results: msg.web_results || [],
    rag_context: msg.rag_context || '',
    mode
  });
}
// ...existing code...
          else if (msg.role === 'system') {
            // System message
            transformedMessages.push({
              id: `${msg.id}-system`,
              role: 'system',
              content: msg.content,
              timestamp: msg.created_at
            });
          }        });
        
        setMessages(transformedMessages);
        setCurrentConversation(conversationId);
        
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startNewConversation = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/conversation/new`, {
        user_email: userEmail
      });
      
      if (response.data.conversation) {
        setMessages([]);
        setCurrentConversation(response.data.conversation.id);
        
        await loadConversations(userEmail);
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
      // Fallback: clear current conversation
      setMessages([]);
      setCurrentConversation(null);
      
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`${API_BASE}/api/conversation/${conversationId}`);
      
      // Reload conversations
      await loadConversations(userEmail);
      
      // If deleted conversation was current, clear messages
      if (currentConversation === conversationId) {
        setMessages([]);
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const allowedExtensions = ['.txt', '.pdf', '.docx', '.doc', '.md'];
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    
    if (!isValidType) {
      setUploadStatus('❌ Please upload a text file (.txt, .md, .pdf, .doc, .docx)');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    // Check file size (16MB limit)
    if (file.size > 16 * 1024 * 1024) {
      setUploadStatus('❌ File too large. Maximum size is 16MB');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    setIsUploading(true);
    setUploadStatus('📤 Uploading document...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_email', userEmail);
      formData.append('conversation_id', currentConversation);

      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        setUploadStatus('✅ Document uploaded successfully! You can now ask questions about it.');
        
        // FIXED: Add a simple system message instead of a complex assistant message
        const systemMessage = {
          id: Date.now().toString(),
          role: 'system', // Changed from 'assistant' to 'system'
          content: `📄 Document "${file.name}" has been uploaded and analyzed! You can now ask me questions about its content and I'll use it in my responses along with web search.`,
          timestamp: new Date().toISOString(),
          isUploadConfirmation: true // Add flag to identify upload messages
        };
        setMessages(prev => [...prev, systemMessage]);
        
        // Reload conversations to update sidebar
        await loadConversations(userEmail);
      } else {
        setUploadStatus(`❌ Upload failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('❌ Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(''), 5000);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const sendMessage = async () => {
    if (!input.trim() || !isSignedIn || isLoading) return;
      const mode = getLoadingMode();
      setLoadingMode(mode);

  

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);


    try {
      console.log('🚀 Sending request to:', `${API_BASE}/api/news`);
      console.log('📝 Request data:', { 
        query: input, 
        user_email: userEmail, 
        conversation_id: currentConversation,
        chatHistory: messages 
      });
      
      const response = await axios.post(`${API_BASE}/api/news`, {
        query: input,
        user_email: userEmail,
        conversation_id: currentConversation, // Send current conversation ID
        chatHistory: messages
      }, {
        timeout: 60000, // 60 second timeout
        headers: {
          'Content-Type': 'application/json'
        }      });

       console.log('🟢 Backend response:', response.data);



    if (response.data.status === 'success') {
      const aiResponse = response.data.result || response.data.ai_response;
      const backendMode = response.data.mode || 'regular_search';

      // Set showSteps based on backend mode
      setShowSteps(backendMode === 'rag_search');

      setLoadingMode(backendMode);
      

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        web_results: response.data.web_results,
        rag_context: response.data.rag_context,
        mode: backendMode
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (response.data.conversation_id && response.data.conversation_id !== currentConversation) {
        setCurrentConversation(response.data.conversation_id);
      }
   
        // Reload conversations to update sidebar
        await loadConversations(userEmail);
      }} catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config,
        stack: error.stack
      });

      let errorContent = 'Sorry, I encountered an error. Please try again.';
      
      // Provide more specific error messages based on error type
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorContent = 'Network error: Unable to connect to the backend server. Please check if the backend is running on port 8080.';
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const statusText = error.response.statusText;
        const responseData = error.response.data;
        
        errorContent = `Server error (${status} ${statusText}): ${
          typeof responseData === 'string' 
            ? responseData 
            : responseData?.error || responseData?.message || 'Unknown server error'
        }`;
        
        console.error('Server response error:', {
          status,
          statusText,
          data: responseData,
          headers: error.response.headers
        });
      } else if (error.request) {
        // Request was made but no response received
        errorContent = 'No response from server. Please check your internet connection and ensure the backend server is running.';
        console.error('Request made but no response:', error.request);
      } else {
        // Something else happened
        errorContent = `Request setup error: ${error.message}`;
      }

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }finally {
      setIsLoading(false);
      setShowSteps(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const signOut = () => {
    localStorage.removeItem('chatbot_user_email');
    setUserEmail('');
    setIsSignedIn(false);
    setMessages([]);
    setConversations([]);
    setCurrentConversation(null);
    
  };
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'just now';
    
    try {
      const now = new Date();
      const messageDate = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(messageDate.getTime())) {
        return 'just now';
      }
      
      const diffInSeconds = Math.floor((now - messageDate) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'just now';
    }
  };

  // Function to detect if input contains URLs
  const containsURL = (text) => {
    const urlPatterns = [
      /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+(?:&[\w=&-]*)?/gi,
      /https?:\/\/youtu\.be\/[\w-]+(?:\?[\w=&-]*)?/gi,
      /https?:\/\/[^\s]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi,
      /http:\/\/[^\s]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi,
      /www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi
    ];
    
    return urlPatterns.some(pattern => pattern.test(text));
  };



const getLoadingMode = () => {
  if (input && containsURL(input)) return 'website_summary';

  // Robust summary detection (matches backend)
  const summaryPatterns = [
    /\bsummar(y|ize|ising|izing)\b.*\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|this|presentation|ppt|pptx)\b/i,
    /\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b.*\bsummar(y|ize|ising|izing)\b/i,
    /\bsummary.*(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
    /\b(main\s+points?|key\s+points?|gist|overview|highlights|abstract|outline|synopsis|recap|brief|short\s+version|tl;dr|core\s+idea|core\s+ideas|important\s+points?)\b.*\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
    /\btell\s+me\s+about\b.*\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
    /\bcan\s+you\s+(summar(y|ize)|give.*summary|give.*main\s+points?|give.*overview|give.*gist|give.*abstract|give.*highlights|give.*outline|give.*synopsis|give.*recap|give.*brief|give.*short\s+version|give.*tl;dr|give.*core\s+idea|give.*important\s+points?)\b.*(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
    /\bshow\s+me\s+(the\s+)?(summary|main\s+points?|overview|gist|abstract|highlights|outline|synopsis|recap|brief|short\s+version|tl;dr|core\s+idea|important\s+points?)\b.*(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
    /\bsummar(y|ize|ising|izing)\s+(this|that|it)\b/i,
    /\bcan\s+you\s+summarize\b/i,
    /\bplease\s+summarize\b/i,
    /\bsummary\b/i,
    /\bsummarize\b/i,
    /\btl;dr\b/i,
    /\btl\s+dr\b/i,
    /\bshort\s+version\b/i,
    /\bquick\s+summary\b/i,
    /\bquick\s+overview\b/i,
    /\bbrief\s+summary\b/i,
    /\bbrief\s+overview\b/i,
    /\bexecutive\s+summary\b/i,
    /\bkey\s+points\b/i,
    /\bmain\s+points\b/i,
    /\bimportant\s+points\b/i,
    /\bcore\s+ideas\b/i,
    /\bcore\s+idea\b/i,
    /\bmain\s+idea\b/i,
    /\bmain\s+ideas\b/i,
    /\bcentral\s+idea\b/i,
    /\bcentral\s+ideas\b/i,
    /\bkey\s+takeaways\b/i,
    /\bkey\s+takeaway\b/i,
    /\bmajor\s+points\b/i,
    /\bmajor\s+ideas\b/i,
    /\bmajor\s+takeaway\b/i,
    /\bmajor\s+takeaways\b/i,
    /\bmain\s+takeaway\b/i,
    /\bmain\s+takeaways\b/i,
    /\bmain\s+message\b/i,
    /\bmain\s+messages\b/i,
    /\bsummary\s+please\b/i,
    /\bcan\s+you\s+give\s+me\s+a\s+summary\b/i,
    /\bgive\s+me\s+a\s+summary\b/i,
    /\bprovide\s+a\s+summary\b/i,
    /\bprovide\s+an\s+overview\b/i,
    /\bcan\s+you\s+provide\s+an\s+overview\b/i,
    /\bgive\s+me\s+an\s+overview\b/i,
    /\bcan\s+you\s+give\s+me\s+an\s+overview\b/i,
    /\bwhat\s+is\s+the\s+summary\b/i,
    /\bwhat\s+is\s+the\s+overview\b/i,
    /\bwhat\s+is\s+the\s+gist\b/i,
    /\bwhat\s+is\s+the\s+abstract\b/i,
    /\bwhat\s+is\s+the\s+main\s+point\b/i,
    /\bwhat\s+are\s+the\s+main\s+points\b/i,
    /\bwhat\s+are\s+the\s+key\s+points\b/i,
    /\bwhat\s+are\s+the\s+highlights\b/i,
    /\bwhat\s+are\s+the\s+takeaways\b/i,
    /\bwhat\s+is\s+the\s+takeaway\b/i,
    /\bwhat\s+is\s+the\s+main\s+takeaway\b/i,
    /\bwhat\s+is\s+the\s+core\s+idea\b/i,
    /\bwhat\s+are\s+the\s+core\s+ideas\b/i,
    /\bwhat\s+is\s+the\s+central\s+idea\b/i,
    /\bwhat\s+are\s+the\s+central\s+ideas\b/i,
    /\bwhat\s+is\s+the\s+main\s+message\b/i,
    /\bwhat\s+are\s+the\s+main\s+messages\b/i,
    /\bwhat\s+is\s+the\s+main\s+idea\b/i,
    /\bwhat\s+are\s+the\s+main\s+ideas\b/i,

  /\bsummar(y|ize|ising|izing)\b.*\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|this|presentation|ppt|pptx)\b/i,
  /\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b.*\bsummar(y|ize|ising|izing)\b/i,
  /\bsummary.*(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  /\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx).*summary\b/i,
  // Requests for main points, gist, overview, etc.
  /\b(main\s+points?|key\s+points?|gist|overview|highlights|abstract|outline|synopsis|recap|brief|short\s+version|tl;dr|core\s+idea|core\s+ideas|important\s+points?)\b.*\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  /\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b.*\b(main\s+points?|key\s+points?|gist|overview|highlights|abstract|outline|synopsis|recap|brief|short\s+version|tl;dr|core\s+idea|core\s+ideas|important\s+points?)\b/i,
  // Requests for explanation, description, details
  /\b(explain|describe|details?|elaborate|clarify|interpret|analyze|analyz(e|ing)|review|scan|look\s+at|go\s+through|check|inspect|parse|interpret)\b.*\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  /\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b.*\b(explain|describe|details?|elaborate|clarify|interpret|analyze|analyz(e|ing)|review|scan|look\s+at|go\s+through|check|inspect|parse|interpret)\b/i,
  // Requests for what is in/about the document
  /\bwhat.*(in|about|inside|contained\s+in|contained\s+within|context|say|says|is\s+there|is\s+inside|is\s+this|is\s+that).*(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  /\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b.*(about|contain|inside|within|include|consist\s+of|comprise|context|say|says|is\s+there|is\s+inside|is\s+this|is\s+that)\b/i,
  // Requests for reading, reviewing, analyzing
  /\b(read|review|analyze|scan|look\s+at|go\s+through|check|inspect|parse|interpret)\b.*\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  // Requests for "tell me about"
  /\btell\s+me\s+about\b.*\b(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  // Requests for "can you summarize"
  /\bcan\s+you\s+(summar(y|ize)|give.*summary|give.*main\s+points?|give.*overview|give.*gist|give.*abstract|give.*highlights|give.*outline|give.*synopsis|give.*recap|give.*brief|give.*short\s+version|give.*tl;dr|give.*core\s+idea|give.*important\s+points?)\b.*(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  // Requests for "show me the summary"
  /\bshow\s+me\s+(the\s+)?(summary|main\s+points?|overview|gist|abstract|highlights|outline|synopsis|recap|brief|short\s+version|tl;dr|core\s+idea|important\s+points?)\b.*(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  // Requests for "summarize this"
  /\bsummar(y|ize|ising|izing)\s+(this|that|it)\b/i,
  /\bcan\s+you\s+summarize\b/i,
  /\bplease\s+summarize\b/i,
  /\bsummary\b/i,
  /\bsummarize\b/i,
  // Requests for "what is this about"
  /\bwhat\s+is\s+this\s+(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\s+about\b/i,
  /\bwhat\s+does\s+this\s+(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\s+say\b/i,
  /\bwhat\s+is\s+contained\s+in\s+this\s+(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  // Requests for "briefly explain"
  /\bbriefly\s+(explain|describe|summarize)\b.*(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  // Requests for "in short"
  /\bin\s+short\b.*(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  // Requests for "tl;dr"
  /\btl;dr\b/i,
  /\btl\s+dr\b/i,
  // Standalone summary/gist/overview/abstract/points
  /\bshort\s+version\b/i,
  /\bquick\s+summary\b/i,
  /\bquick\s+overview\b/i,
  /\bbrief\s+summary\b/i,
  /\bbrief\s+overview\b/i,
  /\bexecutive\s+summary\b/i,
  /\babstract\b/i,
  /\bhighlights\b/i,
  /\bkey\s+points\b/i,
  /\bmain\s+points\b/i,
  /\bimportant\s+points\b/i,
  /\bcore\s+ideas\b/i,
  /\bcore\s+idea\b/i,
  /\bmain\s+idea\b/i,
  /\bmain\s+ideas\b/i,
  /\bcentral\s+idea\b/i,
  /\bcentral\s+ideas\b/i,
  /\bkey\s+takeaways\b/i,
  /\bkey\s+takeaway\b/i,
  /\bmajor\s+points\b/i,
  /\bmajor\s+ideas\b/i,
  /\bmajor\s+takeaway\b/i,
  /\bmajor\s+takeaways\b/i,
  /\bmain\s+takeaway\b/i,
  /\bmain\s+takeaways\b/i,
  /\bmain\s+message\b/i,
  /\bmain\s+messages\b/i,
  /\bsummary\s+please\b/i,
  /\bcan\s+you\s+give\s+me\s+a\s+summary\b/i,
  /\bgive\s+me\s+a\s+summary\b/i,
  /\bprovide\s+a\s+summary\b/i,
  /\bprovide\s+an\s+overview\b/i,
  /\bcan\s+you\s+provide\s+an\s+overview\b/i,
  /\bgive\s+me\s+an\s+overview\b/i,
  /\bcan\s+you\s+give\s+me\s+an\s+overview\b/i,
  // New patterns for more flexibility
  /\bwhat\s+is\s+the\s+summary\b/i,
  /\bwhat\s+is\s+the\s+overview\b/i,
  /\bwhat\s+is\s+the\s+gist\b/i,
  /\bgist\b/i,
  /\bwhat\s+is\s+the\s+abstract\b/i,
  /\bwhat\s+is\s+the\s+main\s+point\b/i,
  /\bwhat\s+are\s+the\s+main\s+points\b/i,
  /\bwhat\s+are\s+the\s+key\s+points\b/i,
  /\bwhat\s+are\s+the\s+highlights\b/i,
  /\bwhat\s+are\s+the\s+takeaways\b/i,
  /\bwhat\s+is\s+the\s+takeaway\b/i,
  /\bwhat\s+is\s+the\s+main\s+takeaway\b/i,
  /\bwhat\s+is\s+the\s+core\s+idea\b/i,
  /\bwhat\s+are\s+the\s+core\s+ideas\b/i,
  /\bwhat\s+is\s+the\s+central\s+idea\b/i,
  /\bwhat\s+are\s+the\s+central\s+ideas\b/i,
  /\bwhat\s+is\s+the\s+main\s+message\b/i,
  /\bwhat\s+are\s+the\s+main\s+messages\b/i,
  /\bwhat\s+is\s+the\s+main\s+idea\b/i,
  /\bwhat\s+are\s+the\s+main\s+ideas\b/i,
  /\bwhat\s+is\s+this\s+about\b/i,
  /\bwhat\s+is\s+that\s+about\b/i,
  /\bwhat\s+is\s+this\b/i,
  /\bwhat\s+is\s+that\b/i,
  /\bwhat\s+does\s+this\s+(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\s+say\b/i,
  /\bwhat\s+does\s+this\s+say\b/i,
  /\bwhat\s+does\s+it\s+say\b/i,
  /\bwhat\s+is\s+contained\s+in\s+this\s+(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  /\bwhat\s+is\s+inside\s+this\s+(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  /\bwhat\s+content\s+is\s+there\b/i,
  /\bwhat\s+content\s+is\s+there\s+inside\s+(the\s+)?(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  /\bwhat\s+is\s+the\s+context\s+of\s+this\s+(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  /\bwhat\s+is\s+this\s+file\s*s\s+context\b/i,
  /\bcontext\s+of\s+this\s+(doc|document|file|upload|pdf|report|paper|article|content|text|note|notes|slide|slides|presentation|ppt|pptx)\b/i,
  /\bcontext\b/i,
  /\bwhat\s+is\s+the\s+context\b/i,
  /\bwhat\s+is\s+the\s+content\b/i,
  /\bwhat\s+are\s+the\s+contents\b/i,
  /\bcontents\b/i,
  /\bwhat\s+is\s+included\b/i,
  /\bwhat\s+is\s+covered\b/i,
  /\bwhat\s+is\s+discussed\b/i,
  /\bwhat\s+is\s+explained\b/i,
  /\bwhat\s+is\s+described\b/i,
  /\bwhat\s+is\s+presented\b/i,
  /\bwhat\s+is\s+outlined\b/i,
  /\bwhat\s+is\s+summarized\b/i,
  /\bwhat\s+is\s+reviewed\b/i,
  /\bwhat\s+is\s+analyzed\b/i,
  /\bwhat\s+is\s+interpreted\b/i,
  /\bwhat\s+is\s+elaborated\b/i,
  /\bwhat\s+is\s+clarified\b/i,
  /\bwhat\s+is\s+detailed\b/i,
  /\bwhat\s+is\s+the\s+outline\b/i,
  /\bwhat\s+is\s+the\s+synopsis\b/i,
  /\bwhat\s+is\s+the\s+recap\b/i,
  /\bwhat\s+is\s+the\s+brief\b/i,
  /\bwhat\s+is\s+the\s+short\s+version\b/i,
  /\bwhat\s+is\s+the\s+quick\s+summary\b/i,
  /\bwhat\s+is\s+the\s+quick\s+overview\b/i,
  /\bwhat\s+is\s+the\s+executive\s+summary\b/i,
  /\bwhat\s+is\s+the\s+abstract\b/i,
  /\bwhat\s+is\s+the\s+highlight\b/i,
  /\bwhat\s+are\s+the\s+highlights\b/i,
  /\bwhat\s+is\s+the\s+key\s+point\b/i,
  /\bwhat\s+are\s+the\s+key\s+points\b/i,
  /\bwhat\s+is\s+the\s+main\s+point\b/i,
  /\bwhat\s+are\s+the\s+main\s+points\b/i,
  /\bwhat\s+is\s+the\s+important\s+point\b/i,
  /\bwhat\s+are\s+the\s+important\s+points\b/i,
  /\bwhat\s+is\s+the\s+core\s+idea\b/i,
  /\bwhat\s+are\s+the\s+core\s+ideas\b/i,
  /\bwhat\s+is\s+the\s+central\s+idea\b/i,
  /\bwhat\s+are\s+the\s+central\s+ideas\b/i,
  /\bwhat\s+is\s+the\s+main\s+message\b/i,
  /\bwhat\s+are\s+the\s+main\s+messages\b/i,
  /\bwhat\s+is\s+the\s+main\s+idea\b/i,
  /\bwhat\s+are\s+the\s+main\s+ideas\b/i,
  /\bwhat\s+is\s+the\s+major\s+point\b/i,
  /\bwhat\s+are\s+the\s+major\s+points\b/i,
  /\bwhat\s+is\s+the\s+major\s+idea\b/i,
  /\bwhat\s+are\s+the\s+major\s+ideas\b/i,
  /\bwhat\s+is\s+the\s+major\s+takeaway\b/i,
  /\bwhat\s+are\s+the\s+major\s+takeaways\b/i,
  /\bwhat\s+is\s+the\s+main\s+takeaway\b/i,
  /\bwhat\s+are\s+the\s+main\s+takeaways\b/i,
  /\bwhat\s+is\s+the\s+key\s+takeaway\b/i,
  /\bwhat\s+are\s+the\s+key\s+takeaways\b/i,
  /\bwhat\s+is\s+the\s+main\s+message\b/i,
  /\bwhat\s+are\s+the\s+main\s+messages\b/i,
  /\bwhat\s+is\s+the\s+main\s+idea\b/i,
  /\bwhat\s+are\s+the\s+main\s+ideas\b/i,
];

  if (input && summaryPatterns.some((pat) => pat.test(input))) {
    return 'document_summary';
  }



  // For any other input, always let backend decide (default to 'rag_search' for loading animation)
  if (input && input.trim().length > 0) {
    return 'rag_search';
  }




  return 'rag_search';
};

// ENHANCED: Component to display web search results
// ...existing code...

// Step 1: WebSearchResults (remove number and "Found X relevant..." line)
const WebSearchResults = ({ webResults }) => {
  if (!webResults || webResults.length === 0) return null;

  return (
    <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-orange-900/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'} border-2`}>
      <div className="flex items-center space-x-2 mb-3">
       
        <h4 className={`font-semibold ${isDark ? 'text-orange-200' : 'text-orange-800'}`}>
          STEP 1: Universal Web Search Results
        </h4>
      </div>
      {/* Removed: <p>Found X relevant results...</p> */}
      <div className="space-y-4">
        {webResults.slice(0, 5).map((result, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border transition-all duration-200 hover:shadow-lg`}
          >
            <div className="flex items-start space-x-3">
              {/* Removed: Numbered circle */}
              <div className="flex-1">
                <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2 leading-tight`}>
                  {result.title}
                </h5>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3 leading-relaxed`}>
                  {result.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <span>📁</span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                        Source: {result.source || 'Web Source'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                        Published: {new Date(result.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center space-x-1 hover:underline"
                  >
                    <span>🔗</span>
                    <span>Read Full Article</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Step 2: DocumentAnalysisResults (remove 🧠 icon and "AI is analyzing..." line)
const DocumentAnalysisResults = ({ ragContext }) => {
  return (
    <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border-2`}>
      <div className="flex items-center space-x-2 mb-3">
        <h4 className={`font-semibold ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
          STEP 2: Document Analysis
        </h4>
      </div>
      {/* Removed: <p>AI is analyzing...</p> and 🧠 icon */}
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Document Context
          </h5>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
            {ragContext && ragContext.trim() && !ragContext.includes('unavailable') && !ragContext.includes('No relevant')
              ? (ragContext.length > 300 ? ragContext.substring(0, 300) + '...' : ragContext)
              : 'No relevant document context found. Upload a document to enable this step.'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Step 3: AIResponseGeneration (remove equation, "Source: Sarvam AI", and "Context-Aware Generation")
const AIResponseGeneration = ({ aiResponse, isLoading = false }) => {
  return (
    <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'} border-2`}>
      <div className="flex items-center space-x-2 mb-3">
        <h4 className={`font-semibold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
          STEP 3: Detailed RAG-Based Response
        </h4>
      </div>
      <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'} mb-4`}>
        AI analyzed web results and documents to generate this response
      </p>
      {isLoading ? (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Generating intelligent response...
            </span>
          </div>
        </div>
      ) : aiResponse ? (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                AI-Generated Response
              </h5>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiResponse}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border`}>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500">⚠️</span>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Response generation in progress...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

 


  if (!isSignedIn) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-all duration-500`}>
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} backdrop-blur-lg rounded-3xl p-8 max-w-md w-full mx-4 border shadow-2xl transition-all duration-300 transform hover:scale-105`}>
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <span className="text-3xl animate-bounce">✨</span>
              </div>
              
            </div>
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
              AI Assistant
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
              Sign in to start your AI journey!
            </p>
            <div className="flex items-center justify-center mt-4 space-x-2 text-sm">
              <span className="text-blue-500 animate-pulse">🌐 Web Search</span>
              <span className={`${isDark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
              <span className="text-purple-500 animate-pulse">🧠 Document AI</span>
              <span className={`${isDark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
              <span className="text-green-500 animate-pulse">💬 Smart Response</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'} border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-12`}
                onKeyPress={(e) => e.key === 'Enter' && signIn()}
              />
              <span className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>👤</span>
            </div>
            <button
              onClick={signIn}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold py-4 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              🚀 Start Your AI Journey
            </button>
            <div className="flex items-center justify-center mt-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-3 rounded-xl ${isDark ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'} transition-all duration-200 hover:scale-110`}
              >
                <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.pdf,.doc,.docx,.md"
        style={{ display: 'none' }}
      />

      {/* Enhanced Glass Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-80 flex flex-col overflow-hidden transition-all duration-300 transform md:relative md:transform-none ${sidebarOpen ? 'translate-x-0 md:w-80' : '-translate-x-full md:w-0'}`}>
        {/* Glass effect background */}
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-gray-900/80 backdrop-blur-xl border-gray-700/50' 
            : 'bg-white/80 backdrop-blur-xl border-gray-200/50'
        } border-r shadow-2xl`}></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header Section */}
          <div className={`p-6 ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'} border-b backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${isDark ? 'text-white' : 'text-gray-900'} text-xl font-bold flex items-center`}>
                <span className="mr-3 text-2xl">📚</span>
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Conversations
                </span>
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={startNewConversation}
                  className={`w-12 h-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 backdrop-blur-sm flex items-center justify-center ${
                    isDark
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-yellow-400 hover:to-violet-400'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-yellow-400 hover:to-violet-400'
                  }`}
                >
                  <span className="text-lg">➕</span>
                </button>
                <button onClick={() => setSidebarOpen(false)} className={`md:hidden p-2 rounded-xl ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'} transition-all duration-200 hover:scale-110 backdrop-blur-sm`}>
                  <span className={`text-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>X</span>
                </button>
              </div>
            </div>
            
            {/* User Info Card with better email handling */}
            <div className={`flex items-center justify-between text-sm p-4 rounded-xl ${
              isDark 
                ? 'bg-gray-800/60 border border-gray-700/50' 
                : 'bg-white/60 border border-gray-200/50'
            } backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}>
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
                  <span className="text-white text-sm">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                    {userEmail}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Active User
                  </div>
                </div>
              </div>
              <button 
                onClick={signOut} 
                className={`${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                } transition-colors duration-200 p-2 rounded-lg hover:bg-gray-500/10 text-xs font-medium flex-shrink-0`}
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500/30 scrollbar-track-transparent">
            {conversations.map((conv, index) => (
              <div
                key={conv.id}
                className={`group relative p-4 cursor-pointer transition-all duration-200 ${
                  isDark ? 'hover:bg-gray-800/40' : 'hover:bg-white/40'
                } ${
                  currentConversation === conv.id 
                    ? isDark 
                      ? 'bg-gray-800/60 border-r-4 border-blue-500/80 shadow-lg' 
                      : 'bg-blue-50/60 border-r-4 border-blue-500/80 shadow-lg'
                    : ''
                } backdrop-blur-sm hover:transform hover:scale-[1.02]`}
                style={{ 
                  animation: `slideInFromLeft 0.3s ease-out ${index * 50}ms both`
                }}
              >
                <div 
                  onClick={() => loadConversationMessages(conv.id)}
                  className="flex-1"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">💬</span>
                    <div className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium text-sm leading-tight flex-1 min-w-0`}>
                      <div className="truncate">
                        {conv.title}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center space-x-3`}>
                    <span>{formatTimeAgo(conv.last_message_at)}</span>
                    <span>•</span>
                    <span>{conv.total_messages} messages</span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 rounded-lg ${
                    isDark 
                      ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' 
                      : 'hover:bg-red-500/10 text-gray-500 hover:text-red-500'
                  } transition-all duration-200 hover:scale-110 backdrop-blur-sm`}
                  title="Delete Conversation"
                >
                  <span className="text-lg">🗑️</span>
                </button>
              </div>
            ))}
            
            {conversations.length === 0 && (
              <div className="p-6 text-center backdrop-blur-sm">
                <span className={`text-6xl ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-3 block animate-bounce`}>💬</span>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm leading-relaxed`}>
                  No conversations yet.<br />
                  Start chatting to create your first conversation!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Backdrop for mobile when sidebar is open */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}


      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800/90 border-gray-700/50' : 'bg-white/90 border-gray-200/50'} border-b p-4 flex items-center justify-between transition-colors duration-300 shadow-sm backdrop-blur-xl`}>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'} transition-all duration-200 hover:scale-110 backdrop-blur-sm`}
            >
              <span className={`text-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>☰</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-lg animate-bounce">✨</span>
              </div>
              <div>
                <h1 className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>AI Assistant</h1>
                <p className={`text-xs hidden sm:block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>World-class AI conversations</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>3-Step AI Process</span>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
  className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'} transition-all duration-200 hover:scale-110 backdrop-blur-sm`}
            >
              <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-20" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-4xl animate-bounce">✨</span>
              </div>
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
                Welcome to AI Assistant
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg mb-6`}>
                Start a conversation 
              </p>
              
            </div>
          )}
          
{messages.map((message, index) => (
  <div
    key={message.id}
    className={`flex items-start space-x-4 ${
      message.role === 'user' ? 'justify-end' : 'justify-start'
    }`}
    style={{
      animation: `slideInFromBottom 0.5s ease-out ${index * 100}ms both`
    }}
  >
    {/* Avatar */}
    {(message.role === 'assistant' || message.role === 'system') && (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        message.role === 'system'
          ? isDark
            ? 'bg-green-600'
            : 'bg-green-500'
          : message.isError
          ? 'bg-gradient-to-r from-red-500 to-red-600'
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
      }`}>
        <span className="text-white text-sm">
          {message.role === 'system' ? '✓' : message.isError ? '⚠️' : '🤖'}
        </span>
      </div>
    )}

    <div className={`max-w-4xl ${
      message.role === 'user'
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-lg shadow-lg'
        : message.role === 'system'
        ? isDark
          ? 'bg-green-900/30 border border-green-600/30 rounded-2xl rounded-bl-lg'
          : 'bg-green-50 border border-green-200 rounded-2xl rounded-bl-lg'
        : message.isError
        ? isDark
          ? 'bg-red-900/30 border border-red-600/30 rounded-2xl rounded-bl-lg text-red-200'
          : 'bg-red-50 border border-red-200 rounded-2xl rounded-bl-lg text-red-800'
        : isDark
          ? 'bg-gray-800 text-white rounded-2xl rounded-bl-lg border border-gray-700 shadow-lg'
          : 'bg-white text-gray-900 rounded-2xl rounded-bl-lg border border-gray-200 shadow-lg'
    } p-4 transition-all duration-300`}>

      {/* USER MESSAGE */}
      {message.role === 'user' && (
        <div className="prose prose-sm max-w-none">
          <div className="text-white">
            {message.content}
          </div>
        </div>
      )}

      {/* SYSTEM MESSAGE (upload confirmation) */}
      {message.role === 'system' && (
        <div className="flex items-center space-x-3">
          <div>
            <div className={`font-medium ${
              isDark ? 'text-green-300' : 'text-green-700'
            }`}>
              Document uploaded successfully
            </div>
            <div className={`text-sm ${
              isDark ? 'text-green-400 opacity-80' : 'text-green-600 opacity-90'
            }`}>
              You can now ask questions about your document
            </div>
          </div>
        </div>
      )}

      {/* ASSISTANT MESSAGE: Document summary mode */}
{message.role === 'assistant' && message.mode === 'document_summary' && (
  <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'} border ${isDark ? 'border-green-500/30' : 'border-green-200'}`}>
    <div className="flex items-center space-x-2 mb-3">
      <span className="text-xl">📄</span>
      <h4 className={`font-semibold ${isDark ? 'text-green-200' : 'text-green-800'}`}>
        Document summary
      </h4>
    </div>
    <div className="prose max-w-none prose-sm prose-slate dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {message.content}
      </ReactMarkdown>
    </div>
  </div>
)}

      {/* ASSISTANT MESSAGE: Error */}
      {message.role === 'assistant' && message.isError && (
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            isDark ? 'bg-red-800/30' : 'bg-red-100'
          }`}>
            <span className="text-red-500 text-lg">⚠️</span>
          </div>
          <div className="flex-1">
            <div className={`font-medium text-sm mb-2 ${
              isDark ? 'text-red-300' : 'text-red-700'
            }`}>
              Connection Error
            </div>
            <div className={`text-sm leading-relaxed ${
              isDark ? 'text-red-200' : 'text-red-800'
            }`}>
              {message.content}
            </div>
            <div className={`mt-3 p-3 rounded-lg text-xs ${
              isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'
            }`}>
              💡 <strong>Troubleshooting tips:</strong>
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li>Check if the backend server is running on port 8080</li>
                <li>Verify your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Check the browser console for more details</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ASSISTANT MESSAGE: Website summary mode */}
      {message.role === 'assistant' && message.mode === 'website_summary' && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDark ? 'border-blue-500/30' : 'border-blue-200'}`}>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">🌐</span>
            <h4 className={`font-semibold ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              Website Summary
            </h4>
          </div>
          <div className="prose max-w-none prose-sm prose-slate dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      )}


{/* ASSISTANT MESSAGE: Regular search (3-step UI) */}
{message.role === 'assistant' && 
  (
    !message.mode ||
    message.mode === 'regular_search' ||
    message.mode === 'rag_search'
  ) && !message.isError && (
  <>
    {/* Web results if present */}
    {message.web_results && message.web_results.length > 0 && (
      <WebSearchResults webResults={message.web_results} />
    )}
    {/* Document analysis if present */}
    <DocumentAnalysisResults ragContext={message.rag_context} />
    {/* Step 3: AI response */}
    <AIResponseGeneration 
      aiResponse={message.content} 
      isLoading={false}
    />
  </>
)}

{/* ASSISTANT MESSAGE: Web search only (simple response, no steps) */}


{message.role === 'assistant' && message.mode === 'web_search_only' && !message.isError && (
  <div className="prose max-w-full prose-sm prose-slate dark:prose-invert break-words whitespace-pre-wrap">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: WebSearchOnlyLink,
        code({node, inline, className, children, ...props}) {
          return !inline ? (
            <pre className="overflow-x-auto rounded-lg bg-gray-900 text-white p-3 my-2 text-sm">
              <code {...props}>{children}</code>
            </pre>
          ) : (
            <code className="bg-gray-200 dark:bg-gray-800 rounded px-1 break-words">{children}</code>
          );
        }
      }}
    >
      {message.content}
    </ReactMarkdown>
  </div>
)}




      {/* Timestamp and mode info */}
      <div className={`mt-2 text-xs flex items-center space-x-2 ${
        message.role === 'user'
          ? 'text-blue-100'
          : message.role === 'system'
          ? isDark ? 'text-green-400' : 'text-green-600'
          : message.isError
          ? isDark ? 'text-red-400' : 'text-red-600'
          : isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <span>{formatTimeAgo(message.timestamp)}</span>
        {message.role === 'assistant' && !message.isUploadConfirmation && !message.isError && message.mode === 'regular_search' && (
          <>
            
            <div className="inline-flex items-center space-x-1">
              
            </div>
          </>
        )}
        {message.role === 'assistant' && !message.isUploadConfirmation && !message.isError && message.mode === 'website_summary' && (
          <>
          
            <div className="inline-flex items-center space-x-1">
            
            </div>
          </>
        )}
        {message.role === 'assistant' && !message.isUploadConfirmation && !message.isError && message.mode === 'document_summary' && (
          <>
            
            <div className="inline-flex items-center space-x-1">
            
            </div>
          </>
        )}
        {message.isError && (
          <>
            <span> • </span>
            <div className="inline-flex items-center space-x-1">
              <span>❌</span>
              <span>Connection Failed</span>
            </div>
          </>
        )}
      </div>
    </div>

    {/* User avatar */}
    {message.role === 'user' && (
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 animate-pulse">
        <span className="text-white">👤</span>
      </div>
    )}
  </div>
))}



{isLoading && (
  <>
    {/* Website summary loading */}
    {loadingMode === 'website_summary' && (
      <div className="flex items-center space-x-2" style={{ animation: 'fadeInUp 0.5s' }}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center animate-pulse">
          <span className="text-white text-lg">🌐</span>
        </div>
        <div className="rounded-xl px-5 py-4 bg-blue-50 border border-blue-200 shadow flex-1 max-w-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="font-semibold text-blue-700 text-sm">Summarizing website link...</span>
          </div>
          <div className="mt-1 text-blue-500 text-xs">AI is fetching and analyzing the web page for you.</div>
        </div>
      </div>
    )}

    {/* Document summary loading */}
    {loadingMode === 'document_summary' && (
      <div className="flex items-center space-x-2" style={{ animation: 'fadeInUp 0.5s' }}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-400 to-purple-500 flex items-center justify-center animate-pulse">
          <span className="text-white text-lg">📄</span>
        </div>
        <div className="rounded-xl px-5 py-4 bg-green-50 border border-green-200 shadow flex-1 max-w-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="font-semibold text-green-700 text-sm">Summarizing your document...</span>
          </div>
          <div className="mt-1 text-green-500 text-xs">AI is reading and summarizing your uploaded file.</div>
        </div>
      </div>
    )}

    {(loadingMode === 'rag_search' || loadingMode === 'web_search_only') && (
      <div className="flex items-center space-x-3 py-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600">
          <span className="text-white text-sm">🤖</span>
        </div>
        <div className="flex items-center h-8">
          <span className="dot-animate bg-blue-400"></span>
          <span className="dot-animate bg-purple-500" style={{ animationDelay: '0.14s' }}></span>
          <span className="dot-animate bg-green-500" style={{ animationDelay: '0.28s' }}></span>
        </div>
        <style jsx>{`
          .dot-animate {
            display: inline-block;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            margin: 0 2px;
            animation: politeBounceDot 1s infinite;
          }
          @keyframes politeBounceDot {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-4px); }
          }
        `}</style>
      </div>
    )}
  </>
)}







          
          <div ref={messagesEndRef} />
        </div>

        {/* SIMPLIFIED Input Area - Clean & Minimal */}
        <div className={`${
          isDark 
            ? 'bg-gradient-to-t from-gray-900 via-gray-800/95 to-gray-800/90 border-gray-700/30' 
            : 'bg-gradient-to-t from-white via-gray-50/95 to-gray-50/90 border-gray-200/50'
        } border-t backdrop-blur-2xl`}>
          <div className="max-w-5xl mx-auto px-2 sm:px-6 py-4">
            {/* Upload Status - Enhanced */}
            {uploadStatus && (
              <div className={`mb-4 p-4 rounded-2xl text-sm font-medium ${
                uploadStatus.includes('✅') 
                  ? isDark
                    ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : uploadStatus.includes('❌')
                  ? isDark
                    ? 'bg-red-900/40 text-red-300 border border-red-500/30'
                    : 'bg-red-50 text-red-700 border border-red-200'
                  : isDark
                    ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
              } transition-all duration-300 animate-in slide-in-from-bottom backdrop-blur-sm shadow-lg`}>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                  <span>{uploadStatus}</span>
                </div>
              </div>
            )}
            
            {/* Main Input Container - Clean Design */}
            <div className={`relative p-2 rounded-3xl ${
              isDark 
                ? 'bg-gray-800/80 border-2 border-gray-600/50 shadow-2xl shadow-blue-500/10' 
                : 'bg-white/90 border-2 border-gray-200/80 shadow-2xl shadow-blue-500/5'
            } backdrop-blur-xl transition-all duration-300 hover:shadow-3xl ${
              isDark ? 'hover:border-blue-500/30' : 'hover:border-blue-300/50'
            }`}>
              
              <div className="flex items-center space-x-2 sm:space-x-3"> {/* Changed from items-end to items-center */}
                {/* Text Input - Simplified */}
                <div className="flex-1 relative group">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search..."
                    disabled={isLoading}
                    className={`w-full px-6 py-4 rounded-2xl resize-none transition-all duration-300 ${
                      isDark 
                        ? 'bg-gray-700/60 border-gray-600/40 text-white placeholder-gray-400 focus:bg-gray-700/80' 
                        : 'bg-gray-50/80 border-gray-300/60 text-gray-900 placeholder-gray-500 focus:bg-white/90'
                    } border-2 focus:outline-none focus:ring-4 ${
                      isDark 
                        ? 'focus:ring-blue-500/20 focus:border-blue-500/60' 
                        : 'focus:ring-blue-500/10 focus:border-blue-400/70'
                    } backdrop-blur-sm font-medium text-base leading-relaxed ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    rows={1}
                    style={{ minHeight: '56px', maxHeight: '200px' }}
                  />
                </div>
                
                {/* Upload Button */}
                <button
                  onClick={triggerFileUpload}
                  disabled={isUploading || isLoading}
                  className={`group relative overflow-hidden p-4 sm:px-6 sm:py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    isUploading || isLoading
                      ? isDark
                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200/70 text-gray-500 cursor-not-allowed'
                      : isDark 
                        ? 'bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-white hover:from-blue-500/90 hover:to-cyan-500/90 shadow-lg hover:shadow-blue-500/25' 
                        : 'bg-gradient-to-r from-purple-500/90 to-cyan-500/90 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/20'
                  } backdrop-blur-sm transform hover:scale-105 active:scale-95 hover:shadow-2xl`}
                   style={{ minHeight: '56px' }} 
                >
                  <div className="flex items-center space-x-0 sm:space-x-2">
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-sm">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl group-hover:scale-110 transition-transform duration-200">📎</span>
                        <span className="hidden sm:inline text-sm font-bold">Upload</span>
                      </>
                    )}
                  </div>
                </button>
                
                {/* Send Button */}
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className={`group relative overflow-hidden p-4 sm:px-6 sm:py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    isLoading || !input.trim()
                      ? isDark
                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200/70 text-gray-500 cursor-not-allowed'
                      : isDark 
                        ? 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white hover:from-blue-500/90 hover:to-cyan-500/90 shadow-lg hover:shadow-blue-500/25' 
                        : 'bg-gradient-to-r from-blue-500/90 to-cyan-500/90 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/20'
                  } backdrop-blur-sm transform hover:scale-105 active:scale-95 hover:shadow-2xl`}
                    style={{ minHeight: '56px' }}
                >
                  <div className="flex items-center space-x-0 sm:space-x-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="text-sm">Thinking...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl group-hover:scale-110 transition-transform duration-200">🚀</span>
                        <span className="hidden sm:inline text-sm font-bold">Chat</span>
                      </>
                    )
                    }
                  </div>
                </button>










              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}